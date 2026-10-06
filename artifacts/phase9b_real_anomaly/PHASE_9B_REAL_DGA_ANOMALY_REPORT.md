# Phase 9B — Real UK DGA anomaly and proxy analysis

## Approved objective

The approved path is **unsupervised/proxy analysis** of the real UK Power Station Transformer DGA dataset. This is not supervised failure prediction. No failure labels were invented and no future-failure target was trained.

## Execution

- Observations scored: **203,214**
- Transformers: **13**
- Coverage: **2010-07-02 to 2015-07-09**
- Algorithm: `IsolationForest(n_estimators=200, max_samples=10000, contamination=0.05, random_state=42)`
- Proxy: rows at or above the 95th percentile of the unsupervised score
- Proxy rate: **5.00%**

## Features

The model used current/trailing DGA features from the validated Phase 7 feature table: log-transformed gas concentrations, first differences, trailing variability, observed/missing gas counts, and hours since the previous record. Missing values were imputed using transformer medians with a global-median fallback, then robust-scaled.

## Interpretation boundary

Anomaly score means **unusual relative to the fitted DGA feature distribution**. The top-5% flag is a descriptive analysis proxy, not a failure, fault, health, maintenance, outage, or probability-of-failure label. High scores may reflect unusual gas behaviour, data gaps, maintenance/oil-processing resets, regime changes, or measurement quality issues.

## Outputs

- `real_dga_anomaly_scores.csv.gz` — scored real feature rows
- `top_1000_dga_anomalies.csv` — review queue for the highest-scoring rows
- `asset_anomaly_summary.csv` — transformer-level p95 and proxy-rate summary
- `monthly_anomaly_summary.csv` — time summary
- `anomaly_reason_summary.csv` — robust deviation reason-code counts within top-5% rows
- `asset_anomaly_p95.png` — transformer comparison
- `monthly_anomaly_proxy_rate.png` — monthly proxy-rate chart
- `phase9b_anomaly_summary.json` — reproducibility and limitations record

## What was not done

- No supervised train/test split
- No failure/fault target construction
- No precision, recall, F1, ROC-AUC, PR-AUC, calibration, or confusion matrix
- No claim that anomalous rows are failed or failing transformers

## Next approval gate

Review the anomaly queue and transformer summaries with engineering context. Before making maintenance claims or supervised predictions, obtain an authoritative event/fault table or approve a documented engineering alarm objective.
