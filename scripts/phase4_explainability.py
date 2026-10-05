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
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

SEED = 42
ROOT = Path(__file__).resolve().parents[1]
IN = ROOT / "artifacts" / "phase3"
OUT = ROOT / "artifacts" / "phase4"
OUT.mkdir(parents=True, exist_ok=True)


def band_for_health(score: float) -> str:
    if score >= 75:
        return "Healthy"
    if score >= 50:
        return "Watch"
    return "Action"


def recommendation_for(row: pd.Series) -> list[str]:
    recs: list[str] = []
    risk = float(row["risk_probability"])
    if risk >= 0.65:
        recs.append("Prioritise engineering inspection of recent operating history and maintenance records.")
    elif risk >= 0.45:
        recs.append("Review recent trend windows and confirm data quality before changing inspection cadence.")
    else:
        recs.append("Continue routine monitoring; retain this row as a comparison baseline.")
    if float(row["load_pct"]) >= 85 or float(row["overload_count_12h"]) > 0:
        recs.append("Review loading profile and verify the documented overload threshold and duration.")
    if float(row["oil_temp_c"]) >= 70 or float(row["winding_temp_c"]) >= 82:
        recs.append("Review thermal trend and sensor plausibility with an engineer; do not infer a fault from one reading.")
    if int(row["missing_signal_count"]) > 0:
        recs.append("Resolve missing or stale telemetry before relying on the ranking for a maintenance decision.")
    return recs


