from __future__ import annotations

import json
import math
import sys
from pathlib import Path
from typing import Iterable

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from phase10_anomaly_validation import (  # noqa: E402
    GASES,
    QUALITY_COLS,
    load_inputs,
    robust_baseline_scores,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "phase11_condition_assessment"
OUT.mkdir(parents=True, exist_ok=True)

RECENT_DAYS = 180
PRIOR_DAYS = 180
PERSISTENCE_RUN_CAP = 3
RECENT_RATE_REFERENCE = 0.05

BAND_RULES = {
    "NORMAL": (0.0, 0.25),
    "MONITOR": (0.25, 0.50),
    "REVIEW": (0.50, 0.75),
    "HIGH REVIEW": (0.75, 1.01),
}


def safe_percentile_rank(values: pd.Series) -> pd.Series:
    if len(values) <= 1:
        return pd.Series(0.5, index=values.index, dtype=float)
    return values.rank(method="average", pct=True).fillna(0.5)


def validate_input_frame(df: pd.DataFrame) -> None:
    required = {"transformer_id", "timestamp", "anomaly_score", "anomaly_flag_top_5pct", "reason_code", "observed_gas_count", "missing_gas_count", "hours_since_previous_record"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing Phase 11 input columns: {sorted(missing)}")
    if df.empty:
        raise ValueError("Phase 11 cannot calculate a condition indicator for an empty dataset")
    if not pd.api.types.is_datetime64_any_dtype(df["timestamp"]) or df["timestamp"].isna().any():
        raise ValueError("Phase 11 requires valid, non-null timestamps")
    if df.duplicated(["transformer_id", "timestamp"]).any():
        raise ValueError("Duplicate transformer_id/timestamp keys are not supported")
    for column in ["anomaly_score", "observed_gas_count", "missing_gas_count"]:
        if not np.isfinite(pd.to_numeric(df[column], errors="coerce")).all():
            raise ValueError(f"Invalid or infinite values found in {column}")


def max_consecutive(flags: Iterable[bool]) -> int:
    best = current = 0
    for flag in flags:
        if bool(flag):
            current += 1
            best = max(best, current)
        else:
            current = 0
    return int(best)


def count_anomaly_episodes(flags: Iterable[bool]) -> int:
    previous = False
    episodes = 0
    for flag in flags:
        current = bool(flag)
        if current and not previous:
            episodes += 1
        previous = current
    return int(episodes)


def condition_band(score: float) -> str:
    if not np.isfinite(score):
        return "MONITOR"
    for band, (lower, upper) in BAND_RULES.items():
        if lower <= score < upper:
            return band
    return "HIGH REVIEW" if score >= 0.75 else "NORMAL"


def confidence_label(observations: int, coverage_days: float, missing_rate: float, median_gap_hours: float) -> str:
    if observations >= 1000 and coverage_days >= 365 and missing_rate <= 0.05 and median_gap_hours <= 8:
        return "High confidence"
    if observations >= 100 and coverage_days >= 180 and missing_rate <= 0.25 and median_gap_hours <= 24:
        return "Moderate confidence"
    return "Limited confidence"


def priority_label(condition_score: float, band: str, confidence: str, recent_count: int, max_run: int) -> str:
    # Prototype screening rules. Limited confidence cannot create P1; it caps the
    # queue at P2/P3 so poor coverage does not become a worse condition score.
    limited = confidence == "Limited confidence"
    if not limited and condition_score >= 0.75 and (recent_count >= 3 or max_run >= PERSISTENCE_RUN_CAP):
        return "P1 — High Review Priority"
    if condition_score >= 0.50:
        return "P2 — Review"
    if condition_score >= 0.25:
        return "P3 — Monitor"
    return "P4 — Low Screening Priority"


def readable_reason(feature: str) -> str:
    return feature.replace("_ppm_log1p", " concentration").replace("_ppm_delta", " change").replace("_ppm_roll_std_3", " variability").replace("_", " ").strip()


def make_reason_codes(row: pd.Series) -> list[str]:
    reasons: list[str] = []
    if isinstance(row.get("strongest_reason"), str) and row["strongest_reason"]:
        reasons.append(f"Strong DGA deviation: {readable_reason(row['strongest_reason'])}")
    if row.get("max_consecutive_anomalies", 0) >= PERSISTENCE_RUN_CAP or row.get("anomaly_episodes", 0) >= 3:
        reasons.append("Persistent or repeated anomaly behaviour")
    if row.get("recent_anomaly_count", 0) >= 3:
        reasons.append("Recent anomaly activity")
    if row.get("specific_baseline_percentile", 0.0) >= 0.75:
        reasons.append("Transformer-specific baseline deviation")
    if row.get("confidence", "").startswith("Limited") or row.get("missing_rate", 0.0) > 0.05 or row.get("median_gap_hours", 0.0) > 8:
        reasons.append("Data-quality or sampling limitation")
    return reasons or ["No strong screening reason identified"]


def suggestion(row: pd.Series) -> str:
    priority = str(row["review_priority"])
    if priority.startswith("P1"):
        return "Review recent DGA history, compare with the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection."
    if priority.startswith("P2"):
        return "Review the recent DGA trend and transformer-specific history; verify data quality before changing inspection cadence."
    if priority.startswith("P3"):
        return "Continue monitoring, review repeated deviations, and confirm that sampling continuity supports interpretation."
    return "Maintain routine monitoring and retain the result as a low screening-priority reference; no autonomous action is indicated."


def build_row_metrics(df: pd.DataFrame, robust_scores: np.ndarray, robust_reasons: np.ndarray) -> pd.DataFrame:
    out = df[["transformer_id", "timestamp", "anomaly_score", "anomaly_flag_top_5pct", "reason_code", "observed_gas_count", "missing_gas_count", "hours_since_previous_record"]].copy()
    out["specific_baseline_score"] = robust_scores
    out["specific_baseline_reason"] = robust_reasons
    out = out.sort_values(["transformer_id", "timestamp"]).reset_index(drop=True)
    return out


def build_transformer_summary(rows: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if rows.empty:
        raise ValueError("Phase 11 cannot summarize an empty dataset")
    fleet_latest = rows["timestamp"].max()
    asset_rows: list[dict[str, object]] = []
    temporal_parts: list[pd.DataFrame] = []
    for asset, group in rows.groupby("transformer_id", sort=True):
        group = group.sort_values("timestamp").copy()
        asset_latest = group["timestamp"].max()
        start = group["timestamp"].min()
        coverage_days = max(float((asset_latest - start).total_seconds() / 86400), 0.0)
        recent_cutoff = asset_latest - pd.Timedelta(days=RECENT_DAYS)
        prior_cutoff = recent_cutoff - pd.Timedelta(days=PRIOR_DAYS)
        recent = group[group["timestamp"] >= recent_cutoff]
        prior = group[(group["timestamp"] < recent_cutoff) & (group["timestamp"] >= prior_cutoff)]
        flagged = group["anomaly_flag_top_5pct"].astype(bool).to_numpy()
        recent_flags = recent["anomaly_flag_top_5pct"].astype(bool).to_numpy()
        anomaly_timestamps = group.loc[group["anomaly_flag_top_5pct"].astype(bool), "timestamp"]
        last_anomaly = anomaly_timestamps.max() if len(anomaly_timestamps) else pd.NaT
        days_since_latest = float((asset_latest - last_anomaly).total_seconds() / 86400) if pd.notna(last_anomaly) else float("nan")
        recent_rate = float(recent["anomaly_flag_top_5pct"].mean()) if len(recent) else 0.0
        prior_mean = float(prior["anomaly_score"].mean()) if len(prior) else float("nan")
        recent_mean = float(recent["anomaly_score"].mean()) if len(recent) else 0.0
        trend_delta = float(recent_mean - prior_mean) if np.isfinite(prior_mean) else 0.0
        recent_intensity = float(recent.loc[recent["anomaly_flag_top_5pct"].astype(bool), "anomaly_score"].mean()) if recent["anomaly_flag_top_5pct"].any() else 0.0
        robust_flagged = group["specific_baseline_score"].quantile(.95)
        recent_robust = recent["specific_baseline_score"].quantile(.95) if len(recent) else robust_flagged
        row = {
            "transformer_id": asset,
            "observations": int(len(group)),
            "coverage_days": coverage_days,
            "first_observation": start,
            "latest_observation": asset_latest,
            "total_anomaly_count": int(group["anomaly_flag_top_5pct"].sum()),
            "total_anomaly_rate": float(group["anomaly_flag_top_5pct"].mean()),
            "anomaly_episodes": count_anomaly_episodes(flagged),
            "max_consecutive_anomalies": max_consecutive(flagged),
            "recent_observation_count": int(len(recent)),
            "recent_anomaly_count": int(recent["anomaly_flag_top_5pct"].sum()),
            "recent_anomaly_rate": recent_rate,
            "recent_anomaly_intensity": recent_intensity,
            "latest_anomaly_timestamp": last_anomaly,
            "days_since_latest_anomaly": days_since_latest,
            "p95_anomaly_score": float(group["anomaly_score"].quantile(.95)),
            "max_anomaly_score": float(group["anomaly_score"].max()),
            "p95_specific_baseline_score": float(robust_flagged),
            "p95_recent_specific_baseline_score": float(recent_robust),
            "prior_mean_anomaly_score": prior_mean,
            "recent_mean_anomaly_score": recent_mean,
            "trend_delta": trend_delta,
            "mean_missing_gases": float(group["missing_gas_count"].mean()),
            "missing_rate": float((group["missing_gas_count"] > 0).mean()),
            "mean_observed_gases": float(group["observed_gas_count"].mean()),
            "median_gap_hours": float(group["hours_since_previous_record"].dropna().median()) if group["hours_since_previous_record"].notna().any() else float("inf"),
            "large_gap_rate": float((group["hours_since_previous_record"] > 8).mean()),
            "strongest_reason": str(group.loc[group["anomaly_flag_top_5pct"].astype(bool), "reason_code"].value_counts().index[0]) if group["anomaly_flag_top_5pct"].any() else "",
        }
        asset_rows.append(row)
        monthly = group.assign(month=group["timestamp"].dt.to_period("M").dt.to_timestamp()).groupby("month").agg(
            observations=("anomaly_score", "size"),
            anomaly_count=("anomaly_flag_top_5pct", "sum"),
            anomaly_rate=("anomaly_flag_top_5pct", "mean"),
            mean_anomaly_score=("anomaly_score", "mean"),
            p95_anomaly_score=("anomaly_score", lambda s: s.quantile(.95)),
            mean_specific_baseline=("specific_baseline_score", "mean"),
        ).reset_index()
        monthly.insert(0, "transformer_id", asset)
        temporal_parts.append(monthly)

    summary = pd.DataFrame(asset_rows)
    summary["anomaly_intensity_component"] = safe_percentile_rank(summary["p95_anomaly_score"])
    summary["specific_baseline_component"] = safe_percentile_rank(summary["p95_specific_baseline_score"])
    summary["specific_baseline_percentile"] = summary["specific_baseline_component"]
    summary["persistence_component"] = (0.7 * (summary["max_consecutive_anomalies"].clip(upper=PERSISTENCE_RUN_CAP) / PERSISTENCE_RUN_CAP) + 0.3 * (summary["anomaly_episodes"].clip(upper=5) / 5)).clip(0, 1)
    recent_activity = (summary["recent_anomaly_count"] / np.maximum(summary["recent_observation_count"] * RECENT_RATE_REFERENCE, 3)).clip(0, 1)
    recency_decay = np.exp(-summary["days_since_latest_anomaly"].fillna(RECENT_DAYS * 4) / RECENT_DAYS)
    summary["recency_component"] = (recent_activity * recency_decay).clip(0, 1)
    trend_scale = max(float(summary["trend_delta"].abs().quantile(.95)), 1e-6)
    summary["trend_component"] = (0.5 + 0.5 * summary["trend_delta"] / trend_scale).clip(0, 1)
    summary.loc[summary["recent_observation_count"] == 0, "trend_component"] = 0.0
    summary["condition_indicator"] = (100 * (
        0.30 * summary["anomaly_intensity_component"] +
        0.20 * summary["persistence_component"] +
        0.20 * summary["recency_component"] +
        0.15 * summary["specific_baseline_component"] +
        0.15 * summary["trend_component"]
    )).round(2)
    summary["condition_band"] = summary["condition_indicator"].apply(lambda value: condition_band(float(value) / 100))
    summary["confidence"] = summary.apply(lambda row: confidence_label(int(row["observations"]), float(row["coverage_days"]), float(row["missing_rate"]), float(row["median_gap_hours"])), axis=1)
    summary["review_priority"] = summary.apply(lambda row: priority_label(float(row["condition_indicator"]) / 100, row["condition_band"], row["confidence"], int(row["recent_anomaly_count"]), int(row["max_consecutive_anomalies"])), axis=1)
    summary["reason_codes"] = summary.apply(lambda row: "; ".join(make_reason_codes(row)), axis=1)
    summary["engineering_review_suggestion"] = summary.apply(suggestion, axis=1)
    summary["interpretation"] = "Analytical DGA screening indicator; not a diagnosis, failure probability, engineering standard, or autonomous maintenance decision."
    summary = summary.sort_values(["condition_indicator", "p95_anomaly_score"], ascending=False).reset_index(drop=True)

    summary["priority_rank"] = summary["review_priority"].map({"P1 — High Review Priority": 1, "P2 — Review": 2, "P3 — Monitor": 3, "P4 — Low Screening Priority": 4})
    band_summary = summary.groupby("condition_band", as_index=False).agg(transformers=("transformer_id", "size"), mean_indicator=("condition_indicator", "mean"), mean_recent_rate=("recent_anomaly_rate", "mean"))
    band_summary["share"] = band_summary["transformers"] / len(summary)
    priority_summary = summary.groupby("review_priority", as_index=False).agg(transformers=("transformer_id", "size"), mean_indicator=("condition_indicator", "mean"), mean_recent_rate=("recent_anomaly_rate", "mean"), limited_confidence_count=("confidence", lambda s: int((s == "Limited confidence").sum())))
    priority_summary["priority_rank"] = priority_summary["review_priority"].map({"P1 — High Review Priority": 1, "P2 — Review": 2, "P3 — Monitor": 3, "P4 — Low Screening Priority": 4})
    temporal = pd.concat(temporal_parts, ignore_index=True)
    return summary, pd.concat([band_summary.assign(summary_type="condition_band"), priority_summary.rename(columns={"review_priority": "condition_band"}).assign(summary_type="review_priority")], ignore_index=True, sort=False), temporal


def write_outputs(summary: pd.DataFrame, distribution: pd.DataFrame, temporal: pd.DataFrame) -> None:
    summary.to_csv(OUT / "transformer_condition_summary.csv", index=False)
    priority_cols = ["transformer_id", "condition_indicator", "condition_band", "review_priority", "priority_rank", "confidence", "recent_anomaly_count", "max_consecutive_anomalies", "reason_codes", "engineering_review_suggestion"]
    summary[priority_cols].to_csv(OUT / "engineering_review_priority.csv", index=False)
    band_view = summary.groupby("condition_band", as_index=False).agg(transformers=("transformer_id", "size"), mean_indicator=("condition_indicator", "mean"), mean_recent_rate=("recent_anomaly_rate", "mean"))
    band_view["share"] = band_view["transformers"] / len(summary)
    band_view.to_csv(OUT / "condition_band_summary.csv", index=False)
    summary[["transformer_id", "condition_indicator", "condition_band", "review_priority", "reason_codes"]].to_csv(OUT / "reason_code_summary.csv", index=False)
    component_cols = ["transformer_id", "anomaly_intensity_component", "persistence_component", "recency_component", "specific_baseline_component", "trend_component", "condition_indicator"]
    summary[component_cols].to_csv(OUT / "condition_indicator_components.csv", index=False)
    confidence_cols = ["transformer_id", "observations", "coverage_days", "missing_rate", "mean_missing_gases", "median_gap_hours", "large_gap_rate", "confidence"]
    summary[confidence_cols].to_csv(OUT / "data_confidence_summary.csv", index=False)
    temporal.to_csv(OUT / "temporal_condition_summary.csv", index=False)
    distribution.to_csv(OUT / "condition_and_priority_distribution.csv", index=False)

    ordered = summary.sort_values("condition_indicator", ascending=True)
    colors = ["#d7ff57" if band == "NORMAL" else "#a8d228" if band == "MONITOR" else "#f2b66b" if band == "REVIEW" else "#ee806a" for band in ordered["condition_band"]]
    plt.figure(figsize=(11, 5.5)); plt.barh(ordered["transformer_id"], ordered["condition_indicator"], color=colors); plt.axvline(25, color="#87917d", linestyle="--", linewidth=.8); plt.axvline(50, color="#87917d", linestyle="--", linewidth=.8); plt.axvline(75, color="#87917d", linestyle="--", linewidth=.8); plt.xlim(0, 100); plt.xlabel("DGA Condition Indicator — prototype scale (0–100)"); plt.title("Transformer condition screening ranking"); plt.tight_layout(); plt.savefig(OUT / "condition_ranking.png", dpi=160); plt.close()

    plt.figure(figsize=(7, 4)); summary["condition_band"].value_counts().reindex(list(BAND_RULES), fill_value=0).plot.bar(color=["#d7ff57", "#a8d228", "#f2b66b", "#ee806a"]); plt.ylabel("Transformers"); plt.title("Prototype condition-band distribution"); plt.xticks(rotation=0); plt.tight_layout(); plt.savefig(OUT / "condition_band_distribution.png", dpi=160); plt.close()

    priority_order = ["P1 — High Review Priority", "P2 — Review", "P3 — Monitor", "P4 — Low Screening Priority"]
    plt.figure(figsize=(8, 4)); summary["review_priority"].value_counts().reindex(priority_order, fill_value=0).plot.bar(color=["#ee806a", "#f2b66b", "#a8d228", "#87917d"]); plt.ylabel("Transformers"); plt.title("Engineering-review priority distribution (prototype)"); plt.xticks(rotation=18, ha="right"); plt.tight_layout(); plt.savefig(OUT / "review_priority_distribution.png", dpi=160); plt.close()

    temporal_global = temporal.groupby("month").agg(observations=("observations", "sum"), anomaly_count=("anomaly_count", "sum"), anomaly_rate=("anomaly_count", lambda s: s.sum() / max(s.index.size, 1)), mean_anomaly_score=("mean_anomaly_score", "mean")).reset_index()
    raw_monthly = temporal.groupby("month").apply(lambda g: pd.Series({"anomaly_rate": g["anomaly_count"].sum() / g["observations"].sum(), "mean_anomaly_score": np.average(g["mean_anomaly_score"], weights=g["observations"])}), include_groups=False).reset_index()
    plt.figure(figsize=(11, 4.5)); plt.plot(raw_monthly["month"], raw_monthly["anomaly_rate"] * 100, color="#ee806a", linewidth=1.4, label="monthly top-5% anomaly rate"); plt.plot(raw_monthly["month"], raw_monthly["anomaly_rate"].rolling(3, min_periods=1).mean() * 100, color="#d7ff57", linewidth=2, label="3-month rolling view"); plt.axhline(5, color="#87917d", linestyle="--", linewidth=.8, label="5% proxy convention"); plt.ylabel("Flagged observations (%)"); plt.title("Real DGA anomaly activity over time"); plt.legend(); plt.tight_layout(); plt.savefig(OUT / "anomaly_activity_over_time.png", dpi=160); plt.close()

    plt.figure(figsize=(7, 5)); scatter = plt.scatter(summary["p95_anomaly_score"], summary["p95_specific_baseline_score"], c=summary["condition_indicator"], cmap="RdYlGn_r", s=np.maximum(summary["observations"] / 30, 35), alpha=.9, edgecolor="#101310");
    for _, row in summary.iterrows(): plt.annotate(row["transformer_id"], (row["p95_anomaly_score"], row["p95_specific_baseline_score"]), xytext=(4, 4), textcoords="offset points", fontsize=8)
    plt.xlabel("Fleet Isolation Forest p95 score"); plt.ylabel("Transformer-specific robust baseline p95"); plt.title("Fleet-relative vs transformer-specific deviation"); plt.colorbar(scatter, label="Condition Indicator"); plt.tight_layout(); plt.savefig(OUT / "baseline_vs_recent_behaviour.png", dpi=160); plt.close()

    plt.figure(figsize=(9, 4.5)); plt.bar(summary["transformer_id"], summary["max_consecutive_anomalies"], color="#a8d228"); plt.axhline(PERSISTENCE_RUN_CAP, color="#ee806a", linestyle="--", label=f"persistent rule ≥ {PERSISTENCE_RUN_CAP} consecutive anomalies"); plt.ylabel("Longest consecutive anomaly run"); plt.title("Recent persistence screening evidence"); plt.legend(); plt.tight_layout(); plt.savefig(OUT / "recent_anomaly_persistence.png", dpi=160); plt.close()

    reason_counts = summary["reason_codes"].str.split("; ").explode().value_counts().head(8).sort_values()
    plt.figure(figsize=(9, 4.5)); reason_counts.plot.barh(color="#f2b66b"); plt.xlabel("Transformers"); plt.title("Transformer-level condition reason codes"); plt.tight_layout(); plt.savefig(OUT / "reason_code_distribution.png", dpi=160); plt.close()

    plt.figure(figsize=(7, 4)); summary["confidence"].value_counts().reindex(["High confidence", "Moderate confidence", "Limited confidence"], fill_value=0).plot.bar(color=["#d7ff57", "#f2b66b", "#ee806a"]); plt.ylabel("Transformers"); plt.title("Data-confidence distribution"); plt.xticks(rotation=0); plt.tight_layout(); plt.savefig(OUT / "data_confidence_distribution.png", dpi=160); plt.close()


def write_report(summary: pd.DataFrame, temporal: pd.DataFrame) -> None:
    top = summary.head(5)
    top_lines = "\n".join(f"- **{row.transformer_id}** — indicator {row.condition_indicator:.2f}, {row.condition_band}, {row.review_priority}, {row.confidence}; reasons: {row.reason_codes}" for row in top.itertuples())
    priority_counts = summary["review_priority"].value_counts().to_dict()
    confidence_counts = summary["confidence"].value_counts().to_dict()
    md = f"""# Phase 11 — Real DGA Condition Assessment & Engineering Review Prioritisation

## Executive summary

Phase 11 converts the validated real UK DGA anomaly evidence into a transparent **DGA Condition Indicator — Prototype** and an engineering-review screening queue. It is a retrospective analytical summary of real DGA observations across **{len(summary)} transformers** and **{int(summary['observations'].sum()):,} feature rows**.

This output is an analytical screening indicator intended to support engineering review. It is **not a diagnosis, failure probability, engineering standard, or autonomous maintenance decision**.

## Objective and evidence boundary

The real dataset contains DGA measurements, timestamps, transformer IDs, missingness, and sampling intervals. It does not contain authoritative failure/fault labels, event timestamps, maintenance outcomes, load, current, voltage, or temperature. Therefore this phase does not fabricate failure targets, probabilities, health labels, or maintenance outcomes.

The synthetic ML pipeline remains separate and is not used in any real-data calculation.

## Phase 9B and Phase 10 inputs

- Phase 9B: fixed-seed Isolation Forest anomaly scores, a descriptive top-5% anomaly proxy, transformer-level summaries, monthly activity, and gas-only reason codes.
- Phase 10: leakage audit, time-safe holdout comparison, transformer-specific robust baseline comparison, parameter sensitivity, reason-code validation, and missingness/sampling-gap analysis.
- Phase 10 findings carried forward: Isolation Forest rankings were reasonably stable across tested configurations, but alternative methods produced materially different rankings. One missing gas had a 46.76% proxy rate versus 3.15% with no missing gases; long sampling gaps also showed inflated proxy rates in very small groups.

## Condition-indicator methodology

The indicator is a **prototype screening scale from 0 to 100**. It does not represent probability or engineering health.

For each transformer, the following components are calculated from observed historical data:

1. **Fleet anomaly intensity (30%)** — percentile rank of the transformer’s p95 Phase 9B Isolation Forest score across the 13-transformer fleet.
2. **Persistence (20%)** — 70% from the longest consecutive anomaly run, capped at 3; 30% from the number of anomaly episodes, capped at 5.
3. **Recency (20%)** — recent anomaly activity in the last 180 days, normalized against a 5% observation-rate reference and multiplied by an exponential recency decay with a 180-day scale.
4. **Transformer-specific deviation (15%)** — percentile rank of the p95 median/MAD robust deviation relative to each transformer’s own historical DGA distribution.
5. **Trend/change (15%)** — recent 180-day mean anomaly score minus the preceding 180-day mean, scaled by the fleet 95th absolute change magnitude and clipped to 0–1.

Formula:

```text
Indicator = 100 × (
  0.30 × intensity
+ 0.20 × persistence
+ 0.20 × recency
+ 0.15 × transformer-specific deviation
+ 0.15 × trend
)
```

These weights and windows are explicit prototype choices, not engineering-validated weights.

## Condition bands

- **NORMAL:** 0 to <25
- **MONITOR:** 25 to <50
- **REVIEW:** 50 to <75
- **HIGH REVIEW:** 75 to 100

These are project-defined analytical screening categories. They are not failure states, fault states, utility alarm limits, industry standards, or probability ranges.

## Transformer-specific baseline

The baseline uses transformer-specific median and MAD values on the available gas-derived feature columns. A feature-wise 1%-of-training-IQR floor prevents near-zero MAD values from creating numerical explosions. A transformer is not classified as abnormal merely because its absolute gas concentration is higher than another transformer’s.

## Persistence, recency, and trend

Persistence is measured from chronological top-5% anomaly flags using anomaly episodes and consecutive runs. Recency uses each transformer’s last observed date as the reference and counts anomalies in the preceding 180 days. Trend compares the recent 180-day mean score with the preceding 180-day window. These are retrospective descriptive measures, not future-failure predictors.

## Data-confidence methodology

Confidence is reported separately from condition so missingness cannot make a transformer appear worse. Rules are:

- **High confidence:** at least 1,000 observations, at least 365 days of coverage, missing-gas rate ≤5%, and median sampling gap ≤8 hours.
- **Moderate confidence:** at least 100 observations, at least 180 days of coverage, missing-gas rate ≤25%, and median gap ≤24 hours.
- **Limited confidence:** otherwise.

A confidence limitation lowers interpretive certainty; it is not evidence of equipment deterioration.

## Engineering-review priority

Priority is a screening queue, not failure risk:

- **P1 — High Review Priority:** indicator ≥75, non-limited confidence, and either at least 3 recent anomalies or a run of at least 3 consecutive anomalies.
- **P2 — Review:** indicator ≥50, or an indicator ≥75 with limited confidence.
- **P3 — Monitor:** indicator ≥25 but below P2 criteria.
- **P4 — Low Screening Priority:** indicator <25.

Limited-confidence results cannot create P1. No priority triggers a work order, shutdown, protection-setting change, or automatic control.

## Reason codes and suggestions

Reasons are generated only when supported by observed evidence: the existing gas-only strongest deviation code, persistent/repeated anomaly behaviour, recent anomaly activity, transformer-specific baseline deviation, or a data-quality/sampling limitation. They describe statistical behaviour and do not establish physical causation.

Suggestions are conservative: review recent DGA history, compare against the transformer-specific baseline, verify sampling continuity, and consider qualified engineering inspection where appropriate.

## Transformer-level results

Priority counts: **{priority_counts}**. Confidence counts: **{confidence_counts}**.

Top screening results:

{top_lines}

These are not claims that the listed transformers have failed or will fail.

## Key observations and limitations

- The highest screening results depend on the selected method; Phase 10 showed material disagreement between global and transformer-specific screens.
- Missingness and long sampling gaps can inflate anomaly flags, especially in small groups. This is why confidence is separate and why results require context.
- DGA measurements are irregular and repeated observations from one transformer are not independent.
- The output is retrospective through the latest observation in the source, not a real-time operational alarm.
- No authoritative label exists to validate precision, recall, fault detection, failure prediction, or maintenance benefit.
- Statistical deviation does not establish physical causation.

## Reproducibility

Run from the project root:

```bash
python3 scripts/phase11_condition_assessment.py
python3 -m unittest discover -s tests -p 'test_phase11_*.py' -v
```

The pipeline reuses the Phase 9B scores and Phase 10 robust-baseline helper. Dependencies are pinned in `requirements.txt`; the current execution used Python 3.12.3, NumPy 2.5.3, pandas 3.0.6, scikit-learn 1.9.1, and Matplotlib 3.11.2. Randomness is not introduced by the Phase 11 aggregation itself.

## Generated artifacts

- `transformer_condition_summary.csv`
- `engineering_review_priority.csv`
- `condition_band_summary.csv`
- `reason_code_summary.csv`
- `condition_indicator_components.csv`
- `data_confidence_summary.csv`
- `temporal_condition_summary.csv`
- `condition_ranking.png`
- `condition_band_distribution.png`
- `review_priority_distribution.png`
- `anomaly_activity_over_time.png`
- `baseline_vs_recent_behaviour.png`
- `recent_anomaly_persistence.png`
- `reason_code_distribution.png`
- `data_confidence_distribution.png`

## Responsible-use statement

This output is an analytical screening indicator intended to support engineering review. It is not a diagnosis, failure probability, engineering standard, or autonomous maintenance decision. GridWatch complements SCADA, sensors, alarms, diagnostic methods, maintenance records, and professional inspection; it does not replace them.

## Human approval gate and recommended next phase

STOP after Phase 11. The next phase should be approved human review with domain context and, if available, authoritative maintenance/fault/event records. Do not automatically proceed to supervised failure modelling or claim engineering validation.
"""
    (OUT / "PHASE_11_CONDITION_ASSESSMENT_REPORT.md").write_text(md)


def main() -> None:
    df, _, all_cols = load_inputs()
    validate_input_frame(df)
    gas_cols = [col for col in all_cols if col not in QUALITY_COLS]
    full_mask = pd.Series(True, index=df.index)
    _, robust_scores, robust_reasons = robust_baseline_scores(df, gas_cols, full_mask, full_mask)
    rows = build_row_metrics(df, robust_scores, robust_reasons)
    summary, distribution, temporal = build_transformer_summary(rows)
    write_outputs(summary, distribution, temporal)
    write_report(summary, temporal)
    payload = {
        "dataset": "UK Power Station Transformer DGA 2010-2015",
        "transformers": int(summary["transformer_id"].nunique()),
        "observations": int(summary["observations"].sum()),
        "condition_method": "fleet-relative anomaly intensity + persistence + recency + transformer-specific robust deviation + trend/change",
        "condition_bands": BAND_RULES,
        "recent_window_days": RECENT_DAYS,
        "prior_window_days": PRIOR_DAYS,
        "weights": {"intensity": 0.30, "persistence": 0.20, "recency": 0.20, "specific_baseline": 0.15, "trend": 0.15},
        "priority_counts": summary["review_priority"].value_counts().to_dict(),
        "confidence_counts": summary["confidence"].value_counts().to_dict(),
        "failure_target_used": False,
        "failure_probability_used": False,
        "synthetic_data_used": False,
    }
    (OUT / "phase11_summary.json").write_text(json.dumps(payload, indent=2, default=str))
    print(json.dumps(payload, indent=2, default=str))


if __name__ == "__main__":
    main()
