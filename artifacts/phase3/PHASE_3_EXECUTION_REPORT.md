# Phase 3 execution report — synthetic demonstration

This report is generated from a fixed-seed synthetic transformer-sensor dataset. It demonstrates the pipeline only; it is not evidence of real transformer performance.

- Rows: 5760 | assets: 12 | labelled rows: 5472
- Synthetic failure_24h positive rate: 0.6106
- Engineered feature count: 25
- Chronological split rows: train=3276, validation=1092, test=1104

## Test metrics

| Model | Precision | Recall | F1 | ROC-AUC | PR-AUC | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| Logistic Regression | 0.655 | 0.662 | 0.659 | 0.652 | 0.648 | 0.636 |
| Random Forest | 0.618 | 0.681 | 0.648 | 0.592 | 0.608 | 0.607 |

## Outputs

- `sample_sensor_data.csv` — generated raw telemetry and event fields.
- `processed_features.csv` — leakage-safe trailing features and provisional target.
- `feature_dictionary.csv` — generated dictionary for the synthetic feature table.
- `eda_*.png` — target balance, temperature trend, and correlation map.
- `metrics.json` — split manifest, metrics, and disclaimer.
- `risk_predictions.json` — latest test-period synthetic risk rows from Random Forest.

## Limitation

Replace the synthetic generator with a documented real dataset before making any engineering, maintenance, or deployment claim.
