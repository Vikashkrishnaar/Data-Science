# Phase 2 — Data dictionary, preprocessing, EDA, baseline modelling, and feature specification

**Project:** Smart Grid Health Monitoring and Failure Prediction Using IoT Sensor Data  
**Status:** Specification executed; dataset-dependent computation is blocked until a real source is approved  
**Decision date:** 2026-10-05  
**Dependency:** [Phase 1 dataset validation plan](./PHASE_1_DATASET_VALIDATION.md)

## 1. Phase 2 decision and boundary

The GridWatch workspace still contains no real dataset. Phase 2 therefore produces the reproducible implementation specification, data dictionary template, analysis questions, and baseline-model protocol—but does **not** claim that preprocessing, EDA charts, labels, fitted models, or metrics have been run.

No simulated data is introduced. Once a documented dataset is provided, the specification below can be executed against the observed schema. Any field marked **candidate** must be confirmed from the data and its documentation before entering the modelling table.

### Phase 2 gate

| Status | Meaning |
|---|---|
| Ready | Specification, feature contract, leakage controls, and baseline evaluation protocol are defined |
| Blocked | No real dataset, source notes, or failure-event definition is present in the workspace |
| Required next input | Dataset file or URL, source documentation, licence, units, and failure / maintenance definitions |

## 2. Data dictionary contract

The final data dictionary must be generated from the selected dataset. The following dictionary is the **pre-data contract**: it separates known project concepts from unconfirmed candidate fields and defines what must be recorded.

### 2.1 Required metadata fields

| Field | Expected type | Unit / format | Availability at prediction time | Validation rule | Status |
|---|---|---|---|---|---|
| `asset_id` | string / categorical | Stable identifier | At `T` | Non-null after mapping; consistent across files | Required concept |
| `timestamp` | datetime | Timezone-aware if possible | At `T` | Parseable, ordered within asset, no impossible future values | Required concept |
| `source_file` | string | Filename / source key | Ingest time | Traceable to original record | Required audit field |
| `record_id` | string or integer | Unique row key | Ingest time | Duplicate detection key; never used as a predictor | Generated if absent |
| `maintenance_event` | categorical / event table | Documented event code | Before or after `T` | Event timing must be explicit | Candidate |
| `failure_event` | binary / event table | Documented event code or timestamp | Future event for target only | Definition and timestamp precision confirmed | Required for failure prediction |

### 2.2 Candidate operating measurements

These are not claims that the selected dataset contains them.

| Field family | Candidate columns | Type | Unit to confirm | Plausible quality checks | Candidate use |
|---|---|---|---|---|---|
| Electrical | voltage, current, active power, reactive power, apparent power, power factor, frequency | numeric | V, A, kW, kVAR, kVA, ratio, Hz | Non-negative where physically required; plausible operating range; unit consistency | State, trend, load relationship |
| Thermal | transformer temperature, oil temperature, winding temperature, ambient temperature | numeric | °C or documented alternative | Sensor range, ambient relationship, missingness, step changes | Thermal state, rate, rolling variability |
| Loading | load percentage, load current, overload indicator | numeric / binary | %, A, documented flag | Range, duration, threshold provenance | Excursions, duration, risk context |
| Asset context | transformer age, rated capacity, location / feeder, asset class | numeric / categorical | Years, kVA/MVA, documented codes | Category consistency; no post-event enrichment | Baseline and group comparison |
| History | prior failure count, time since maintenance, maintenance type | numeric / datetime / categorical | Count, elapsed time, documented code | Must be computed using events before `T` | Historical context if available |

### 2.3 Final dictionary row contract

For every retained raw or engineered field, record:

`feature_name`, `feature_role`, `source_column(s)`, `data_type`, `unit`, `asset_scope`, `timestamp_available`, `definition`, `valid_range_or_rule`, `missing_value_policy`, `transformation`, `leakage_status`, `physical_or_statistical_rationale`, `dataset_presence`, and `notes_or_limitations`.

## 3. Preprocessing specification

### 3.1 Ingest and provenance

1. Preserve the original file or immutable source reference.
2. Compute a file hash and record retrieval date, source URL, licence, and documentation version.
3. Load raw data without silently coercing malformed values.
4. Store a raw-to-clean row count and a rejected-record log.

