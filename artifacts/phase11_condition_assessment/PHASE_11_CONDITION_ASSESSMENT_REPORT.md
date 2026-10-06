# Phase 11 — Real DGA Condition Assessment & Engineering Review Prioritisation

## Executive summary

Phase 11 converts the validated real UK DGA anomaly evidence into a transparent **DGA Condition Indicator — Prototype** and an engineering-review screening queue. It is a retrospective analytical summary of real DGA observations across **13 transformers** and **203,214 feature rows**.

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

Priority counts: **{'P2 — Review': 6, 'P3 — Monitor': 5, 'P1 — High Review Priority': 2}**. Confidence counts: **{'High confidence': 11, 'Limited confidence': 1, 'Moderate confidence': 1}**.

Top screening results:

- **TX-I** — indicator 90.72, HIGH REVIEW, P1 — High Review Priority, High confidence; reasons: Strong DGA deviation: carbon monoxide change; Persistent or repeated anomaly behaviour; Recent anomaly activity
- **TX-M** — indicator 80.40, HIGH REVIEW, P1 — High Review Priority, High confidence; reasons: Strong DGA deviation: ethane concentration; Persistent or repeated anomaly behaviour; Recent anomaly activity
- **TX-J** — indicator 80.38, HIGH REVIEW, P2 — Review, Limited confidence; reasons: Strong DGA deviation: hydrogen change; Persistent or repeated anomaly behaviour; Recent anomaly activity; Transformer-specific baseline deviation; Data-quality or sampling limitation
- **TX-L** — indicator 62.73, REVIEW, P2 — Review, High confidence; reasons: Strong DGA deviation: oxygen variability; Persistent or repeated anomaly behaviour; Recent anomaly activity; Transformer-specific baseline deviation
- **TX-F** — indicator 57.26, REVIEW, P2 — Review, High confidence; reasons: Strong DGA deviation: ethane variability; Persistent or repeated anomaly behaviour; Recent anomaly activity

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
