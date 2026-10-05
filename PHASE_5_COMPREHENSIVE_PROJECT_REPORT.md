# GridWatch — Comprehensive Project Report

## Executive summary

GridWatch is a student-level Data Science prototype that demonstrates how historical transformer operating data can be converted into reviewable decision-support outputs: validation, preprocessing, exploratory analysis, feature engineering, future failure-risk estimation, evaluation, explainability, health assessment, maintenance-oriented suggestions, and fleet prioritisation.

The prototype complements existing SCADA, IoT/condition-monitoring sensors, threshold alarms, periodic inspections, diagnostic methods, maintenance records, and professional engineering judgement. It does not replace them, autonomously control equipment, diagnose failures, or claim global novelty.

## 1. Scope and approval-gate model

The project uses a dataset-first workflow. The provisional target `failure_24h` is valid only when a real dataset contains timestamped future failure/event information and supports the requested horizon. The dashboard and generated artifacts use a fixed-seed synthetic dataset for demonstration; they are not evidence about a real transformer fleet.

The current project status remains: **dashboard and demonstration artifacts are ready for review; real dataset validation is still required before operational interpretation**.

## 2. Phase 1 — dataset selection and validation

The validation plan covers schema, timestamp ordering, sampling frequency, units, asset identifiers, missingness, duplicates, range checks, licence constraints, maintenance records, and event definitions. It also defines leakage controls and a feature dictionary contract.

Approval gate: **a real dataset must be shown to be fit for the proposed question before target selection and modelling**.

## 3. Phase 2 — preprocessing, EDA, and feature strategy

The preprocessing specification requires asset/time sorting, documented missing-data treatment, training-only fitting of imputers and scalers, and question-led EDA. Candidate features are limited to information available at prediction time, including lags, deltas, slopes, trailing rolling statistics, excursion counts, missingness indicators, and asset history where records exist.

Centred windows and future rows are prohibited in model inputs. Cleaning decisions, target construction, and any threshold assumptions must be recorded.

## 4. Phase 3 — synthetic demonstration pipeline

The reproducible Phase 3 pipeline uses seed 42 and creates:

- 5,760 hourly rows
- 12 synthetic transformer assets
- 5,472 labelled rows
- 25 engineered features
- Chronological train/validation/test splits of 3,276 / 1,092 / 1,104 rows

### Test metrics

| Model | Precision | Recall | F1 | ROC-AUC | PR-AUC | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| Logistic Regression | 0.655 | 0.662 | 0.659 | 0.652 | 0.648 | 0.636 |
| Random Forest | 0.618 | 0.681 | 0.648 | 0.592 | 0.608 | 0.607 |

These values demonstrate the evaluation interface only. They must not be presented as real utility performance.

## 5. Phase 4 — explainability and health assessment

Global explainability uses Random Forest impurity importance and held-out permutation importance. Local explanations use standardised Logistic Regression coefficient contributions because SHAP was not available in the execution environment; the project does not claim to have generated SHAP values.

The leading global features in the synthetic run were:

1. `maintenance_age_days`
2. `transformer_age_years`
3. `oil_temp_c_roll_max_12h`
4. `load_pct_roll_std_6h`
5. `oil_temp_c_roll_mean_12h`

The prototype health score is explicitly documented as:

> 55% risk component + 20% thermal component + 20% loading component + 5% data-quality component.

Prototype bands are Healthy (75–100), Watch (50–74.9), and Action (0–49.9). These bands are not an engineering standard.

## 6. Fleet risk prioritisation

The fleet is sorted by Random Forest risk probability descending, then by lower health score. The synthetic run produced 12 prioritised assets, with six in Watch and six in Healthy. The ranking is intended to focus engineering attention and not to issue autonomous work orders.

## 7. TX-010 inspection detail

TX-010 is the highest-priority synthetic asset in the Phase 4 output:

| Field | Value |
|---|---:|
| Observation timestamp | 2025-01-19 23:00 UTC |
| Risk probability | 72.92% |
| Risk band | Elevated |
| Health score | 59.9 |
| Health band | Watch |
| Inspection priority | P1 |
| Risk component | 27.08 |
| Thermal component | 100.0 |
| Loading component | 100.0 |
| Data-quality component | 100.0 |
| Missing signal count | 0 |
| Load | 69.39% |
| Oil temperature | 61.15 °C |
| Winding temperature | 70.57 °C |
| Overload count, trailing 12 h | 0 |

### Maintenance-oriented suggestion

> Prioritise engineering inspection of recent operating history and maintenance records.

This suggestion should be followed by verification of the underlying measurements, timestamp coverage, maintenance history, model calibration, and domain context. It is not a diagnosis, repair instruction, or automatic work order.

The dashboard’s local reason-code example for TX-010 includes `voltage_kv`, `voltage_dev_kv`, `transformer_age_years`, and `maintenance_age_days`. These are model associations in a synthetic demonstration and should not be treated as causal findings.

## 8. Final interactive dashboard

The final GridWatch dashboard includes:

- Dataset-first project framing and approval gates
- Existing-system and project-gap context
- Twelve-step workflow track
- Feature-engineering strategy and leakage register
- Model evaluation and risk prediction tabs
- Explainability tab with global features and local reason codes
- Maintenance recommendations tab with fleet prioritisation cards
- Explicit “does / does not” boundaries
- Responsive layout and accessible tab interactions

## 9. Reproducibility

Key reproducibility assets are stored under `scripts/` and `artifacts/`. Phase 3 dependencies are pinned in `requirements-phase3.txt`; both pipelines use seed 42. Run the pipelines from the project root after installing the documented dependencies.

## 10. Limitations and next approval gate

- The data is synthetic and cannot support engineering conclusions.
- The target and 24-hour horizon remain provisional for a real deployment.
- The health score weights and bands are prototype heuristics requiring domain review.
- Risk probabilities require calibration and validation on representative real data.
- Explainability does not establish causality.
- No production integration, alerting, control, or maintenance execution is implemented.

**Next approval decision:** inspect and approve a real, licensed, timestamped dataset and confirm that its event definitions support a defensible future-failure question. Only then should the synthetic demonstration be replaced and the workflow rerun.
