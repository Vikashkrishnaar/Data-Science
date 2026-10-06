# Phase 7 — Real model pipeline status

## Completed on the validated real data

- Loaded the normalized compressed DGA table with schema checks for `transformer_id`, `timestamp`, `phase`, `gas`, and `ppm`.
- Removed invalid rows with missing required fields and rejected negative ppm values.
- Aggregated phase readings by transformer, timestamp, and gas.
- Created leakage-safe current and trailing features: log-transformed concentrations, first differences, trailing mean/std windows, observed/missing gas counts, and time since the previous record.
- Produced real EDA summaries for gases and transformers, plus measurement-count and selected-gas trend plots.

Dataset rows after cleaning: **1,920,417**. Feature rows: **203,214**. Transformers: **13**.

## Approval gate: real target unavailable

The validated source contains no failure, fault, health, maintenance-outcome, outage, or event label. Therefore a real supervised target cannot be created honestly, and the following steps were intentionally **not** run:

- Real train/test split for supervised prediction
- Model comparison
- Real precision, recall, F1, ROC-AUC, PR-AUC, calibration, or confusion matrix
- Supervised error analysis
- Supervised explainability

This is a required stop condition, not a pipeline failure. Creating `failure_24h` from gas thresholds would produce a proxy/anomaly label, not a real failure target, and must not be presented as a real failure model.

## Next decision

Choose one of the documented options in `phase7_target_gate.json`: obtain authoritative external labels, approve an unsupervised DGA anomaly objective, or redefine the project as DGA diagnostic classification after a labelled source is acquired.

## Outputs

- `real_feature_table.csv.gz` — normalized, feature-engineered real observations
- `real_eda_gas_summary.csv` — gas-level EDA
- `real_eda_asset_summary.csv` — transformer-level EDA
- `real_eda_measurements_by_gas.png` — measurement coverage chart
- `real_eda_selected_gas_trends.png` — selected-gas trend chart
- `phase7_target_gate.json` — target and modelling decision record
