from __future__ import annotations

import json
import re
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "real" / "uk_power_station_dga_2010_2015"
VALIDATED = DATASET / "validated"
OUT = ROOT / "artifacts" / "phase7_real"
OUT.mkdir(parents=True, exist_ok=True)

GASES = ["Hydrogen", "Methane", "Acetylene", "Ethylene", "Ethane", "Carbon Monoxide", "Carbon Dioxide", "Oxygen", "Water"]


def load_real_dga() -> pd.DataFrame:
    path = VALIDATED / "normalized_dga_long.csv.gz"
    df = pd.read_csv(path, compression="gzip", parse_dates=["timestamp"])
    required = {"transformer_id", "timestamp", "phase", "gas", "ppm"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Required normalized columns missing: {sorted(missing)}")
    df["ppm"] = pd.to_numeric(df["ppm"], errors="coerce")
    df = df[df["gas"].isin(GASES)].dropna(subset=["transformer_id", "timestamp", "gas", "ppm"]).copy()
    if (df["ppm"] < 0).any():
        raise ValueError("Negative ppm values found after ingestion")
    return df.sort_values(["transformer_id", "timestamp", "gas", "phase"])


def build_features(dga: pd.DataFrame) -> pd.DataFrame:
    # Aggregate phase-wise readings at transformer/timestamp/gas level.
    by_gas = dga.groupby(["transformer_id", "timestamp", "gas"], as_index=False).agg(
        ppm_mean=("ppm", "mean"), ppm_max=("ppm", "max"), phase_count=("phase", "nunique")
    )
    wide = by_gas.pivot_table(index=["transformer_id", "timestamp"], columns="gas", values="ppm_mean", aggfunc="mean")
    wide.columns = [f"{str(c).lower().replace(' ', '_')}_ppm" for c in wide.columns]
    wide = wide.reset_index().sort_values(["transformer_id", "timestamp"])

    # Features use only current or trailing information within each transformer.
    feature_cols = []
    for gas in GASES:
        key = f"{gas.lower().replace(' ', '_')}_ppm"
        if key not in wide.columns:
            continue
        group = wide.groupby("transformer_id", group_keys=False)[key]
        wide[f"{key}_log1p"] = (wide[key].clip(lower=0) + 1).map(lambda x: __import__("math").log(x))
        wide[f"{key}_delta"] = group.diff()
        wide[f"{key}_roll_mean_3"] = group.transform(lambda s: s.rolling(3, min_periods=2).mean())
        wide[f"{key}_roll_std_3"] = group.transform(lambda s: s.rolling(3, min_periods=2).std())
        feature_cols.extend([key, f"{key}_log1p", f"{key}_delta", f"{key}_roll_mean_3", f"{key}_roll_std_3"])
    wide["observed_gas_count"] = wide[[c for c in wide.columns if c.endswith("_ppm") and not c.endswith("_log1p")]].notna().sum(axis=1)
    wide["missing_gas_count"] = len(GASES) - wide["observed_gas_count"]
    wide["hours_since_previous_record"] = wide.groupby("transformer_id")["timestamp"].diff().dt.total_seconds().div(3600)
    return wide


def main() -> None:
    dga = load_real_dga()
    features = build_features(dga)
    features.to_csv(OUT / "real_feature_table.csv.gz", index=False, compression="gzip")

    gas_summary = dga.groupby("gas").agg(
        measurements=("ppm", "size"), transformers=("transformer_id", "nunique"),
        mean_ppm=("ppm", "mean"), median_ppm=("ppm", "median"), p95_ppm=("ppm", lambda s: s.quantile(.95)),
        missing_not_applicable=("ppm", lambda s: int(s.isna().sum())),
    ).reset_index()
    gas_summary.to_csv(OUT / "real_eda_gas_summary.csv", index=False)
    asset_summary = dga.groupby("transformer_id").agg(
        measurements=("ppm", "size"), gases=("gas", "nunique"), phases=("phase", "nunique"),
        date_start=("timestamp", "min"), date_end=("timestamp", "max"),
    ).reset_index()
    asset_summary.to_csv(OUT / "real_eda_asset_summary.csv", index=False)

    plt.figure(figsize=(9, 4))
    gas_summary.sort_values("measurements").plot.barh(x="gas", y="measurements", legend=False, color="#365d4a")
    plt.title("Real DGA dataset — measurements by gas")
    plt.xlabel("Non-null measurements")
    plt.tight_layout()
    plt.savefig(OUT / "real_eda_measurements_by_gas.png", dpi=150)
    plt.close()

    plt.figure(figsize=(10, 4))
    trend = dga[dga["gas"].isin(["Hydrogen", "Methane", "Acetylene", "Ethylene"])].copy()
    trend["month"] = trend["timestamp"].dt.to_period("M").dt.to_timestamp()
    trend = trend.groupby(["month", "gas"], as_index=False)["ppm"].median()
    for gas, group in trend.groupby("gas"):
        plt.plot(group["month"], group["ppm"], label=gas)
    plt.title("Real DGA dataset — monthly median selected gases")
    plt.ylabel("ppm")
    plt.legend(ncol=2)
    plt.tight_layout()
    plt.savefig(OUT / "real_eda_selected_gas_trends.png", dpi=150)
    plt.close()

    target_columns = [c for c in dga.columns if re.search(r"fail|fault|health|label|event|outage|trip", c, re.I)]
    report = {
        "dataset": "UK Power Station Transformer DGA 2010-2015",
        "rows_after_cleaning": int(len(dga)),
        "feature_rows": int(len(features)),
        "transformers": int(dga["transformer_id"].nunique()),
        "timestamp_start": dga["timestamp"].min().isoformat(),
        "timestamp_end": dga["timestamp"].max().isoformat(),
        "feature_columns": [c for c in features.columns if c not in ["transformer_id", "timestamp"]],
        "candidate_target_columns_found": target_columns,
        "real_target_available": False,
        "train_test_split_performed": False,
        "model_comparison_performed": False,
        "real_metrics_available": False,
        "error_analysis_available": False,
        "explainability_available": False,
        "stop_reason": "No failure, fault, health, maintenance-outcome, outage, or event label exists in the validated source. A supervised real target cannot be defined without inventing labels or joining an authoritative external label table.",
        "approved_next_options": [
            "Obtain an authoritative transformer fault/event label table with a documented join key.",
            "Approve a real DGA anomaly-detection objective without supervised target metrics.",
            "Approve a DGA diagnostic classification target only if labels are sourced and documented separately."
        ],
    }
    (OUT / "phase7_target_gate.json").write_text(json.dumps(report, indent=2))

    markdown = f"""# Phase 7 — Real model pipeline status\n\n## Completed on the validated real data\n\n- Loaded the normalized compressed DGA table with schema checks for `transformer_id`, `timestamp`, `phase`, `gas`, and `ppm`.\n- Removed invalid rows with missing required fields and rejected negative ppm values.\n- Aggregated phase readings by transformer, timestamp, and gas.\n- Created leakage-safe current and trailing features: log-transformed concentrations, first differences, trailing mean/std windows, observed/missing gas counts, and time since the previous record.\n- Produced real EDA summaries for gases and transformers, plus measurement-count and selected-gas trend plots.\n\nDataset rows after cleaning: **{len(dga):,}**. Feature rows: **{len(features):,}**. Transformers: **{dga['transformer_id'].nunique()}**.\n\n## Approval gate: real target unavailable\n\nThe validated source contains no failure, fault, health, maintenance-outcome, outage, or event label. Therefore a real supervised target cannot be created honestly, and the following steps were intentionally **not** run:\n\n- Real train/test split for supervised prediction\n- Model comparison\n- Real precision, recall, F1, ROC-AUC, PR-AUC, calibration, or confusion matrix\n- Supervised error analysis\n- Supervised explainability\n\nThis is a required stop condition, not a pipeline failure. Creating `failure_24h` from gas thresholds would produce a proxy/anomaly label, not a real failure target, and must not be presented as a real failure model.\n\n## Next decision\n\nChoose one of the documented options in `phase7_target_gate.json`: obtain authoritative external labels, approve an unsupervised DGA anomaly objective, or redefine the project as DGA diagnostic classification after a labelled source is acquired.\n\n## Outputs\n\n- `real_feature_table.csv.gz` — normalized, feature-engineered real observations\n- `real_eda_gas_summary.csv` — gas-level EDA\n- `real_eda_asset_summary.csv` — transformer-level EDA\n- `real_eda_measurements_by_gas.png` — measurement coverage chart\n- `real_eda_selected_gas_trends.png` — selected-gas trend chart\n- `phase7_target_gate.json` — target and modelling decision record\n"""
    (OUT / "PHASE_7_REAL_MODEL_STATUS.md").write_text(markdown)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
