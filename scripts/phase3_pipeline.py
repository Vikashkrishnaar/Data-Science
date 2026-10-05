from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

SEED = 42
OUT = Path(__file__).resolve().parents[1] / "artifacts" / "phase3"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(SEED)


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))


def make_sample_data() -> pd.DataFrame:
    assets = [f"TX-{i:03d}" for i in range(1, 13)]
    timestamps = pd.date_range("2025-01-01", periods=480, freq="h", tz="UTC")
    rows: list[pd.DataFrame] = []
    for asset_index, asset in enumerate(assets):
        t = np.arange(len(timestamps))
        phase = asset_index * 0.55
        asset_bias = (asset_index - 5.5) * 0.7
        daily = np.sin((t + phase) / 24 * 2 * np.pi)
        weekly = np.sin((t + phase) / 168 * 2 * np.pi)
        load = 66 + 12 * daily + 7 * weekly + asset_bias + RNG.normal(0, 4, len(t))
        ambient = 27 + 5 * np.sin((t + phase) / 24 * 2 * np.pi - 0.8) + RNG.normal(0, 1.4, len(t))
        voltage = 11000 + RNG.normal(0, 55, len(t)) - np.maximum(load - 78, 0) * 9
        current = 420 + load * 3.1 + RNG.normal(0, 11, len(t))
        power_factor = np.clip(0.98 - np.maximum(load - 70, 0) * 0.0019 + RNG.normal(0, 0.008, len(t)), 0.78, 0.995)
        oil = 51 + 0.35 * (load - 50) + 0.55 * (ambient - 25) + RNG.normal(0, 1.8, len(t))
        winding = oil + 9 + 0.11 * np.maximum(load - 65, 0) + RNG.normal(0, 1.2, len(t))
        frequency = 50 + RNG.normal(0, 0.025, len(t))
        temp_rate = np.r_[0, np.diff(oil)]
        stress = 0.055 * (load - 70) + 0.08 * (oil - 65) + 4.2 * (1 - power_factor) + 0.55 * np.maximum(temp_rate, 0)
        failure_probability = np.clip(0.004 + 0.12 * sigmoid(stress - 1.4), 0, 0.28)
        failure_event = RNG.binomial(1, failure_probability)
        frame = pd.DataFrame({
            "asset_id": asset,
            "timestamp": timestamps,
            "voltage_kv": voltage / 1000,
            "current_a": current,
            "load_pct": load,
            "ambient_temp_c": ambient,
            "oil_temp_c": oil,
            "winding_temp_c": winding,
            "power_factor": power_factor,
            "frequency_hz": frequency,
            "transformer_age_years": 4.5 + asset_index * 0.8,
            "maintenance_age_days": 18 + asset_index * 9 + (t / 720),
            "failure_event": failure_event,
        })
        rows.append(frame)
    df = pd.concat(rows, ignore_index=True)
    # Synthetic telemetry gaps: intentionally small and recorded in the report.
    for column, rate in [("oil_temp_c", 0.012), ("load_pct", 0.009), ("power_factor", 0.007)]:
        missing = RNG.random(len(df)) < rate
        df.loc[missing, column] = np.nan
    df = df.sort_values(["asset_id", "timestamp"]).reset_index(drop=True)
    df["failure_24h"] = np.nan
    for asset, group in df.groupby("asset_id", sort=False):
        idx = group.index.to_numpy()
        events = group["failure_event"].to_numpy()
        horizon = np.full(len(group), np.nan)
        for i in range(len(group)):
            future = events[i + 1 : i + 25]
            if len(future) == 24:
                horizon[i] = float(future.max())
        df.loc[idx, "failure_24h"] = horizon
    return df


