# Phase 12 implementation plan — Real DGA robustness, sensitivity & final validation

## Objective
Determine how much the Phase 9B anomaly-screening and Phase 11 condition-assessment conclusions change under reasonable methodological alternatives, without introducing failure labels, probabilities, artificial ground truth, or supervised metrics.

## Reuse and data boundary
- Reuse the validated Phase 7 real feature table, Phase 9B anomaly scores, Phase 10 robust-baseline helpers, and Phase 11 aggregation/classification rules.
- Keep the real-data and synthetic-data evidence tracks separate.
- Treat all outputs as retrospective analytical screening and methodological stability evidence, never as equipment health, failure risk, fault probability, or engineering diagnosis.

## Analysis design
1. Recompute fixed-seed Isolation Forest screening under 1%, 2.5%, 5%, 7.5%, and 10% row thresholds; report asset rates, rankings, persistence, and priority changes.
2. Test a small interpretable Isolation Forest grid across estimators, max_samples, and contamination; do not optimize a winner.
3. Compare the baseline with transformer-specific robust MAD screening and a percentile-based alternative; report rank correlations, top-k overlap, and disagreement.
4. Recalculate the Phase 11 indicator under baseline, intensity-emphasis, persistence-emphasis, and transformer-baseline-emphasis weights; vary bands, persistence rules, and 90/180/365-day recency windows.
5. Filter descriptive sensitivity views by missingness and sampling-gap cutoffs while preserving the full-data baseline; report consequences rather than treating missingness as deterioration.
6. Compare early/middle/late historical periods and produce per-transformer methodological stability, top-k appearances, priority agreement, confidence, and consensus screening.
7. Generate only useful charts: rank stability, top-k overlap, threshold/weight effects, missingness/gap effects, method comparison, robustness matrix, and stable-versus-sensitive assets.

## Deliverables
- `scripts/phase12_robustness_validation.py`
- `artifacts/phase12_robustness_validation/` with the required CSV summaries, charts, report, and JSON metadata
- `tests/test_phase12_robustness_validation.py` covering threshold/rank/top-k/correlation/weight/band/persistence/recency/filter/confidence/stability/consensus edge cases
- A restrained expandable/secondary dashboard section titled **Real DGA Robustness & Validation** with the main findings, stable/method-sensitive transformers, and limitations.

## Approval boundary
Stop after Phase 12. Do not begin supervised failure prediction, RUL modelling, autonomous maintenance, or engineering diagnosis unless a new authoritative labelled event dataset passes a separate validation and approval gate.
