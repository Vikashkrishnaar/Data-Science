from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import RobustScaler

ROOT = Path(__file__).resolve().parents[1]
IN = ROOT / "artifacts" / "phase7_real" / "real_feature_table.csv.gz"
OUT = ROOT / "artifacts" / "phase9b_real_anomaly"
OUT.mkdir(parents=True, exist_ok=True)

GASES = ["hydrogen", "methane", "acetylene", "ethylene", "ethane", "carbon_monoxide", "carbon_dioxide", "oxygen", "water"]


def load_features() -> pd.DataFrame:
    df = pd.read_csv(IN, compression="gzip", parse_dates=["timestamp"])
    required = {"transformer_id", "timestamp", "observed_gas_count", "missing_gas_count", "hours_since_previous_record"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required feature columns: {sorted(missing)}")
    return df.sort_values(["transformer_id", "timestamp"]).reset_index(drop=True)


def build_anomaly_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    # Current/trailing DGA features only; no future observations or event labels are used.
    selected = []
    for gas in GASES:
        for suffix in ("_ppm_log1p", "_ppm_delta", "_ppm_roll_std_3"):
            name = f"{gas}{suffix}"
            if name in df.columns:
                selected.append(name)
    selected += ["observed_gas_count", "missing_gas_count", "hours_since_previous_record"]
    x = df[selected].copy()
    # Impute within transformer where possible, then global medians; all transformations are descriptive.
    x = x.groupby(df["transformer_id"], group_keys=False).apply(lambda block: block.fillna(block.median(numeric_only=True)), include_groups=False)
    x = x.reset_index(drop=True)
    x = x.fillna(x.median(numeric_only=True)).replace([np.inf, -np.inf], np.nan)
    x = x.fillna(0.0)
    return x, selected


def robust_reason_codes(df: pd.DataFrame) -> pd.DataFrame:
    reason_cols = [c for c in df.columns if c.endswith("_ppm_log1p") or c.endswith("_ppm_delta") or c.endswith("_ppm_roll_std_3")]
    parts = []
    for transformer, group in df.groupby("transformer_id", sort=False):
        values = group[reason_cols].copy()
        med = values.median()
        mad = (values - med).abs().median().replace(0, np.nan)
        z = ((values - med).abs() / (1.4826 * mad)).replace([np.inf, -np.inf], np.nan).fillna(0)
        top = z.idxmax(axis=1)
        magnitude = z.max(axis=1)
        parts.append(pd.DataFrame({"row_index": group.index, "reason_code": top.values, "reason_strength": magnitude.values}))
    return pd.concat(parts, ignore_index=True).set_index("row_index").sort_index()


def main() -> None:
    df = load_features()
    x, selected = build_anomaly_features(df)
    imputer = SimpleImputer(strategy="median")
    scaler = RobustScaler()
    x_scaled = scaler.fit_transform(imputer.fit_transform(x))
    model = IsolationForest(
        n_estimators=200,
        max_samples=min(10000, len(df)),
        contamination=0.05,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(x_scaled)
    raw_score = -model.decision_function(x_scaled)
    score = (raw_score - raw_score.min()) / (raw_score.max() - raw_score.min() + 1e-12)
    result = df[["transformer_id", "timestamp"]].copy()
    result["anomaly_score"] = score
    result["anomaly_percentile"] = pd.Series(score).rank(pct=True).to_numpy() * 100
    threshold = float(np.quantile(score, 0.95))
    result["anomaly_flag_top_5pct"] = result["anomaly_score"] >= threshold
    reasons = robust_reason_codes(df)
    result["reason_code"] = reasons["reason_code"].to_numpy()
    result["reason_strength"] = reasons["reason_strength"].to_numpy()
    result["observed_gas_count"] = df["observed_gas_count"].to_numpy()
    result["missing_gas_count"] = df["missing_gas_count"].to_numpy()
    result["hours_since_previous_record"] = df["hours_since_previous_record"].to_numpy()
    result.to_csv(OUT / "real_dga_anomaly_scores.csv.gz", index=False, compression="gzip")

    top = result.sort_values(["anomaly_score", "transformer_id", "timestamp"], ascending=[False, True, True]).head(1000)
    top.to_csv(OUT / "top_1000_dga_anomalies.csv", index=False)
    asset = result.groupby("transformer_id").agg(
        observations=("anomaly_score", "size"),
        mean_anomaly_score=("anomaly_score", "mean"),
        p95_anomaly_score=("anomaly_score", lambda s: s.quantile(.95)),
        top5_proxy_rate=("anomaly_flag_top_5pct", "mean"),
        max_anomaly_score=("anomaly_score", "max"),
        strongest_reason=("reason_code", lambda s: s.value_counts().index[0]),
    ).reset_index().sort_values("p95_anomaly_score", ascending=False)
    asset.to_csv(OUT / "asset_anomaly_summary.csv", index=False)
    monthly = result.assign(month=result["timestamp"].dt.to_period("M").dt.to_timestamp()).groupby("month").agg(
        observations=("anomaly_score", "size"),
        mean_anomaly_score=("anomaly_score", "mean"),
        top5_proxy_rate=("anomaly_flag_top_5pct", "mean"),
        max_anomaly_score=("anomaly_score", "max"),
    ).reset_index()
    monthly.to_csv(OUT / "monthly_anomaly_summary.csv", index=False)
    reason_summary = result[result["anomaly_flag_top_5pct"]].groupby("reason_code").size().sort_values(ascending=False).rename("top5_count").reset_index()
    reason_summary["share_of_top5"] = reason_summary["top5_count"] / reason_summary["top5_count"].sum()
    reason_summary.to_csv(OUT / "anomaly_reason_summary.csv", index=False)

    plt.figure(figsize=(10, 4.5))
    asset.sort_values("p95_anomaly_score").plot.barh(x="transformer_id", y="p95_anomaly_score", legend=False, color="#c56b43")
    plt.title("UK DGA anomaly proxy — transformer p95 scores")
    plt.xlabel("Isolation Forest anomaly score (scaled 0–1)")
    plt.tight_layout()
    plt.savefig(OUT / "asset_anomaly_p95.png", dpi=160)
    plt.close()

    plt.figure(figsize=(11, 4.5))
    plt.plot(monthly["month"], monthly["top5_proxy_rate"] * 100, color="#a75b3f", linewidth=1.5)
    plt.axhline(5, color="#55634d", linestyle="--", linewidth=1, label="expected proxy rate")
    plt.title("UK DGA anomaly proxy — monthly top-5% rate")
    plt.ylabel("Rows flagged by proxy (%)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(OUT / "monthly_anomaly_proxy_rate.png", dpi=160)
    plt.close()

    report = {
        "dataset": "UK Power Station Transformer DGA 2010-2015",
        "objective": "Unsupervised DGA anomaly screening and explicitly labelled anomaly proxy analysis",
        "input_feature_table": str(IN.relative_to(ROOT)),
        "observations_scored": int(len(result)),
        "transformers": int(result["transformer_id"].nunique()),
        "timestamp_start": result["timestamp"].min().isoformat(),
        "timestamp_end": result["timestamp"].max().isoformat(),
        "features_used": selected,
        "algorithm": "IsolationForest(n_estimators=200, max_samples=10000, contamination=0.05, random_state=42)",
        "proxy_definition": "anomaly_flag_top_5pct = rows at or above the 95th percentile of the fitted unsupervised score",
        "proxy_rate": float(result["anomaly_flag_top_5pct"].mean()),
        "real_failure_target": False,
        "supervised_model_trained": False,
        "failure_metrics_available": False,
        "interpretation": "Anomaly score indicates unusualness relative to the fitted DGA feature distribution. The top-5% flag is an analysis proxy, not a failure, fault, health, maintenance, or outage label.",
        "limitations": [
            "No failure or fault outcomes exist in the source for validation.",
            "Isolation Forest scores are distribution-relative and not probabilities of failure.",
            "Proxy threshold is a descriptive 95th-percentile rule, not an engineering threshold.",
            "Rows are not independent because each transformer contributes repeated observations.",
            "Missingness, maintenance/oil-processing resets, and regime changes can create anomalies.",
            "Top reason codes are robust deviation indicators, not causal explanations.",
        ],
        "next_approval_options": [
            "Review the proxy/anomaly outputs with a domain expert.",
            "Join an authoritative fault/event table before supervised modelling.",
            "Define and document an engineering DGA alarm objective if thresholds are approved.",
        ],
    }
    (OUT / "phase9b_anomaly_summary.json").write_text(json.dumps(report, indent=2))
    markdown = f"""# Phase 9B — Real UK DGA anomaly and proxy analysis\n\n## Approved objective\n\nThe approved path is **unsupervised/proxy analysis** of the real UK Power Station Transformer DGA dataset. This is not supervised failure prediction. No failure labels were invented and no future-failure target was trained.\n\n## Execution\n\n- Observations scored: **{len(result):,}**\n- Transformers: **{result['transformer_id'].nunique()}**\n- Coverage: **{result['timestamp'].min().date()} to {result['timestamp'].max().date()}**\n- Algorithm: `IsolationForest(n_estimators=200, max_samples=10000, contamination=0.05, random_state=42)`\n- Proxy: rows at or above the 95th percentile of the unsupervised score\n- Proxy rate: **{result['anomaly_flag_top_5pct'].mean() * 100:.2f}%**\n\n## Features\n\nThe model used current/trailing DGA features from the validated Phase 7 feature table: log-transformed gas concentrations, first differences, trailing variability, observed/missing gas counts, and hours since the previous record. Missing values were imputed using transformer medians with a global-median fallback, then robust-scaled.\n\n## Interpretation boundary\n\nAnomaly score means **unusual relative to the fitted DGA feature distribution**. The top-5% flag is a descriptive analysis proxy, not a failure, fault, health, maintenance, outage, or probability-of-failure label. High scores may reflect unusual gas behaviour, data gaps, maintenance/oil-processing resets, regime changes, or measurement quality issues.\n\n## Outputs\n\n- `real_dga_anomaly_scores.csv.gz` — scored real feature rows\n- `top_1000_dga_anomalies.csv` — review queue for the highest-scoring rows\n- `asset_anomaly_summary.csv` — transformer-level p95 and proxy-rate summary\n- `monthly_anomaly_summary.csv` — time summary\n- `anomaly_reason_summary.csv` — robust deviation reason-code counts within top-5% rows\n- `asset_anomaly_p95.png` — transformer comparison\n- `monthly_anomaly_proxy_rate.png` — monthly proxy-rate chart\n- `phase9b_anomaly_summary.json` — reproducibility and limitations record\n\n## What was not done\n\n- No supervised train/test split\n- No failure/fault target construction\n- No precision, recall, F1, ROC-AUC, PR-AUC, calibration, or confusion matrix\n- No claim that anomalous rows are failed or failing transformers\n\n## Next approval gate\n\nReview the anomaly queue and transformer summaries with engineering context. Before making maintenance claims or supervised predictions, obtain an authoritative event/fault table or approve a documented engineering alarm objective.\n"""
    (OUT / "PHASE_9B_REAL_DGA_ANOMALY_REPORT.md").write_text(markdown)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
