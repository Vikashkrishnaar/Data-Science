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
RAW = DATASET / "raw" / "Lewis et al 2022 DGA data"
OUT = DATASET / "validated"
OUT.mkdir(parents=True, exist_ok=True)

SOURCE = {
    "title": "UK Power Station Transformer Dissolved Gas Analysis Data (2010-2015)",
    "doi": "10.5281/zenodo.5796243",
    "record_url": "https://zenodo.org/records/5796243",
    "download_url": "https://zenodo.org/api/records/5796243/files/Lewis_et_al_2022_DGA_data.zip/content",
    "license": "CC BY 4.0",
    "creators": ["Zoë M. Lewis", "James A. Wild", "Matthew Allcock"],
    "provider_context": "Data provided by EDF Energy Nuclear Generation; affiliations listed on the Zenodo record.",
    "dataset_scope": "Dissolved gas analysis records from 13 UK power-station transformers, with timestamps in UTC and gas concentrations in ppm.",
    "citation_note": "Cite Lewis et al. when using these data and retain the CC BY 4.0 attribution.",
}


def parse_measurement_column(column: str) -> tuple[str, str] | None:
    if column == "Timestamp":
        return None
    if ":" in column:
        phase, gas = column.split(":", 1)
        phase = phase.strip()
        gas = gas.strip()
    else:
        phase, gas = "MAIN", column.strip()
    gas = re.sub(r"\s*\(ppm\)\s*$", "", gas, flags=re.I).strip()
    if not gas or phase.lower().startswith("peripherals") or gas.lower().startswith("analog"):
        return None
    return phase, gas


def validate_file(path: Path) -> tuple[pd.DataFrame, dict]:
    transformer = re.search(r"Transformer_([A-Z]+)", path.stem).group(1)
    df = pd.read_csv(path)
    timestamps = pd.to_datetime(df["Timestamp"], dayfirst=True, errors="coerce")
    value_columns = [c for c in df.columns if parse_measurement_column(c)]
    long = df[["Timestamp", *value_columns]].copy()
    long["timestamp"] = timestamps
    long = long.drop(columns=["Timestamp"])
    melted = long.melt(id_vars=["timestamp"], var_name="source_column", value_name="ppm")
    melted[["phase", "gas"]] = melted["source_column"].apply(lambda c: pd.Series(parse_measurement_column(c)))
    melted["transformer_id"] = f"TX-{transformer}"
    melted["ppm"] = pd.to_numeric(melted["ppm"], errors="coerce")
    normalized = melted[["transformer_id", "timestamp", "phase", "gas", "ppm"]].dropna(subset=["timestamp", "ppm"]).sort_values("timestamp")
    intervals = timestamps.dropna().sort_values().diff().dropna().dt.total_seconds() / 3600
    summary = {
        "source_file": path.name,
        "transformer_id": f"TX-{transformer}",
        "raw_rows": int(len(df)),
        "raw_columns": int(len(df.columns)),
        "measurement_columns": int(len(value_columns)),
        "normalized_measurements": int(len(normalized)),
        "timestamp_parse_failures": int(timestamps.isna().sum()),
        "duplicate_timestamps": int(timestamps.duplicated().sum()),
        "date_start_utc": timestamps.min().isoformat(),
        "date_end_utc": timestamps.max().isoformat(),
        "median_sampling_interval_hours": float(intervals.median()) if len(intervals) else None,
        "raw_numeric_nonnull_fraction": round(float(df[value_columns].notna().mean().mean()), 4),
        "gases": sorted(normalized["gas"].unique().tolist()),
        "phases": sorted(normalized["phase"].unique().tolist()),
        "has_failure_or_fault_label": False,
        "has_load_or_temperature": False,
    }
    return normalized, summary