def engineer_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    out = df.copy()
    group = out.groupby("asset_id", sort=False)
    out["load_pct_missing"] = out["load_pct"].isna().astype(int)
    out["oil_temp_c_missing"] = out["oil_temp_c"].isna().astype(int)
    out["power_factor_missing"] = out["power_factor"].isna().astype(int)
    out["load_pct_lag_1"] = group["load_pct"].shift(1)
    out["oil_temp_c_lag_1"] = group["oil_temp_c"].shift(1)
    out["load_pct_delta_1h"] = out["load_pct"] - out["load_pct_lag_1"]
    out["oil_temp_c_delta_3h"] = group["oil_temp_c"].diff(3)
    out["oil_temp_c_rate_1h"] = group["oil_temp_c"].diff(1)
    out["load_pct_roll_mean_6h"] = group["load_pct"].transform(lambda s: s.rolling(6, min_periods=3).mean())
    out["load_pct_roll_std_6h"] = group["load_pct"].transform(lambda s: s.rolling(6, min_periods=3).std())
    out["oil_temp_c_roll_mean_12h"] = group["oil_temp_c"].transform(lambda s: s.rolling(12, min_periods=4).mean())
    out["oil_temp_c_roll_max_12h"] = group["oil_temp_c"].transform(lambda s: s.rolling(12, min_periods=4).max())
    out["overload_count_12h"] = group["load_pct"].transform(lambda s: s.gt(90).rolling(12, min_periods=1).sum())
    out["load_temp_ratio"] = out["load_pct"] / out["oil_temp_c"].replace(0, np.nan)
    out["voltage_dev_kv"] = out["voltage_kv"] - out.groupby("asset_id")["voltage_kv"].transform(lambda s: s.expanding(min_periods=1).mean())
    feature_cols = [
        "voltage_kv", "current_a", "load_pct", "ambient_temp_c", "oil_temp_c", "winding_temp_c",
        "power_factor", "frequency_hz", "transformer_age_years", "maintenance_age_days",
        "load_pct_missing", "oil_temp_c_missing", "power_factor_missing", "load_pct_lag_1",
        "oil_temp_c_lag_1", "load_pct_delta_1h", "oil_temp_c_delta_3h", "oil_temp_c_rate_1h",
        "load_pct_roll_mean_6h", "load_pct_roll_std_6h", "oil_temp_c_roll_mean_12h",
        "oil_temp_c_roll_max_12h", "overload_count_12h", "load_temp_ratio", "voltage_dev_kv",
    ]
    return out, feature_cols


def metrics_for(model: Pipeline, X: pd.DataFrame, y: pd.Series) -> dict:
    probability = model.predict_proba(X)[:, 1]
    predicted = (probability >= 0.5).astype(int)
    matrix = confusion_matrix(y, predicted, labels=[0, 1]).tolist()
    return {
        "precision": round(float(precision_score(y, predicted, zero_division=0)), 4),
        "recall": round(float(recall_score(y, predicted, zero_division=0)), 4),
        "f1": round(float(f1_score(y, predicted, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y, probability)), 4),
        "pr_auc": round(float(average_precision_score(y, probability)), 4),
        "accuracy": round(float(accuracy_score(y, predicted)), 4),
        "confusion_matrix": matrix,
        "positive_rate": round(float(y.mean()), 4),
        "n": int(len(y)),
    }


def build_eda(df: pd.DataFrame) -> dict:
    numeric = ["voltage_kv", "current_a", "load_pct", "ambient_temp_c", "oil_temp_c", "winding_temp_c", "power_factor", "frequency_hz"]
    summary = {
        "rows": int(len(df)),
        "assets": int(df["asset_id"].nunique()),
        "features": numeric,
        "collection_start": df["timestamp"].min().isoformat(),
        "collection_end": df["timestamp"].max().isoformat(),
        "missing_fraction": {k: round(float(v), 4) for k, v in df[numeric].isna().mean().items()},
        "failure_events": int(df["failure_event"].sum()),
        "labelled_rows": int(df["failure_24h"].notna().sum()),
        "label_positive_rate": round(float(df.loc[df["failure_24h"].notna(), "failure_24h"].mean()), 4),
        "sampling_frequency": "1 hour (synthetic generation contract)",
        "note": "Synthetic data generated with seed 42; values are not measurements from a real transformer fleet.",
    }
    df.to_csv(OUT / "sample_sensor_data.csv", index=False)
    numeric_df = df[numeric].copy()
    plt.figure(figsize=(8, 4))
    counts = df.loc[df["failure_24h"].notna(), "failure_24h"].value_counts().sort_index()
    plt.bar(["No failure", "Failure"], [counts.get(0.0, 0), counts.get(1.0, 0)], color=["#5e8018", "#ee806a"])
    plt.title("Synthetic target balance (failure_24h)")
    plt.ylabel("Rows")
    plt.tight_layout()
    plt.savefig(OUT / "eda_target_balance.png", dpi=150)
    plt.close()
    plt.figure(figsize=(10, 4))
    sample = df[df["asset_id"].isin(["TX-001", "TX-006", "TX-012"])].copy()
    for asset, group in sample.groupby("asset_id"):
        plt.plot(group["timestamp"], group["oil_temp_c"].rolling(6, min_periods=1).mean(), label=asset, linewidth=1)
    plt.title("Synthetic trailing oil-temperature trend")
    plt.ylabel("°C")
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT / "eda_temperature_trends.png", dpi=150)
    plt.close()
    plt.figure(figsize=(8, 6))
    corr = numeric_df.corr(numeric_only=True)
    plt.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
    plt.colorbar(label="correlation")
    plt.xticks(range(len(corr.columns)), corr.columns, rotation=90, fontsize=7)
    plt.yticks(range(len(corr.index)), corr.index, fontsize=7)
    plt.title("Synthetic sensor correlation map")
    plt.tight_layout()
    plt.savefig(OUT / "eda_sensor_correlations.png", dpi=150)
    plt.close()
    with (OUT / "eda_summary.json").open("w") as handle:
        json.dump(summary, handle, indent=2)
    return summary