def main() -> None:
    data = pd.read_csv(IN / "processed_features.csv", parse_dates=["timestamp"])
    dictionary = pd.read_csv(IN / "feature_dictionary.csv")
    feature_cols = dictionary["feature_name"].tolist()
    unique_times = np.sort(data["timestamp"].unique())
    train_cut = unique_times[int(len(unique_times) * 0.60)]
    val_cut = unique_times[int(len(unique_times) * 0.80)]
    train = data[data["timestamp"] < train_cut].copy()
    test = data[data["timestamp"] >= val_cut].copy()
    X_train, y_train = train[feature_cols], train["failure_24h"].astype(int)
    X_test, y_test = test[feature_cols], test["failure_24h"].astype(int)
    preprocessing = ColumnTransformer([
        ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), feature_cols)
    ], remainder="drop")
    logistic = Pipeline([("preprocess", preprocessing), ("model", LogisticRegression(max_iter=1200, class_weight="balanced", random_state=SEED))])
    forest = Pipeline([("preprocess", preprocessing), ("model", RandomForestClassifier(n_estimators=220, max_depth=9, min_samples_leaf=4, class_weight="balanced_subsample", random_state=SEED, n_jobs=-1))])
    logistic.fit(X_train, y_train)
    forest.fit(X_train, y_train)

    # Global explanation: tree importance plus held-out permutation importance.
    forest_importance = forest.named_steps["model"].feature_importances_
    permutation = permutation_importance(forest, X_test, y_test, scoring="average_precision", n_repeats=5, random_state=SEED, n_jobs=-1)
    global_df = pd.DataFrame({
        "feature": feature_cols,
        "random_forest_importance": forest_importance,
        "permutation_importance_pr_auc_mean": permutation.importances_mean,
        "permutation_importance_pr_auc_std": permutation.importances_std,
    }).sort_values("random_forest_importance", ascending=False)
    global_df["rank"] = np.arange(1, len(global_df) + 1)
    global_df.to_csv(OUT / "explainability_global.csv", index=False)

    # Local reason codes use transparent logistic contributions, not fabricated SHAP values.
    demo = test.sort_values("timestamp").groupby("asset_id", as_index=False).tail(1).copy()
    demo["risk_probability"] = forest.predict_proba(demo[feature_cols])[:, 1]
    transformed_demo = logistic.named_steps["preprocess"].transform(demo[feature_cols])
    coeffs = logistic.named_steps["model"].coef_[0]
    local_rows = []
    local_reason_codes: list[dict] = []
    for row_index, (_, row) in enumerate(demo.iterrows()):
        contributions = transformed_demo[row_index] * coeffs
        explanation = pd.DataFrame({"feature": feature_cols, "contribution": contributions, "value": row[feature_cols].to_numpy()})
        explanation["abs_contribution"] = explanation["contribution"].abs()
        top = explanation.sort_values("abs_contribution", ascending=False).head(5)
        local_reason_codes.append({
            "asset_id": row["asset_id"],
            "timestamp": row["timestamp"].isoformat(),
            "risk_probability": round(float(row["risk_probability"]), 4),
            "top_factors": [
                {"feature": item["feature"], "contribution": round(float(item["contribution"]), 4), "direction": "raises risk" if item["contribution"] >= 0 else "reduces risk"}
                for _, item in top.iterrows()
            ],
            "explainability_method": "standardised logistic coefficient contribution; not SHAP",
        })
        for _, item in top.iterrows():
            local_rows.append({"asset_id": row["asset_id"], "timestamp": row["timestamp"], "feature": item["feature"], "contribution": item["contribution"], "direction": "raises risk" if item["contribution"] >= 0 else "reduces risk"})
    pd.DataFrame(local_rows).to_csv(OUT / "explainability_local.csv", index=False)
    (OUT / "explainability_local.json").write_text(json.dumps(local_reason_codes, indent=2, default=str))

    # Fleet health score: an explicit demo heuristic that combines model risk, loading, thermal state, and data quality.
    demo["missing_signal_count"] = demo[["load_pct_missing", "oil_temp_c_missing", "power_factor_missing"]].sum(axis=1).astype(int)
    demo["risk_component"] = 100 * (1 - demo["risk_probability"])
    demo["thermal_component"] = np.clip(100 - np.maximum(demo["oil_temp_c"] - 65, 0) * 2.0 - np.maximum(demo["winding_temp_c"] - 80, 0) * 1.5, 0, 100)
    demo["loading_component"] = np.clip(100 - np.maximum(demo["load_pct"] - 80, 0) * 2.5, 0, 100)
    demo["data_quality_component"] = np.clip(100 - demo["missing_signal_count"] * 20, 0, 100)
    demo["health_score"] = (0.55 * demo["risk_component"] + 0.2 * demo["thermal_component"] + 0.2 * demo["loading_component"] + 0.05 * demo["data_quality_component"]).round(1)
    demo["health_band"] = demo["health_score"].map(band_for_health)
    demo["risk_band"] = pd.cut(demo["risk_probability"], [-np.inf, .35, .65, np.inf], labels=["Lower", "Moderate", "Elevated"]).astype(str)
    demo = demo.sort_values(["risk_probability", "health_score"], ascending=[False, True]).reset_index(drop=True)
    demo["inspection_priority"] = [f"P{i}" for i in range(1, len(demo) + 1)]
    demo["maintenance_suggestions"] = demo.apply(recommendation_for, axis=1)
    health_cols = ["asset_id", "timestamp", "risk_probability", "risk_band", "health_score", "health_band", "inspection_priority", "risk_component", "thermal_component", "loading_component", "data_quality_component", "missing_signal_count", "load_pct", "oil_temp_c", "winding_temp_c", "overload_count_12h"]
    health = demo[health_cols].copy()
    health.to_csv(OUT / "health_assessment.csv", index=False)
    recommendations = demo[["asset_id", "timestamp", "risk_band", "health_band", "inspection_priority", "risk_probability", "maintenance_suggestions"]].copy()
    recommendations["risk_probability"] = recommendations["risk_probability"].round(4)
    recommendations.to_json(OUT / "maintenance_recommendations.json", orient="records", indent=2, date_format="iso", default_handler=str)
    health.to_json(OUT / "fleet_prioritisation.json", orient="records", indent=2, date_format="iso")

    plt.figure(figsize=(9, 5))
    top = global_df.head(10).sort_values("random_forest_importance")
    plt.barh(top["feature"], top["random_forest_importance"], color="#d7ff57")
    plt.title("Synthetic demo — Random Forest global feature importance")
    plt.xlabel("Mean decrease in impurity")
    plt.tight_layout()
    plt.savefig(OUT / "explainability_feature_importance.png", dpi=150, facecolor="#10130f")
    plt.close()
    plt.figure(figsize=(7, 4))
    health["health_band"].value_counts().reindex(["Healthy", "Watch", "Action"], fill_value=0).plot(kind="bar", color=["#d7ff57", "#e6b45a", "#ee806a"])
    plt.title("Synthetic demo — fleet health assessment bands")
    plt.ylabel("Assets")
    plt.tight_layout()
    plt.savefig(OUT / "health_band_distribution.png", dpi=150)
    plt.close()

    top_features = global_df.head(5)["feature"].tolist()
    fleet_counts = health["health_band"].value_counts().to_dict()
    summary = {
        "dataset": "synthetic_transformer_sensor_demo",
        "seed": SEED,
        "assets_prioritised": int(len(health)),
        "explainability": {"global_method": "Random Forest impurity + held-out permutation importance", "local_method": "standardised Logistic Regression coefficient contributions", "shap_available": False, "top_features": top_features},
        "health_score": {"formula": "0.55 risk component + 0.20 thermal component + 0.20 loading component + 0.05 data-quality component", "bands": {"Healthy": "75–100", "Watch": "50–74.9", "Action": "0–49.9"}, "counts": fleet_counts},
        "prioritisation": {"sort": "risk probability descending, then health score ascending", "priority_range": f"P1–P{len(health)}"},
        "disclaimer": "Synthetic demonstration only. The health score is a transparent prototype heuristic, not an engineering standard or diagnosis.",
    }
    (OUT / "phase4_summary.json").write_text(json.dumps(summary, indent=2))
    report = [
        "# Phase 4 execution report — synthetic explainability and fleet decision support",
        "",
        "This report extends the fixed-seed Phase 3 synthetic transformer-sensor demo. It demonstrates explainability, health scoring, maintenance-oriented suggestions, and fleet prioritisation; it is not evidence about real assets.",
        "",
        f"- Assets prioritised: {len(health)}",
        f"- Global explanation: Random Forest impurity and held-out permutation importance",
        f"- Local explanation: standardised Logistic Regression coefficient contributions (SHAP not installed; no SHAP values are claimed)",
        f"- Top global features: {', '.join(top_features)}",
        f"- Health score bands: Healthy 75–100, Watch 50–74.9, Action 0–49.9",
        "",
        "## Fleet output",
        "",
        "The fleet table ranks synthetic assets by Random Forest risk probability and then by lower health score. Each row includes the components behind the health heuristic and suggestions that are intended to prompt engineering review, not autonomous maintenance.",
        "",
        "## Limitation",
        "",
        "Replace the synthetic data and demo thresholds with documented real data, domain-reviewed health definitions, calibrated probabilities, and engineering approval before any operational use.",
    ]
    (OUT / "PHASE_4_EXPLAINABILITY_HEALTH_REPORT.md").write_text("\n".join(report) + "\n")
    print(json.dumps({"output": str(OUT), "top_features": top_features, "fleet_counts": fleet_counts}, indent=2, default=str))


if __name__ == "__main__":
    main()
