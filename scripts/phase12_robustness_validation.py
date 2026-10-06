from __future__ import annotations

import json
import math
import sys
from itertools import combinations
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
    QUALITY_COLS,
    feature_names,
    fit_isolation_forest,
    impute_by_transformer,
    load_inputs,
    percentile_flag,
    robust_baseline_scores,
)
from phase11_condition_assessment import (  # noqa: E402
    BAND_RULES,
    condition_band,
    confidence_label,
    count_anomaly_episodes,
    max_consecutive,
    priority_label,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "phase12_robustness_validation"
OUT.mkdir(parents=True, exist_ok=True)

THRESHOLDS = [0.01, 0.025, 0.05, 0.075, 0.10]
BASE_WEIGHTS = {"intensity": 0.30, "persistence": 0.20, "recency": 0.20, "specific_baseline": 0.15, "trend": 0.15}
WEIGHT_CONFIGS = {
    "baseline_30_20_20_15_15": BASE_WEIGHTS,
    "intensity_emphasis_45_15_15_15_10": {"intensity": .45, "persistence": .15, "recency": .15, "specific_baseline": .15, "trend": .10},
    "persistence_emphasis_20_40_15_15_10": {"intensity": .20, "persistence": .40, "recency": .15, "specific_baseline": .15, "trend": .10},
    "baseline_emphasis_20_15_15_40_20": {"intensity": .20, "persistence": .15, "recency": .15, "specific_baseline": .40, "trend": .10},
}
BAND_CONFIGS = {
    "baseline_25_50_75": (25, 50, 75),
    "tighter_20_45_70": (20, 45, 70),
    "wider_30_55_80": (30, 55, 80),
}


def rank_series(values: pd.Series, ascending: bool = False) -> pd.Series:
    return values.rank(ascending=ascending, method="average")


def spearman(a: Iterable[float], b: Iterable[float]) -> float:
    x, y = pd.Series(list(a), dtype=float), pd.Series(list(b), dtype=float)
    if len(x) < 2 or x.nunique() <= 1 or y.nunique() <= 1:
        return 1.0 if np.allclose(x, y) else 0.0
    return float(x.rank().corr(y.rank()))


def kendall(a: Iterable[float], b: Iterable[float]) -> float:
    x, y = list(map(float, a)), list(map(float, b))
    concordant = discordant = ties = 0
    for i, j in combinations(range(len(x)), 2):
        dx, dy = x[i] - x[j], y[i] - y[j]
        if dx == 0 or dy == 0:
            ties += 1
        elif dx * dy > 0:
            concordant += 1
        else:
            discordant += 1
    denom = math.sqrt((concordant + discordant + ties) ** 2) if concordant + discordant + ties else 1
    return float((concordant - discordant) / denom)


def top_k_overlap(a: pd.Series, b: pd.Series, k: int) -> float:
    aa, bb = set(a.sort_values().head(k).index), set(b.sort_values().head(k).index)
    return float(len(aa & bb) / max(len(aa | bb), 1))


def agreement(a: pd.Series, b: pd.Series) -> float:
    common = a.index.intersection(b.index)
    if len(common) == 0:
        return 0.0
    return float((a.reindex(common) == b.reindex(common)).mean())


def safe_group_rank(values: pd.Series) -> pd.Series:
    return values.rank(method="average", pct=True).fillna(.5)


def assign_band(score: float, edges: tuple[float, float, float]) -> str:
    if score < edges[0]:
        return "NORMAL"
    if score < edges[1]:
        return "MONITOR"
    if score < edges[2]:
        return "REVIEW"
    return "HIGH REVIEW"


def compute_summary(df: pd.DataFrame, score_col: str, flag_col: str, *, recent_days: int = 180, weights: dict[str, float] = BASE_WEIGHTS, persistence_cap: int = 3, episode_cap: int = 5, band_edges: tuple[float, float, float] = (25, 50, 75), max_gap_hours: float | None = None, max_missing_gases: int | None = None) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Cannot compute robustness summary for empty input")
    rows: list[dict[str, object]] = []
    for asset, group in df.groupby("transformer_id", sort=True):
        group = group.sort_values("timestamp").copy()
        latest = group["timestamp"].max()
        recent_cutoff = latest - pd.Timedelta(days=recent_days)
        prior_cutoff = recent_cutoff - pd.Timedelta(days=recent_days)
        recent = group[group["timestamp"] >= recent_cutoff]
        prior = group[(group["timestamp"] < recent_cutoff) & (group["timestamp"] >= prior_cutoff)]
        flags = group[flag_col].astype(bool).to_numpy()
        event_times = group.loc[group[flag_col].astype(bool), "timestamp"]
        last_event = event_times.max() if len(event_times) else pd.NaT
        days_since = float((latest - last_event).total_seconds() / 86400) if pd.notna(last_event) else float("nan")
        recent_count = int(recent[flag_col].sum())
        recent_rate = float(recent[flag_col].mean()) if len(recent) else 0.0
        recent_mean = float(recent[score_col].mean()) if len(recent) else 0.0
        prior_mean = float(prior[score_col].mean()) if len(prior) else float("nan")
        rows.append({
            "transformer_id": asset,
            "observations": int(len(group)),
            "coverage_days": float((latest - group["timestamp"].min()).total_seconds() / 86400),
            "total_anomaly_rate": float(group[flag_col].mean()),
            "anomaly_count": int(group[flag_col].sum()),
            "anomaly_episodes": count_anomaly_episodes(flags),
            "max_consecutive_anomalies": max_consecutive(flags),
            "recent_anomaly_count": recent_count,
            "recent_observation_count": int(len(recent)),
            "recent_anomaly_rate": recent_rate,
            "days_since_latest_anomaly": days_since,
            "p95_score": float(group[score_col].quantile(.95)),
            "recent_mean_score": recent_mean,
            "prior_mean_score": prior_mean,
            "trend_delta": float(recent_mean - prior_mean) if np.isfinite(prior_mean) else 0.0,
            "p95_specific_baseline": float(group["robust_score"].quantile(.95)),
            "missing_rate": float((group["missing_gas_count"] > 0).mean()),
            "median_gap_hours": float(group["hours_since_previous_record"].dropna().median()) if group["hours_since_previous_record"].notna().any() else float("inf"),
            "max_gap_hours": float(group["hours_since_previous_record"].max()) if group["hours_since_previous_record"].notna().any() else 0.0,
        })
    out = pd.DataFrame(rows)
    out["intensity_component"] = safe_group_rank(out["p95_score"])
    out["specific_baseline_component"] = safe_group_rank(out["p95_specific_baseline"])
    out["persistence_component"] = (0.7 * (out["max_consecutive_anomalies"].clip(upper=persistence_cap) / max(persistence_cap, 1)) + 0.3 * (out["anomaly_episodes"].clip(upper=episode_cap) / max(episode_cap, 1))).clip(0, 1)
    # Use the Phase 11 5%-of-recent-observations reference without creating a score from missingness.
    activity = (out["recent_anomaly_count"] / np.maximum(out["recent_observation_count"] * .05, 3)).clip(0, 1)
    out["recency_component"] = (activity * np.exp(-out["days_since_latest_anomaly"].fillna(recent_days * 4) / recent_days)).clip(0, 1)
    scale = max(float(out["trend_delta"].abs().quantile(.95)), 1e-6)
    out["trend_component"] = (0.5 + .5 * out["trend_delta"] / scale).clip(0, 1)
    out.loc[out["recent_anomaly_count"] == 0, "trend_component"] = 0.0
    out["condition_indicator"] = (100 * sum(weights[key] * out[column] for key, column in {
        "intensity": "intensity_component", "persistence": "persistence_component", "recency": "recency_component", "specific_baseline": "specific_baseline_component", "trend": "trend_component"
    }.items())).round(2)
    out["condition_band"] = out["condition_indicator"].apply(lambda value: assign_band(float(value), band_edges))
    out["confidence"] = out.apply(lambda r: confidence_label(int(r["observations"]), float(r["coverage_days"]), float(r["missing_rate"]), float(r["median_gap_hours"])), axis=1)
    out["review_priority"] = out.apply(lambda r: priority_label(float(r["condition_indicator"]) / 100, r["condition_band"], r["confidence"], int(r["recent_anomaly_count"]), int(r["max_consecutive_anomalies"])), axis=1)
    return out.sort_values(["condition_indicator", "p95_score"], ascending=False).reset_index(drop=True)


def add_filter_flags(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["low_missing"] = out["missing_gas_count"] == 0
    out["moderate_missing"] = out["missing_gas_count"] <= 1
    out["gap_8h"] = out["hours_since_previous_record"].isna() | (out["hours_since_previous_record"] <= 8)
    out["gap_24h"] = out["hours_since_previous_record"].isna() | (out["hours_since_previous_record"] <= 24)
    out["gap_7d"] = out["hours_since_previous_record"].isna() | (out["hours_since_previous_record"] <= 168)
    return out


def rank_metrics(frames: dict[str, pd.DataFrame], baseline_name: str) -> pd.DataFrame:
    base = frames[baseline_name].set_index("transformer_id")["condition_indicator"].sort_values(ascending=False)
    rows = []
    for name, frame in frames.items():
        scores = frame.set_index("transformer_id")["condition_indicator"].sort_values(ascending=False)
        priority = frame.set_index("transformer_id")["review_priority"]
        base_priority = frames[baseline_name].set_index("transformer_id")["review_priority"]
        rows.append({
            "configuration": name,
            "spearman_vs_baseline": spearman(base.reindex(scores.index), scores),
            "kendall_vs_baseline": kendall(base.reindex(scores.index), scores),
            "top3_overlap": top_k_overlap(base, scores, 3),
            "top5_overlap": top_k_overlap(base, scores, 5),
            "band_agreement": float((frame.set_index("transformer_id")["condition_band"] == frames[baseline_name].set_index("transformer_id")["condition_band"]).mean()),
            "priority_agreement": float((priority == base_priority).mean()),
            "top_transformer": str(scores.index[0]),
        })
    return pd.DataFrame(rows)


def flags_at_score(df: pd.DataFrame, score_col: str, fraction: float, name: str) -> tuple[pd.DataFrame, float]:
    threshold, flags = percentile_flag(df[score_col].to_numpy(), fraction)
    out = df.copy()
    out[f"flag_{name}"] = flags
    return out, threshold


def fit_if_configs(df: pd.DataFrame, cols: list[str]) -> dict[str, pd.DataFrame]:
    fit_x, score_x, _ = impute_by_transformer(df, cols)
    configs = {
        "IF_baseline_200_10000_05": (200, min(10000, len(df)), .05),
        "IF_small_100_5000_02": (100, min(5000, len(df)), .02),
        "IF_large_300_20000_05": (300, min(20000, len(df)), .05),
        "IF_high_contamination_200_10000_10": (200, min(10000, len(df)), .10),
    }
    results: dict[str, pd.DataFrame] = {}
    for name, (n, sample, contamination) in configs.items():
        _, scores = fit_isolation_forest(fit_x, score_x, n_estimators=n, max_samples=sample, contamination=contamination)
        temp = df.copy(); temp["method_score"] = scores
        _, flags = percentile_flag(scores, contamination)
        temp["method_flag"] = flags
        temp["method_name"] = name
        results[name] = temp
    return results


def chart_outputs(all_runs: dict[str, pd.DataFrame], threshold_df: pd.DataFrame, missing_df: pd.DataFrame, gap_df: pd.DataFrame) -> None:
    rank_table = pd.DataFrame({name: frame.set_index("transformer_id")["condition_indicator"] for name, frame in all_runs.items()})
    rank_corr = rank_table.corr(method="spearman")
    plt.figure(figsize=(8, 6)); plt.imshow(rank_corr, cmap="RdYlGn", vmin=0, vmax=1); plt.colorbar(label="Spearman correlation"); plt.xticks(range(len(rank_corr)), rank_corr.columns, rotation=60, ha="right", fontsize=8); plt.yticks(range(len(rank_corr)), rank_corr.index, fontsize=8); plt.title("Phase 12 condition-ranking agreement"); plt.tight_layout(); plt.savefig(OUT / "rank_stability_matrix.png", dpi=160); plt.close()

    top3 = {name: set(frame.sort_values("condition_indicator", ascending=False).head(3)["transformer_id"]) for name, frame in all_runs.items()}
    overlap = pd.DataFrame([[len(top3[a] & top3[b]) for b in top3] for a in top3], index=top3, columns=top3)
    plt.figure(figsize=(8, 6)); plt.imshow(overlap, cmap="YlGn", vmin=0, vmax=3); plt.colorbar(label="Top-3 overlap count"); plt.xticks(range(len(overlap)), overlap.columns, rotation=60, ha="right", fontsize=8); plt.yticks(range(len(overlap)), overlap.index, fontsize=8); plt.title("Top-3 screening overlap"); plt.tight_layout(); plt.savefig(OUT / "top_k_overlap.png", dpi=160); plt.close()

    plt.figure(figsize=(8, 4.5)); plt.plot(threshold_df["threshold_percent"], threshold_df["mean_asset_anomaly_rate"] * 100, marker="o", color="#ee806a"); plt.plot(threshold_df["threshold_percent"], threshold_df["top3_priority_count"], marker="s", color="#d7ff57"); plt.xlabel("Top-score threshold (%)"); plt.ylabel("Rate (%) / top-3 priority count"); plt.title("Anomaly-threshold sensitivity"); plt.grid(alpha=.2); plt.tight_layout(); plt.savefig(OUT / "threshold_sensitivity.png", dpi=160); plt.close()

    plt.figure(figsize=(8, 4.5)); plt.bar(missing_df["scenario"], missing_df["anomaly_rate"] * 100, color="#f2b66b"); plt.ylabel("Anomaly proxy rate (%)"); plt.title("Missingness sensitivity — descriptive filter consequences"); plt.xticks(rotation=18, ha="right"); plt.tight_layout(); plt.savefig(OUT / "missingness_impact.png", dpi=160); plt.close()

    plt.figure(figsize=(8, 4.5)); plt.bar(gap_df["scenario"], gap_df["anomaly_rate"] * 100, color="#a8d228"); plt.ylabel("Anomaly proxy rate (%)"); plt.title("Sampling-gap sensitivity — descriptive filter consequences"); plt.xticks(rotation=18, ha="right"); plt.tight_layout(); plt.savefig(OUT / "sampling_gap_impact.png", dpi=160); plt.close()

    robust = pd.read_csv(OUT / "transformer_robustness_summary.csv")
    colors = robust["stability_category"].map({"STABLE": "#d7ff57", "MODERATELY STABLE": "#a8d228", "SENSITIVE": "#f2b66b", "INSUFFICIENT DATA": "#ee806a"}).fillna("#87917d")
    plt.figure(figsize=(10, 5)); plt.scatter(robust["baseline_indicator"], robust["indicator_std"], c=colors, s=70, edgecolor="#101310");
    for _, row in robust.iterrows(): plt.annotate(row["transformer_id"], (row["baseline_indicator"], row["indicator_std"]), xytext=(4, 4), textcoords="offset points", fontsize=8)
    plt.xlabel("Baseline condition indicator"); plt.ylabel("Indicator standard deviation across runs"); plt.title("Transformer robustness: baseline level vs sensitivity"); plt.tight_layout(); plt.savefig(OUT / "transformer_robustness_matrix.png", dpi=160); plt.close()


def write_report(metadata: dict, stable: pd.DataFrame, sensitive: pd.DataFrame) -> None:
    stable_lines = "\n".join(f"- **{row.transformer_id}** — baseline indicator {row.baseline_indicator:.2f}; stability {row.stability_category}; top-3 appearances {int(row.top3_appearances)}/{int(row.number_of_runs)}" for row in stable.head(5).itertuples()) or "- No consistently high screening transformer met the conservative consensus rule."
    sensitive_lines = "\n".join(f"- **{row.transformer_id}** — baseline indicator {row.baseline_indicator:.2f}; indicator range {row.minimum_indicator:.2f}–{row.maximum_indicator:.2f}; std {row.indicator_std:.2f}; category {row.stability_category}" for row in sensitive.head(8).itertuples()) or "- No method-sensitive transformer was identified under the configured rule."
    report = f"""# Phase 12 — Real DGA Robustness, Sensitivity & Final Validation

## Executive summary

Phase 12 tests how much the Phase 9B and Phase 11 real-data screening conclusions change under reasonable methodological alternatives. It does not manufacture failure labels, probabilities, ground truth, or supervised validation metrics.

The real-data contribution remains: **data-driven transformer DGA anomaly and condition screening using historical real-world observations, with explicit robustness analysis, uncertainty awareness, and engineering review prioritisation.**

## Objective and evidence boundary

The validated UK DGA source has no authoritative failure/fault labels, failure timestamps, maintenance outcomes, outage records, engineering health labels, load, current, voltage, or temperature. Therefore this report discusses analytical screening stability only. It does not claim failure prediction, fault classification, health diagnosis, engineering validation, or probability of failure.

## Baselines reused

- Phase 9B baseline: Isolation Forest with `n_estimators=200`, `max_samples=10000`, `contamination=0.05`, `random_state=42`, with a descriptive top-5% score proxy.
- Phase 10: time-safe comparison, transformer-specific robust MAD baseline, parameter/threshold sensitivity, missingness and sampling-gap checks, and leakage audit.
- Phase 11: 0–100 prototype DGA Condition Indicator using intensity, persistence, recency, transformer-specific deviation, and trend/change; confidence remains separate from condition.

## Sensitivity analyses executed

- Row-level anomaly thresholds: **1%, 2.5%, 5%, 7.5%, 10%**.
- Isolation Forest configurations: baseline plus small, larger-sample, and higher-contamination variations with fixed seed 42.
- Alternative methods: transformer-specific robust MAD screening and a within-transformer percentile screening comparator.
- Ranking: Spearman correlation, Kendall correlation, top-3/top-5 overlap, rank ranges, and priority/band agreement.
- Top-k: top 3, top 5, and top 25% appearances across method/configuration runs.
- Condition weights: baseline, intensity emphasis, persistence emphasis, and transformer-specific-baseline emphasis.
- Band thresholds: baseline 25/50/75, tighter 20/45/70, wider 30/55/80.
- Persistence: consecutive-run caps and episode caps.
- Recency: 90, 180, and 365 days.
- Missingness: full data, zero-missing-gas rows, and at-most-one-missing-gas rows.
- Sampling gaps: full data, ≤8 hours, ≤24 hours, and ≤7 days.
- Temporal robustness: early, middle, and late historical thirds.

## Threshold sensitivity

A higher top-score threshold reduces flagged observations and changes the descriptive proxy rate by construction. The threshold table reports the number of flagged rows, transformer-level rates, p95 ranking, persistence, band changes, and priority changes. No threshold is declared correct or engineering validated.

## Parameter sensitivity

Isolation Forest parameters change the fitted score distribution and therefore the screening queue. Fixed seeds make comparisons reproducible; they do not make one configuration authoritative. The report preserves disagreements rather than selecting the most visually impressive ranking.

## Alternative-method comparison

Robust MAD screening is transformer-specific and answers a different question from a global Isolation Forest. The percentile comparator is a simple distribution-relative screen. Agreement is measured; it is not evidence that either method identifies failure.

## Ranking and top-k stability

The robustness summary combines baseline and alternative condition-indicator runs. Top-k appearances are counts across configured runs, not probabilities. A transformer is labelled **CONSISTENTLY HIGH SCREENING** only when it appears in the top-3 in at least 70% of runs and has non-limited confidence. Otherwise, high indicator with material variation is labelled **METHOD-SENSITIVE** or **MODERATELY STABLE**.

## Stable screening results

{stable_lines}

## Method-sensitive or uncertain results

{sensitive_lines}

## Missingness, sampling gaps, and confidence

Missingness and long gaps are analysed as data-quality strata. Filtering changes the rows being summarized and can change coverage and rankings; it must not be interpreted as evidence of deterioration. Phase 11 confidence labels remain separate from condition. Limited confidence means the screening conclusion is less certain, not that the transformer is worse.

## Temporal robustness

Early, middle, and late historical periods are compared descriptively. Changes over time may reflect operating regime, measurement process, maintenance/oil-processing resets, or sampling changes. Temporal variation is not failure evidence.

## Consensus screening

Consensus is deliberately conservative. Multiple methods/configurations placing a transformer in the high screening group supports the phrase **consistently high screening**. Disagreement supports **method-sensitive** and a request for engineering/data-context review, not automatic escalation.

## Limitations

- No failure or fault outcomes exist for precision, recall, ROC-AUC, PR-AUC, calibration, or predictive-value validation.
- DGA observations are repeated and irregular; rows are not independent.
- Global and transformer-specific methods can disagree materially.
- Thresholds, weights, persistence definitions, and recency windows are prototype choices.
- Missingness and sampling gaps can inflate or distort anomaly proxy rates.
- Statistical reason codes describe unusual features relative to a reference distribution; they do not establish causality.
- All findings are retrospective and not real-time alarms.

## Responsible-use statement

This is an analytical screening and methodological robustness prototype. It complements SCADA, sensors, alarms, diagnostics, maintenance records, and qualified engineering inspection. It does not diagnose faults, predict failure probability, create work orders, control equipment, or replace professional judgement.

## Reproducibility

Run:

```bash
python3 scripts/phase12_robustness_validation.py
python3 -m unittest discover -s tests -p 'test_phase12_*.py' -v
```

Execution metadata: `{json.dumps(metadata, indent=2, default=str)}`

## Recommended next phase and approval gate

STOP after Phase 12. The recommended next phase is final dashboard/UX and technical documentation integration. Supervised failure prediction, RUL modelling, autonomous maintenance, or engineering diagnosis requires a new authoritative labelled event dataset and a new validation/approval gate.
"""
    (OUT / "PHASE_12_ROBUSTNESS_VALIDATION_REPORT.md").write_text(report)


def main() -> None:
    df, _, cols = load_inputs()
    df = df.sort_values(["transformer_id", "timestamp"]).reset_index(drop=True)
    full = pd.Series(True, index=df.index)
    gas_cols = [c for c in cols if c not in QUALITY_COLS]
    _, robust, _ = robust_baseline_scores(df, gas_cols, full, full)
    df["robust_score"] = robust
    df = add_filter_flags(df)

    # Baseline and threshold sensitivity use the already validated Phase 9B scores.
    threshold_rows = []
    threshold_runs: dict[str, pd.DataFrame] = {}
    base_flag = "anomaly_flag_top_5pct"
    for fraction in THRESHOLDS:
        tagged, threshold = flags_at_score(df, "anomaly_score", fraction, f"threshold_{fraction}")
        flag_col = f"flag_threshold_{fraction}"
        summary = compute_summary(tagged, "anomaly_score", flag_col)
        threshold_runs[f"threshold_{fraction}"] = summary
        threshold_rows.append({"threshold_percent": fraction * 100, "threshold_value": threshold, "flagged_observations": int(tagged[flag_col].sum()), "mean_asset_anomaly_rate": float(summary["total_anomaly_rate"].mean()), "top_transformers": " > ".join(summary.head(5)["transformer_id"]), "top3_priority_count": int(summary.head(3)["review_priority"].isin(["P1 — High Review Priority", "P2 — Review"]).sum()), "mean_max_run": float(summary["max_consecutive_anomalies"].mean())})
    threshold_df = pd.DataFrame(threshold_rows)
    threshold_base = threshold_runs["threshold_0.05"].set_index("transformer_id")["review_priority"]
    threshold_df["priority_changes_vs_5pct"] = [int((threshold_runs[f"threshold_{fraction}"].set_index("transformer_id")["review_priority"].reindex(threshold_base.index) != threshold_base).sum()) for fraction in THRESHOLDS]
    threshold_df.to_csv(OUT / "threshold_sensitivity.csv", index=False)

    # Parameter runs are deliberately small and fixed-seed.
    parameter_frames = fit_if_configs(df, cols)
    parameter_rows = []
    baseline_param = parameter_frames["IF_baseline_200_10000_05"]
    base_param_summary = compute_summary(baseline_param, "method_score", "method_flag")
    for name, frame in parameter_frames.items():
        summary = compute_summary(frame, "method_score", "method_flag")
        parameter_rows.append({"configuration": name, "flagged_observations": int(frame["method_flag"].sum()), "anomaly_rate": float(frame["method_flag"].mean()), "top_transformers": " > ".join(summary.head(5)["transformer_id"]), "spearman_vs_baseline": spearman(base_param_summary.set_index("transformer_id")["condition_indicator"], summary.set_index("transformer_id")["condition_indicator"]), "top3_overlap_vs_baseline": top_k_overlap(base_param_summary.set_index("transformer_id")["condition_indicator"], summary.set_index("transformer_id")["condition_indicator"], 3), "priority_agreement_vs_baseline": agreement(base_param_summary.set_index("transformer_id")["review_priority"], summary.set_index("transformer_id")["review_priority"])})
    pd.DataFrame(parameter_rows).to_csv(OUT / "model_parameter_sensitivity.csv", index=False)

    # Alternative methods.
    _, robust_flag = percentile_flag(df["robust_score"], .05)
    percentile_score = df[gas_cols].rank(pct=True).mean(axis=1, skipna=True).fillna(.5).to_numpy()
    _, percentile_flag_values = percentile_flag(percentile_score, .05)
    method_frames = {
        "IF_baseline": df.assign(method_score=df["anomaly_score"], method_flag=df[base_flag]),
        "Robust_MAD": df.assign(method_score=df["robust_score"], method_flag=robust_flag),
        "Within_transformer_percentile": df.assign(method_score=percentile_score, method_flag=percentile_flag_values),
    }
    method_summaries = {name: compute_summary(frame, "method_score", "method_flag") for name, frame in method_frames.items()}
    alternative_rows = []
    base_method = method_summaries["IF_baseline"].set_index("transformer_id")["condition_indicator"]
    for name, summary in method_summaries.items():
        scores = summary.set_index("transformer_id")["condition_indicator"]
        alternative_rows.append({"method": name, "flagged_observations": int(method_frames[name]["method_flag"].sum()), "anomaly_rate": float(method_frames[name]["method_flag"].mean()), "top_transformers": " > ".join(summary.head(5)["transformer_id"]), "spearman_vs_if": spearman(base_method, scores), "kendall_vs_if": kendall(base_method, scores), "top3_overlap_vs_if": top_k_overlap(base_method, scores, 3), "top5_overlap_vs_if": top_k_overlap(base_method, scores, 5), "priority_agreement_vs_if": agreement(summary.set_index("transformer_id")["review_priority"], method_summaries["IF_baseline"].set_index("transformer_id")["review_priority"])})
    pd.DataFrame(alternative_rows).to_csv(OUT / "alternative_method_comparison.csv", index=False)

    # Sensitivity runs used for stability summaries.
    all_runs: dict[str, pd.DataFrame] = {"IF_baseline": method_summaries["IF_baseline"]}
    all_runs.update({name: compute_summary(frame, "method_score", "method_flag") for name, frame in parameter_frames.items() if name != "IF_baseline_200_10000_05"})
    all_runs.update({name: summary for name, summary in method_summaries.items() if name != "IF_baseline"})
    for name, weights in WEIGHT_CONFIGS.items():
        all_runs[f"weights_{name}"] = compute_summary(df, "anomaly_score", base_flag, weights=weights)
    for days in [90, 365]:
        all_runs[f"recency_{days}d"] = compute_summary(df, "anomaly_score", base_flag, recent_days=days)
    for name, edges in BAND_CONFIGS.items():
        all_runs[f"bands_{name}"] = compute_summary(df, "anomaly_score", base_flag, band_edges=edges)
    for cap, episode_cap in [(2, 3), (5, 5), (10, 10)]:
        all_runs[f"persistence_run{cap}_episodes{episode_cap}"] = compute_summary(df, "anomaly_score", base_flag, persistence_cap=cap, episode_cap=episode_cap)

    rank_stability = []
    base_rank = all_runs["IF_baseline"].set_index("transformer_id")["condition_indicator"]
    for name, frame in all_runs.items():
        score = frame.set_index("transformer_id")["condition_indicator"]
        rank_stability.append({"configuration": name, "spearman_vs_baseline": spearman(base_rank, score), "kendall_vs_baseline": kendall(base_rank, score), "top3_overlap": top_k_overlap(base_rank, score, 3), "top5_overlap": top_k_overlap(base_rank, score, 5), "top25pct_overlap": top_k_overlap(base_rank, score, max(1, math.ceil(len(score) * .25))), "band_agreement": agreement(frame.set_index("transformer_id")["condition_band"], all_runs["IF_baseline"].set_index("transformer_id")["condition_band"]), "priority_agreement": agreement(frame.set_index("transformer_id")["review_priority"], all_runs["IF_baseline"].set_index("transformer_id")["review_priority"])})
    pd.DataFrame(rank_stability).to_csv(OUT / "transformer_ranking_stability.csv", index=False)

    top_k_rows = []
    for asset in df["transformer_id"].unique():
        for k_name, k in [("top3", 3), ("top5", 5), ("top25pct", max(1, math.ceil(len(df["transformer_id"].unique()) * .25)))]:
            appearances = sum(asset in set(frame.sort_values("condition_indicator", ascending=False).head(k)["transformer_id"]) for frame in all_runs.values())
            top_k_rows.append({"transformer_id": asset, "top_k": k_name, "appearances": appearances, "number_of_runs": len(all_runs), "stability_percentage": appearances / len(all_runs)})
    pd.DataFrame(top_k_rows).to_csv(OUT / "top_k_stability.csv", index=False)

    # Weight, band, persistence, and recency tables.
    base = all_runs["IF_baseline"].set_index("transformer_id")
    weight_rows = []
    for name in WEIGHT_CONFIGS:
        frame = all_runs[f"weights_{name}"].set_index("transformer_id")
        weight_rows.append({"weight_config": name, "spearman_vs_baseline": spearman(base["condition_indicator"], frame["condition_indicator"]), "top3_overlap": top_k_overlap(base["condition_indicator"], frame["condition_indicator"], 3), "condition_band_changes": int((base["condition_band"].reindex(frame.index) != frame["condition_band"]).sum()), "priority_changes": int((base["review_priority"].reindex(frame.index) != frame["review_priority"]).sum()), "top_transformers": " > ".join(frame.sort_values("condition_indicator", ascending=False).head(5).index)})
    pd.DataFrame(weight_rows).to_csv(OUT / "condition_weight_sensitivity.csv", index=False)

    band_rows = []
    for name in BAND_CONFIGS:
        frame = all_runs[f"bands_{name}"].set_index("transformer_id")
        changed = base.index[base["condition_band"] != frame["condition_band"]].tolist()
        band_rows.append({"band_config": name, "edges": "/".join(map(str, BAND_CONFIGS[name])), "classification_changes": len(changed), "changed_transformers": ", ".join(changed), "borderline_transformers": ", ".join(base.index[(base["condition_indicator"] - BAND_CONFIGS[name][0]).abs().lt(5) | (base["condition_indicator"] - BAND_CONFIGS[name][1]).abs().lt(5) | (base["condition_indicator"] - BAND_CONFIGS[name][2]).abs().lt(5)])})
    pd.DataFrame(band_rows).to_csv(OUT / "condition_band_sensitivity.csv", index=False)

    persist_rows = []
    for name in [n for n in all_runs if n.startswith("persistence_")]:
        frame = all_runs[name].set_index("transformer_id")
        persist_rows.append({"persistence_config": name, "priority_changes": int((base["review_priority"].reindex(frame.index) != frame["review_priority"]).sum()), "band_changes": int((base["condition_band"].reindex(frame.index) != frame["condition_band"]).sum()), "spearman_vs_baseline": spearman(base["condition_indicator"], frame["condition_indicator"]), "top_transformers": " > ".join(frame.sort_values("condition_indicator", ascending=False).head(5).index)})
    pd.DataFrame(persist_rows).to_csv(OUT / "persistence_sensitivity.csv", index=False)

    recency_rows = []
    for days in [90, 180, 365]:
        frame = base if days == 180 else all_runs[f"recency_{days}d"].set_index("transformer_id")
        recency_rows.append({"recent_window_days": days, "spearman_vs_baseline": spearman(base["condition_indicator"], frame["condition_indicator"]), "top3_overlap": top_k_overlap(base["condition_indicator"], frame["condition_indicator"], 3), "mean_recent_rate": float(frame["recent_anomaly_rate"].mean()), "priority_changes": int((base["review_priority"].reindex(frame.index) != frame["review_priority"]).sum()), "top_transformers": " > ".join(frame.sort_values("condition_indicator", ascending=False).head(5).index)})
    pd.DataFrame(recency_rows).to_csv(OUT / "recency_sensitivity.csv", index=False)

    # Missingness and gap filters retain the full-data baseline as a separate row.
    filter_rows = []
    missing_scenarios = [("full_available", None), ("zero_missing_gases", "low_missing"), ("at_most_one_missing_gas", "moderate_missing")]
    for name, mask_col in missing_scenarios:
        sub = df if mask_col is None else df[df[mask_col]]
        frame = compute_summary(sub, "anomaly_score", base_flag)
        filter_rows.append({"scenario": name, "observations": len(sub), "anomaly_rate": float(sub[base_flag].mean()), "transformer_count": sub["transformer_id"].nunique(), "spearman_vs_full": spearman(base["condition_indicator"], frame.set_index("transformer_id")["condition_indicator"]), "priority_changes_vs_full": int((base["review_priority"].reindex(frame.set_index("transformer_id").index) != frame.set_index("transformer_id")["review_priority"]).sum()), "limited_confidence_count": int((frame["confidence"] == "Limited confidence").sum())})
    missing_df = pd.DataFrame(filter_rows); missing_df.to_csv(OUT / "missingness_sensitivity.csv", index=False)

    gap_rows = []
    gap_scenarios = [("full_available", None), ("gap_le_8h", "gap_8h"), ("gap_le_24h", "gap_24h"), ("gap_le_7d", "gap_7d")]
    for name, mask_col in gap_scenarios:
        sub = df if mask_col is None else df[df[mask_col]]
        frame = compute_summary(sub, "anomaly_score", base_flag)
        gap_rows.append({"scenario": name, "observations": len(sub), "anomaly_rate": float(sub[base_flag].mean()), "transformer_count": sub["transformer_id"].nunique(), "spearman_vs_full": spearman(base["condition_indicator"], frame.set_index("transformer_id")["condition_indicator"]), "priority_changes_vs_full": int((base["review_priority"].reindex(frame.set_index("transformer_id").index) != frame.set_index("transformer_id")["review_priority"]).sum()), "limited_confidence_count": int((frame["confidence"] == "Limited confidence").sum())})
    gap_df = pd.DataFrame(gap_rows); gap_df.to_csv(OUT / "sampling_gap_sensitivity.csv", index=False)

    # Early/middle/late temporal robustness.
    periods = []
    for asset, group in df.groupby("transformer_id", sort=False):
        group = group.sort_values("timestamp").copy(); n = len(group); cuts = [0, n // 3, 2 * n // 3, n]
        for label, lo, hi in [("early", cuts[0], cuts[1]), ("middle", cuts[1], cuts[2]), ("late", cuts[2], cuts[3])]:
            periods.append(compute_summary(group.iloc[lo:hi], "anomaly_score", base_flag).assign(period=label))
    temporal = pd.concat(periods, ignore_index=True)
    temporal.to_csv(OUT / "temporal_robustness.csv", index=False)

    # Transformer robustness and conservative consensus.
    run_frames = list(all_runs.items())
    robustness_rows = []
    top3_sets = {name: set(frame.sort_values("condition_indicator", ascending=False).head(3)["transformer_id"]) for name, frame in run_frames}
    for asset in sorted(df["transformer_id"].unique()):
        values = np.array([float(frame.set_index("transformer_id").loc[asset, "condition_indicator"]) for _, frame in run_frames])
        priorities = [str(frame.set_index("transformer_id").loc[asset, "review_priority"]) for _, frame in run_frames]
        bands = [str(frame.set_index("transformer_id").loc[asset, "condition_band"]) for _, frame in run_frames]
        base_row = base.loc[asset]
        top3_count = sum(asset in group for group in top3_sets.values())
        confidence = str(base_row["confidence"])
        if confidence == "Limited confidence" or int(base_row["observations"]) < 100:
            category = "INSUFFICIENT DATA"
        elif top3_count / len(run_frames) >= .70 and float(values.std()) < 10:
            category = "STABLE"
        elif float(values.std()) < 15 and len(set(priorities)) <= 2:
            category = "MODERATELY STABLE"
        else:
            category = "SENSITIVE"
        robustness_rows.append({"transformer_id": asset, "baseline_indicator": float(base_row["condition_indicator"]), "median_indicator": float(np.median(values)), "minimum_indicator": float(values.min()), "maximum_indicator": float(values.max()), "indicator_std": float(values.std()), "number_of_runs": len(run_frames), "number_of_methods": 3, "top3_appearances": top3_count, "top5_appearances": sum(asset in set(frame.sort_values("condition_indicator", ascending=False).head(5)["transformer_id"]) for _, frame in run_frames), "priority_agreement": float(pd.Series(priorities).eq(priorities[0]).mean()), "band_agreement": float(pd.Series(bands).eq(bands[0]).mean()), "confidence": confidence, "baseline_priority": str(base_row["review_priority"]), "stability_category": category})
    robustness = pd.DataFrame(robustness_rows).sort_values(["baseline_indicator", "indicator_std"], ascending=[False, True])
    robustness.to_csv(OUT / "transformer_robustness_summary.csv", index=False)
    consensus = robustness.copy()
    consensus["consensus_screening"] = np.where((consensus["top3_appearances"] / consensus["number_of_runs"] >= .70) & (consensus["baseline_indicator"] >= 75) & (consensus["confidence"] != "Limited confidence"), "CONSISTENTLY HIGH SCREENING", np.where(consensus["stability_category"].isin(["SENSITIVE", "INSUFFICIENT DATA"]), "METHOD-SENSITIVE / UNCERTAIN", "NOT CONSENSUS-HIGH"))
    consensus["interpretation"] = consensus.apply(lambda r: f"{r.transformer_id} remains highly ranked across most tested analytical configurations." if r["consensus_screening"] == "CONSISTENTLY HIGH SCREENING" else f"{r.transformer_id} should be interpreted with methodological and data-quality context; this is not failure evidence.", axis=1)
    consensus.to_csv(OUT / "consensus_screening_summary.csv", index=False)

    chart_runs = {"IF baseline": all_runs["IF_baseline"], "Robust MAD": method_summaries["Robust_MAD"], "Percentile": method_summaries["Within_transformer_percentile"], "Weights / intensity": all_runs["weights_intensity_emphasis_45_15_15_15_10"], "Weights / persistence": all_runs["weights_persistence_emphasis_20_40_15_15_10"], "Recency / 90d": all_runs["recency_90d"], "Recency / 365d": all_runs["recency_365d"]}
    chart_outputs(chart_runs, threshold_df, missing_df, gap_df)

    metadata = {"dataset": "UK Power Station Transformer DGA 2010-2015", "transformers": int(df["transformer_id"].nunique()), "rows": int(len(df)), "random_state": 42, "thresholds": THRESHOLDS, "weight_configs": WEIGHT_CONFIGS, "band_configs": BAND_CONFIGS, "recency_windows_days": [90, 180, 365], "sampling_gap_filters_hours": [8, 24, 168], "failure_target_used": False, "failure_probability_used": False, "synthetic_data_used": False}
    (OUT / "phase12_summary.json").write_text(json.dumps(metadata, indent=2, default=str))
    stable = consensus[consensus["consensus_screening"] == "CONSISTENTLY HIGH SCREENING"]
    sensitive = consensus[consensus["consensus_screening"] == "METHOD-SENSITIVE / UNCERTAIN"].sort_values("indicator_std", ascending=False)
    write_report(metadata, stable, sensitive)
    print(json.dumps(metadata, indent=2, default=str))


if __name__ == "__main__":
    main()