def write_feature_dictionary(feature_cols: list[str]) -> None:
    definitions = {
        "voltage_kv": ("raw", "Voltage measurement", "kV"),
        "current_a": ("raw", "Current measurement", "A"),
        "load_pct": ("raw", "Load percentage", "%"),
        "ambient_temp_c": ("raw", "Ambient temperature", "°C"),
        "oil_temp_c": ("raw", "Oil temperature", "°C"),
        "winding_temp_c": ("raw", "Winding temperature", "°C"),
        "power_factor": ("raw", "Power factor", "ratio"),
        "frequency_hz": ("raw", "Frequency", "Hz"),
        "transformer_age_years": ("context", "Asset age at observation", "years"),
        "maintenance_age_days": ("history", "Days since synthetic maintenance baseline", "days"),
        "load_pct_missing": ("missingness", "Load missing indicator", "0/1"),
        "oil_temp_c_missing": ("missingness", "Oil temperature missing indicator", "0/1"),
        "power_factor_missing": ("missingness", "Power factor missing indicator", "0/1"),
        "load_pct_lag_1": ("lag", "Previous load observation", "%"),
        "oil_temp_c_lag_1": ("lag", "Previous oil temperature observation", "°C"),
        "load_pct_delta_1h": ("change", "Current load minus previous load", "% points"),
        "oil_temp_c_delta_3h": ("change", "Oil temperature change over 3 hours", "°C"),
        "oil_temp_c_rate_1h": ("trend", "One-hour oil temperature difference", "°C/hour"),
        "load_pct_roll_mean_6h": ("rolling", "Trailing 6-hour load mean", "%"),
        "load_pct_roll_std_6h": ("rolling", "Trailing 6-hour load variability", "%"),
        "oil_temp_c_roll_mean_12h": ("rolling", "Trailing 12-hour oil temperature mean", "°C"),
        "oil_temp_c_roll_max_12h": ("rolling", "Trailing 12-hour oil temperature maximum", "°C"),
        "overload_count_12h": ("excursion", "Count of load readings above 90% in trailing 12 hours", "count"),
        "load_temp_ratio": ("interaction", "Load divided by oil temperature", "derived ratio"),
        "voltage_dev_kv": ("baseline", "Voltage deviation from expanding asset baseline", "kV"),
    }
    rows = []
    for feature in feature_cols:
        role, definition, unit = definitions[feature]
        rows.append({
            "feature_name": feature,
            "role": role,
            "definition": definition,
            "unit": unit,
            "available_at": "T or trailing history before T",
            "leakage_status": "PASS: generated without future rows",
            "synthetic_only": True,
        })
    pd.DataFrame(rows).to_csv(OUT / "feature_dictionary.csv", index=False)