### 3.2 Schema and type normalisation

1. Normalise column names to a documented naming convention while retaining original names in the dictionary.
2. Parse numeric values with explicit handling for decimal separators, embedded units, and sentinel codes.
3. Parse timestamps with timezone assumptions recorded; never silently localise ambiguous values.
4. Map asset identifiers to a stable canonical representation.
5. Separate measurement rows, event rows, and maintenance rows when the source mixes record types.

### 3.3 Time and asset integrity

For each `asset_id`, sort by `timestamp` and report duplicate timestamps, non-monotonic records, gaps, sampling intervals, clock resets, and assets with too little history. Estimate sampling distribution per asset; do not assume that one global frequency applies.

### 3.4 Missingness

Produce missingness summaries by feature, asset, period, and event proximity. Distinguish true missing values, sentinel codes, stale repeated values, and records that were never collected. Use imputation only where justified; preserve missingness indicators when absence itself may carry operational meaning.

### 3.5 Invalid values and outliers

Flag impossible values, unit mismatches, sensor saturation, abrupt resets, and extreme but physically possible values. Keep a flag and a reason. Do not delete an observation solely because it is unusual; compare robust statistics, asset context, and documentation before deciding whether to exclude, cap, transform, or retain it.

### 3.6 Split before learned preprocessing

Create chronological train / validation / test partitions before fitting any imputer, scaler, encoder, baseline range, threshold, or dimensionality reduction. The test period remains untouched until final evaluation. If event clusters span partitions, group or embargo them to avoid near-duplicate failure information crossing the boundary.

## 4. Exploratory data analysis specification

Every chart must answer a question and carry its source columns, time scope, asset scope, and data-quality note.

| EDA question | Analysis | Decision supported |
|---|---|---|
| What is actually in the file? | Schema, dtypes, units, row/asset counts, collection period | Confirms the problem is supported |
| How complete is the history? | Missingness matrix, missingness by asset and period, gap distribution | Determines usable features and imputation policy |
| How does the process behave over time? | Per-asset time series, sampling interval plots, rolling summaries | Determines windows and resampling strategy |
| Are assets comparable? | Asset-level distributions and normalised comparisons | Identifies baseline or capacity differences |
| Which readings move together? | Robust correlation, scatter plots, load–temperature relationships | Guides defensible interactions, not causal claims |
| Are there abnormal patterns? | Range flags, box plots, robust z-scores, excursion durations | Separates quality issues from potential signals |
| Are failures sufficiently observed? | Event counts, class balance, event timeline, time-to-event distribution | Determines whether future target construction is feasible |
| Is there pre-failure behaviour? | Aligned pre-event trajectories and distributions | Tests whether a supervised question is meaningful |

### Required EDA outputs after data arrival

- `dataset_assessment.md`
- `data_quality_report.md`
- schema and missingness tables
- timestamp / sampling report
- asset coverage report
- failure and maintenance-event report
- question-led plots with captions
- EDA decisions log, including discarded charts and why they were not informative

No chart or metric is populated until the dataset is present.

## 5. Target construction protocol

The candidate target is `failure_24h`:

- `1` if a valid failure event occurs in `(T, T + 24 hours]`;
- `0` only when the observation has enough follow-up to establish that no event occurred in that interval;
- unknown / excluded when the record is too close to the end of observation or the event definition is ambiguous.

This horizon is provisional. If timestamps, sampling, or event density do not support 24 hours, document a defensible alternative or stop rather than fabricating labels. Target generation must be separate from feature generation so that no future event data enters the inputs.

## 6. Feature-engineering specification

Feature names below are templates. They become active only when source columns exist and the feature passes the dictionary contract.

### 6.1 Feature families

