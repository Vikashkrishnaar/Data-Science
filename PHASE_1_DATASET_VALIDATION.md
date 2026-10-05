# Phase 1 — Dataset selection and data validation plan

**Project:** Smart Grid Health Monitoring and Failure Prediction Using IoT Sensor Data  
**Status:** Plan executed; dataset selection remains an explicit approval gate  
**Decision date:** 2026-10-05

## 1. Phase 1 decision

No dataset is present in the current GridWatch project workspace. Therefore, Phase 1 does **not** claim that a source has been selected, that failure labels exist, or that the initial `failure_24h` target is feasible.

The correct Phase 1 outcome is a selection and validation protocol. The next approval is to provide or approve a real, documented dataset. Until that happens, model training, performance metrics, and real asset-risk claims remain out of scope.

This is intentional: the project must not fabricate labels, assume oil/winding-temperature coverage, or force a 24-hour horizon onto data that cannot support it.

## 2. Dataset selection rubric

A candidate dataset should be preferred when it has:

| Requirement | Minimum evidence to record | Why it matters |
|---|---|---|
| Asset identity | Stable transformer/equipment ID | Enables asset-level comparisons and leakage-safe history |
| Time axis | Timestamp, timezone, ordering, collection period | Required for temporal features and future-event labelling |
| Operating measurements | Documented electrical, thermal, loading, or other available variables | Defines the actual feature space; no invented sensors |
| Failure information | Failure event flag or timestamp with a documented definition | Required for a defensible future-failure target |
| History | Sufficient duration and repeated readings per asset | Supports rolling features and chronological evaluation |
| Documentation | Source URL, collection method, units, missingness notes, licence | Makes the work reproducible and academically defensible |
| Maintenance context | Maintenance events or time-since-maintenance where available | Enables history features without assuming them |

A dataset can still be useful for condition exploration without being suitable for failure prediction. That distinction must be recorded rather than hidden.

## 3. Validation protocol

### Schema and provenance

Record file format, row count, column names, data types, asset count, feature count, units, source, licence, and collection method. Confirm whether multiple rows represent repeated readings, event logs, maintenance records, or a mixture.

### Time integrity

Parse timestamps with timezone handling where available. Check ordering, duplicate timestamps within asset, irregular sampling, gaps, clock resets, future timestamps, and the actual collection period. Estimate sampling frequency per asset instead of assuming a global interval.

### Data quality

Quantify missingness by feature, asset, and time window. Detect duplicate records, impossible values, inconsistent units, category drift, invalid asset IDs, sensor-range violations, and suspicious resets. Do not silently delete problematic rows; record each cleaning decision and its effect.

### Failure and maintenance validation

Confirm how failure is defined, whether the event timestamp is precise enough for a future horizon, whether multiple records refer to the same incident, and whether maintenance occurs before or after the measurement. Check class balance and whether non-failure observations are genuinely observed rather than simply unlabeled.

### Leakage review

For every candidate feature, record the timestamp at which it becomes available. Exclude post-event, post-maintenance, or future-aggregated information from inputs. Fit imputers, scalers, encoders, and thresholds using training data only.

## 4. Target definition gate

The proposed target is `failure_24h = 1` when a valid failure event occurs within 24 hours after observation time `T`, and `0` otherwise. This remains **provisional**.

The 24-hour horizon may be changed only after inspecting event density, timestamp precision, sampling frequency, and operational usefulness. If actual failure-event timestamps are unavailable or insufficient to define a valid future label, stop the prediction phase and report the limitation. Do not fabricate labels from anomalies, thresholds, or random sampling.

## 5. Feature-engineering strategy

Only variables confirmed in the selected dataset will be used. Candidate features are organised by the information available before timestamp `T`.

| Feature family | Candidate construction | Preconditions | Leakage control |
|---|---|---|---|
| Current operating state | Latest value, lagged value, change from previous reading | Ordered repeated readings per asset | Use only values at or before `T` |
| Rolling level | Mean, median, min, max over recent windows | Stable enough sampling to define windows | Compute trailing windows only |
| Rolling variability | Standard deviation, interquartile range, coefficient of variation | Numeric repeated measurements | No centred/future windows |
| Rate of change | First difference, slope, temperature/current/load ramp | At least two valid prior readings | Bound to the pre-`T` history |
| Operating deviation | Deviation from asset baseline or documented operating range | Baseline/range can be estimated from training history | Fit baseline on training period only |
| Excursion behaviour | Count, duration, and recency of overload or abnormal readings | Threshold definition is documented and available | Do not use thresholds derived from future failures |
| Missingness signal | Missing indicator, recent gap length, stale-reading flag | Missingness is meaningful and measurable | Calculate from data available by `T` |
| Asset history | Transformer age, time since maintenance, prior failure count | Confirmed maintenance/failure history | Use event history strictly before `T` |
| Cross-sensor context | Load–temperature relationship, voltage/current ratio, power-factor interaction | Both variables exist with compatible units | Validate physics and compute pre-`T` only |

### Window policy

Window lengths should be expressed in elapsed time and selected only after sampling inspection. The starting candidates are short, medium, and daily trailing windows—not fixed promises of 1h/6h/24h. If sampling is too sparse or irregular, use observation-count windows or omit the feature family.

### Feature acceptance tests

Every engineered feature must have: a plain-language definition, units or scale, source columns, timestamp availability, missing-value behaviour, physical/statistical rationale, and a leakage status. Features that cannot be explained or reproduced are not promoted to the modelling table.

### Preprocessing order

1. Validate schema, timestamps, units, and asset IDs.
2. Sort within asset and isolate invalid/duplicate records for reporting.
3. Split chronologically before fitting learned preprocessing.
4. Fit imputers, scalers, encoders, and baselines on training data only.
5. Generate trailing features without future rows.
6. Construct the target from future events separately from input features.
7. Audit feature availability and class balance in each split.

## 6. Modelling handoff after approval

After the dataset passes the gate, start with Logistic Regression and Random Forest baselines. Prefer chronological train/validation/test splits when temporal leakage is possible. Evaluate precision, recall, F1, ROC-AUC, PR-AUC, confusion matrix, threshold behaviour, and calibration; examine false positives and false negatives rather than accuracy alone. Add explainability only after the feature table and target definition are stable.

## 7. Evidence required to close Phase 1

Phase 1 can move to approval when the project has a completed dataset assessment report, source/licence notes, a data-quality report, a confirmed target definition or documented stop decision, a feature dictionary, a leakage register, and a reproducible preprocessing specification.

**Current blocker:** provide or approve a real dataset and its documentation. Until then, GridWatch remains a transparent prototype interface with illustrative records only.