def main() -> None:
    df = make_sample_data()
    eda = build_eda(df)
    engineered, feature_cols = engineer_features(df)
    labelled = engineered[engineered["failure_24h"].notna()].copy()
    labelled.to_csv(OUT / "processed_features.csv", index=False)
    write_feature_dictionary(feature_cols)

    unique_times = np.sort(labelled["timestamp"].unique())
    train_cut = unique_times[int(len(unique_times) * 0.60)]
    val_cut = unique_times[int(len(unique_times) * 0.80)]
    train = labelled[labelled["timestamp"] < train_cut]
    validation = labelled[(labelled["timestamp"] >= train_cut) & (labelled["timestamp"] < val_cut)]
    test = labelled[labelled["timestamp"] >= val_cut]
    X_train, y_train = train[feature_cols], train["failure_24h"].astype(int)
    X_val, y_val = validation[feature_cols], validation["failure_24h"].astype(int)
    X_test, y_test = test[feature_cols], test["failure_24h"].astype(int)
    numeric_features = feature_cols
    preprocessing = ColumnTransformer([
        ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median", add_indicator=False)), ("scaler", StandardScaler())]), numeric_features)
    ], remainder="drop")
    models = {
        "logistic_regression": Pipeline([("preprocess", preprocessing), ("model", LogisticRegression(max_iter=1200, class_weight="balanced", random_state=SEED))]),
        "random_forest": Pipeline([("preprocess", preprocessing), ("model", RandomForestClassifier(n_estimators=220, max_depth=9, min_samples_leaf=4, class_weight="balanced_subsample", random_state=SEED, n_jobs=-1))]),
    }
    all_metrics = {}
    risk_predictions = None
    for name, model in models.items():
        model.fit(X_train, y_train)
        all_metrics[name] = {
            "validation": metrics_for(model, X_val, y_val),
            "test": metrics_for(model, X_test, y_test),
        }
        if name == "random_forest":
            demo = test.sort_values("timestamp").groupby("asset_id", as_index=False).tail(1).copy()
            probabilities = model.predict_proba(demo[feature_cols])[:, 1]
            risk_predictions = pd.DataFrame({
                "asset_id": demo["asset_id"].to_numpy(),
                "timestamp": demo["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "risk_probability": probabilities,
            }).sort_values("risk_probability", ascending=False)
            risk_predictions["risk_band"] = pd.cut(risk_predictions["risk_probability"], [-np.inf, .35, .65, np.inf], labels=["Lower", "Moderate", "Elevated"]).astype(str)
            risk_predictions["inspection_priority"] = risk_predictions["risk_probability"].rank(method="first", ascending=False).astype(int).map(lambda x: f"P{x}")
            risk_predictions["health_status"] = risk_predictions["risk_band"].map({"Lower": "Healthy", "Moderate": "Stable", "Elevated": "Watch"})
            risk_predictions["synthetic_demo"] = True
            risk_predictions.to_json(OUT / "risk_predictions.json", orient="records", indent=2)
    metrics_payload = {
        "seed": SEED,
        "dataset": "synthetic_transformer_sensor_demo",
        "split": {"train_end": str(train_cut), "validation_end": str(val_cut), "train_rows": len(train), "validation_rows": len(validation), "test_rows": len(test)},
        "eda": eda,
        "models": all_metrics,
        "feature_count": len(feature_cols),
        "target": "failure_24h",
        "disclaimer": "Synthetic demonstration only; metrics and risk probabilities must not be interpreted as real utility performance.",
    }
    with (OUT / "metrics.json").open("w") as handle:
        json.dump(metrics_payload, handle, indent=2)
    report = [
        "# Phase 3 execution report — synthetic demonstration",
        "",
        "This report is generated from a fixed-seed synthetic transformer-sensor dataset. It demonstrates the pipeline only; it is not evidence of real transformer performance.",
        "",
        f"- Rows: {eda['rows']} | assets: {eda['assets']} | labelled rows: {eda['labelled_rows']}",
        f"- Synthetic failure_24h positive rate: {eda['label_positive_rate']}",
        f"- Engineered feature count: {len(feature_cols)}",
        f"- Chronological split rows: train={len(train)}, validation={len(validation)}, test={len(test)}",
        "",
        "## Test metrics",
        "",
        "| Model | Precision | Recall | F1 | ROC-AUC | PR-AUC | Accuracy |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for name, scores in all_metrics.items():
        m = scores["test"]
        report.append(f"| {name.replace('_', ' ').title()} | {m['precision']:.3f} | {m['recall']:.3f} | {m['f1']:.3f} | {m['roc_auc']:.3f} | {m['pr_auc']:.3f} | {m['accuracy']:.3f} |")
    report += [
        "",
        "## Outputs",
        "",
        "- `sample_sensor_data.csv` — generated raw telemetry and event fields.",
        "- `processed_features.csv` — leakage-safe trailing features and provisional target.",
        "- `feature_dictionary.csv` — generated dictionary for the synthetic feature table.",
        "- `eda_*.png` — target balance, temperature trend, and correlation map.",
        "- `metrics.json` — split manifest, metrics, and disclaimer.",
        "- `risk_predictions.json` — latest test-period synthetic risk rows from Random Forest.",
        "",
        "## Limitation",
        "",
        "Replace the synthetic generator with a documented real dataset before making any engineering, maintenance, or deployment claim.",
    ]
    (OUT / "PHASE_3_EXECUTION_REPORT.md").write_text("\n".join(report) + "\n")
    print(json.dumps({"output": str(OUT), "metrics": all_metrics, "risk_rows": int(0 if risk_predictions is None else len(risk_predictions))}, indent=2, default=str))


if __name__ == "__main__":
    main()
