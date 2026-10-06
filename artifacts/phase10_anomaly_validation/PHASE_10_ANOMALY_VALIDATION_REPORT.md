# Phase 10 — Real DGA anomaly methodology validation

## Purpose

This phase tests whether the real UK DGA anomaly screen is stable, reproducible, temporally sensible, transformer-specific, interpretable, and suitable only for engineering-review screening. It does **not** create a failure-prediction model.

## Data and leakage audit

- Rows audited: **203,214** across **13** transformers.
- Feature generation is ordered by transformer and timestamp; deltas and rolling windows are trailing. No centered windows, future interpolation, future labels, or target-derived variables were found.
- The existing Phase 9B full-period Isolation Forest is retrospective: its fitted distribution includes the full period. It is not a real-time score without refitting. Phase 10 therefore adds an earlier-70% / later-30% time-safe holdout comparison.
- Duplicate key check: **passed**. Timestamp ordering check: **passed**.

## Methods compared

1. Phase 9B global Isolation Forest, retrospective.
2. Transformer-specific median/MAD robust baseline, retrospective.
3. Global Isolation Forest fitted on earlier observations and scored on the later 30% per transformer.
4. Transformer-specific median/MAD baseline fitted on earlier observations and scored on the later 30%.

The robust baseline uses the mean of the three largest robust deviations across current/trailing DGA features. It is a transparent deviation screen, not a causal explanation.

## Results and interpretation

- Phase 9B top-5% proxy rate: **5.00%** by construction.
- Reason-code match rate among the 100 highest Phase 9B scores: **100.0%** against an independently recomputed transformer-specific robust maximum-deviation check.
- Transformer-specific rankings, method overlap, sensitivity configurations, missingness/sampling groups, temporal summaries, and charts are stored in the Phase 10 CSV/PNG artifacts.
- The analysis reports unusual DGA behaviour and screening indicators only. It does not infer failure, fault, health, remaining useful life, or maintenance necessity.

## Evidence-based findings

- **Isolation Forest parameter stability:** across the tested 1%, 5%, and 10% screening configurations, the leading transformer order remained TX-M > TX-I > TX-J > TX-F > TX-L; lower-ranked assets showed only small swaps. This supports repeatability of the global fleet ranking under these settings, not engineering validity.
- **Method sensitivity:** the retrospective transformer-specific robust baseline had only about 10.5% Jaccard overlap with the Phase 9B Isolation Forest queue, and the time-safe holdout overlap was about 9.2%. Rankings therefore change materially by method; the methods are different screening lenses, not interchangeable truth.
- **Missingness effect:** rows with one missing gas had a 46.76% Phase 9B top-5% proxy rate versus 3.15% for rows with no missing gases. Missingness is therefore a strong data-quality confounder and must not be silently interpreted as equipment abnormality.
- **Sampling-gap effect:** the >72-hour gap group had an 83.33% proxy rate, but contained only 24 observations; 24–72 hours had 60.00% across 15 observations. These sparse groups are unstable evidence and require review of sampling practice before interpretation.
- **Reason codes:** validation now compares against the same gas-only deviation features used by the Phase 9B generator; any displayed code is a statistical deviation indicator, not a causal explanation.

## Required caution

High scores can reflect unusual gas behaviour, missingness, long sampling gaps, maintenance/oil-processing resets, regime changes, or measurement quality. A higher absolute gas concentration is not automatically abnormal; transformer-specific baselines are required.

## Outputs

- `anomaly_method_comparison.csv`
- `anomaly_sensitivity_results.csv`
- `transformer_ranking_stability.csv`
- `transformer_specific_baseline_summary.csv`
- `reason_code_validation.csv`
- `missingness_sampling_analysis.csv`
- `threshold_sensitivity.csv`
- `temporal_anomaly_validation.csv`
- `leakage_audit.json`
- `phase10_summary.json`
- `anomaly_score_over_time_by_transformer.png`
- `method_transformer_comparison.png`
- `missingness_sampling_effect.png`

## Human approval gate

STOP after this report. Do not automatically add real health scores, risk bands, maintenance prioritisation, supervised modelling, or a full dashboard redesign. The recommended next step is human review of method stability, data-quality effects, and transformer-specific ranking behaviour.
