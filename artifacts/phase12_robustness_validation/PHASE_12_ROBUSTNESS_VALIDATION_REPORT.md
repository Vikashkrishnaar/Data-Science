# Phase 12 — Real DGA Robustness, Sensitivity & Final Validation

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

- **TX-I** — baseline indicator 90.72; stability SENSITIVE; top-3 appearances 17/18
- **TX-M** — baseline indicator 80.40; stability SENSITIVE; top-3 appearances 16/18

## Method-sensitive or uncertain results

- **TX-A** — baseline indicator 50.71; indicator range 8.08–57.69; std 11.56; category SENSITIVE
- **TX-J** — baseline indicator 80.38; indicator range 51.10–100.00; std 9.60; category INSUFFICIENT DATA
- **TX-C** — baseline indicator 52.08; indicator range 37.89–85.65; std 9.58; category SENSITIVE
- **TX-G** — baseline indicator 39.04; indicator range 12.12–54.04; std 7.68; category SENSITIVE
- **TX-E** — baseline indicator 39.04; indicator range 12.12–54.04; std 7.68; category SENSITIVE
- **TX-F** — baseline indicator 57.26; indicator range 37.31–76.39; std 7.58; category SENSITIVE
- **TX-B** — baseline indicator 35.00; indicator range 23.27–53.46; std 6.83; category SENSITIVE

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

Execution metadata: `{
  "dataset": "UK Power Station Transformer DGA 2010-2015",
  "transformers": 13,
  "rows": 203214,
  "random_state": 42,
  "thresholds": [
    0.01,
    0.025,
    0.05,
    0.075,
    0.1
  ],
  "weight_configs": {
    "baseline_30_20_20_15_15": {
      "intensity": 0.3,
      "persistence": 0.2,
      "recency": 0.2,
      "specific_baseline": 0.15,
      "trend": 0.15
    },
    "intensity_emphasis_45_15_15_15_10": {
      "intensity": 0.45,
      "persistence": 0.15,
      "recency": 0.15,
      "specific_baseline": 0.15,
      "trend": 0.1
    },
    "persistence_emphasis_20_40_15_15_10": {
      "intensity": 0.2,
      "persistence": 0.4,
      "recency": 0.15,
      "specific_baseline": 0.15,
      "trend": 0.1
    },
    "baseline_emphasis_20_15_15_40_20": {
      "intensity": 0.2,
      "persistence": 0.15,
      "recency": 0.15,
      "specific_baseline": 0.4,
      "trend": 0.1
    }
  },
  "band_configs": {
    "baseline_25_50_75": [
      25,
      50,
      75
    ],
    "tighter_20_45_70": [
      20,
      45,
      70
    ],
    "wider_30_55_80": [
      30,
      55,
      80
    ]
  },
  "recency_windows_days": [
    90,
    180,
    365
  ],
  "sampling_gap_filters_hours": [
    8,
    24,
    168
  ],
  "failure_target_used": false,
  "failure_probability_used": false,
  "synthetic_data_used": false
}`

## Recommended next phase and approval gate

STOP after Phase 12. The recommended next phase is final dashboard/UX and technical documentation integration. Supervised failure prediction, RUL modelling, autonomous maintenance, or engineering diagnosis requires a new authoritative labelled event dataset and a new validation/approval gate.