def main() -> None:
    all_long = []
    summaries = []
    for path in sorted(RAW.glob("*.csv")):
        normalized, summary = validate_file(path)
        all_long.append(normalized)
        summaries.append(summary)
    long_df = pd.concat(all_long, ignore_index=True).sort_values(["transformer_id", "timestamp", "phase", "gas"])
    long_df.to_csv(OUT / "normalized_dga_long.csv.gz", index=False, compression="gzip")
    summary_df = pd.DataFrame(summaries)
    summary_df.to_csv(OUT / "asset_quality_summary.csv", index=False)

    gas_counts = long_df.groupby("gas").size().sort_values(ascending=False)
    plt.figure(figsize=(8, 4))
    gas_counts.plot(kind="bar", color="#365d4a")
    plt.title("Real dataset — normalized DGA measurement count by gas")
    plt.ylabel("Non-null measurements")
    plt.tight_layout()
    plt.savefig(OUT / "gas_measurement_counts.png", dpi=150)
    plt.close()

    manifest = {
        "source": SOURCE,
        "validation": {
            "transformers": len(summaries),
            "raw_rows": int(summary_df["raw_rows"].sum()),
            "normalized_measurements": int(len(long_df)),
            "timestamp_parse_failures": int(summary_df["timestamp_parse_failures"].sum()),
            "duplicate_timestamps_total": int(summary_df["duplicate_timestamps"].sum()),
            "date_start_utc": summary_df["date_start_utc"].min(),
            "date_end_utc": summary_df["date_end_utc"].max(),
            "gases": sorted(long_df["gas"].unique().tolist()),
            "has_failure_or_fault_label": False,
            "has_load_or_temperature": False,
            "target_assessment": "failure_24h is not supported by this dataset as downloaded: no failure-event or fault-label column is present. Use DGA trend analysis, fault-proxy research with documented external labels, or health-index work only after an explicit target decision.",
        },
        "outputs": ["normalized_dga_long.csv.gz", "asset_quality_summary.csv", "gas_measurement_counts.png", "dataset_manifest.json", "PHASE_6_REAL_DATASET_VALIDATION.md"],
    }
    (OUT / "dataset_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))

    report = f"""# Phase 6 — Real dataset validation\n\n## Selected dataset\n\n**{SOURCE['title']}** is a real, publicly downloadable dataset published on Zenodo under **{SOURCE['license']}**. It contains dissolved-gas analysis records from 13 UK power-station transformers, with timestamps in UTC and gas concentrations in ppm. Source DOI: [{SOURCE['doi']}](https://doi.org/{SOURCE['doi']}).\n\nThe raw archive was downloaded from the Zenodo record and retained in this project under `data/real/uk_power_station_dga_2010_2015/`.\n\n## Validation results\n\n- Transformer files: **{len(summaries)}**\n- Raw rows: **{int(summary_df['raw_rows'].sum()):,}**\n- Normalized non-null DGA measurements: **{len(long_df):,}**\n- Date coverage: **{summary_df['date_start_utc'].min()} to {summary_df['date_end_utc'].max()}**\n- Timestamp parse failures: **{int(summary_df['timestamp_parse_failures'].sum())}**\n- Duplicate timestamps across source files: **{int(summary_df['duplicate_timestamps'].sum())}**\n- Gas families: **{', '.join(sorted(long_df['gas'].unique()))}**\n- Measurement units: **ppm**\n\n## Important limitations\n\nThe dataset does **not** contain a failure-event, fault-label, health-index, load, current, voltage, or temperature field. Therefore the original provisional `failure_24h` target is **not supported** by this source as downloaded. Do not train a future-failure classifier by inventing labels.\n\nThe most defensible Phase 6 directions are: (1) DGA trend and anomaly analysis, (2) transformer-level comparison of gas behaviour, or (3) a fault/health classification task only if an authoritative external label table can be obtained and joined under a documented key.\n\nSeveral files have phase-wise wide layouts and substantial missingness because a given file may record one phase at a time. The normalized long table preserves phase, gas, timestamp, and ppm while retaining only non-null measurements. It is stored as `normalized_dga_long.csv.gz` to keep the repository artifact size manageable; pandas can read it directly with `compression="gzip"`.\n\n## Recommended approval gate\n\nApprove this dataset for **real DGA condition-monitoring analysis**, not yet for the original 24-hour failure-prediction question. Before modelling, review the phase semantics, missingness mechanism, duplicate timestamps, sampling intervals, and the exact target definition with a domain supervisor.\n\n## Attribution\n\nCredit Zoë M. Lewis, James A. Wild, and Matthew Allcock; cite DOI `{SOURCE['doi']}`; retain the Zenodo CC BY 4.0 attribution and the source readme.\n"""
    (OUT / "PHASE_6_REAL_DATASET_VALIDATION.md").write_text(report)
    print(json.dumps(manifest["validation"], indent=2))


if __name__ == "__main__":
    main()