| Family | Template names | Definition | Window / lookback | Prerequisite | Leakage rule |
|---|---|---|---|---|---|
| Current state | `{signal}_last`, `{signal}_lag_1` | Latest valid value and prior observation | Previous observation | Ordered repeated readings | At or before `T` |
| Change | `{signal}_delta_1`, `{signal}_pct_change_1` | Current minus prior, or relative change | Previous observation | Non-zero denominator handling | No future row |
| Trend | `{signal}_slope_{window}`, `{signal}_roc_{window}` | Slope or rate of change over trailing history | Window chosen after sampling review | Enough valid points | Trailing only |
| Rolling level | `{signal}_roll_mean_{window}`, `_min`, `_max`, `_median` | Summary of recent readings | Short / medium / daily candidate windows | Sampling supports window | No centred window |
| Rolling variability | `{signal}_roll_std_{window}`, `_iqr`, `_cv` | Stability / volatility of recent signal | Same as rolling level | Non-empty window; mean non-zero for CV | Trailing only |
| Deviation | `{signal}_baseline_dev`, `{signal}_range_flag` | Difference from asset baseline or documented range | Baseline fit on training period | Stable baseline or documented operating limits | Fit on training only |
| Excursion | `{signal}_high_count_{window}`, `_duration`, `_recency` | Number, elapsed duration, or recency of threshold excursions | Trailing window | Threshold provenance | Threshold cannot use future failures |
| Missingness | `{signal}_missing`, `gap_duration`, `stale_flag` | Availability and recency of data gaps | Trailing window | Missingness semantics understood | Available by `T` |
| Asset history | `age_at_T`, `time_since_maintenance`, `prior_failure_count` | Historical asset context | Before `T` only | Confirmed asset/event tables | No post-`T` records |
| Cross-signal | `load_temp_ratio`, `voltage_current_relation`, `power_factor_change` | Physically motivated relationship | Current / trailing | Both source signals and units confirmed | Pre-`T` only |

### 6.2 Window selection

Window lengths must be expressed in elapsed time after inspecting the sampling distribution. Start with short, medium, and daily candidates only as hypotheses. If assets are irregularly sampled, compare elapsed-time windows with observation-count windows; omit a window when coverage is too sparse.

### 6.3 Feature acceptance checklist

A feature enters the modelling table only if its record includes:

- formula and plain-language meaning;
- source columns and confirmed dataset presence;
- units or scale;
- required minimum observations;
- missing and denominator behaviour;
- physical or statistical rationale;
- timestamp availability at `T`;
- leakage review result;
- train-only fitting requirements;
- expected interpretation and known limitation.

### 6.4 Preprocessing order for features

1. Validate and sort raw records by asset and time.
2. Split chronologically.
3. Build trailing features separately inside each asset history.
4. Fit baselines, imputers, scalers, and encoders on training data only.
5. Apply the frozen transformation to validation and test periods.
6. Construct future-event target separately.
7. Run a feature-availability and leakage audit.
8. Save the feature dictionary and feature matrix summary.

## 7. Baseline model-training specification

### 7.1 Baselines

Start with a non-model reference where appropriate (for example, majority-class or documented alert-rule baseline), then train:

1. **Logistic Regression** with scaled numeric features, explicit missingness treatment, and class weighting if justified.
2. **Random Forest** with controlled depth / leaf size, class weighting where justified, and the same split and feature contract.

Optional boosting models are deferred until baselines are stable and the dataset supports a meaningful comparison.

### 7.2 Split and reproducibility

Use an older-period training set, later validation set, and newest test set. Record date boundaries, asset overlap, event grouping or embargo rules, random seed for algorithms that use randomness, library versions, feature-list hash, and preprocessing configuration.

### 7.3 Metrics and error review

Report precision, recall, F1, ROC-AUC, PR-AUC, confusion matrix, class-wise performance, threshold curves, calibration where possible, false positives, and false negatives. Choose a primary metric only after considering the operational cost of missed failures versus extra inspections. Accuracy is supplementary, not sufficient.

### 7.4 Baseline artifacts

- model card for each baseline;
- split manifest and leakage review;
- feature list and preprocessing pipeline;
- metric table with confidence / sample-size context where possible;
- confusion matrices and threshold curves;
- false-positive and false-negative case review;
- limitations and non-generalisation notes.

No performance number is reported in this Phase 2 document because no dataset has been provided.

## 8. Phase 2 acceptance gate

Phase 2 can be marked computationally complete only after the project has a real dataset and can produce: a populated data dictionary, raw-to-clean quality report, EDA outputs tied to questions, a confirmed target or documented stop decision, a leakage-safe feature matrix, fitted baseline models, and metric/error-review artifacts.

**Current blocker:** provide or approve the real dataset and source documentation. Until then, the responsible result is a complete, reproducible specification—not invented analysis.
