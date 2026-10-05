# Phase 4 execution report — synthetic explainability and fleet decision support

This report extends the fixed-seed Phase 3 synthetic transformer-sensor demo. It demonstrates explainability, health scoring, maintenance-oriented suggestions, and fleet prioritisation; it is not evidence about real assets.

- Assets prioritised: 12
- Global explanation: Random Forest impurity and held-out permutation importance
- Local explanation: standardised Logistic Regression coefficient contributions (SHAP not installed; no SHAP values are claimed)
- Top global features: maintenance_age_days, transformer_age_years, oil_temp_c_roll_max_12h, load_pct_roll_std_6h, oil_temp_c_roll_mean_12h
- Health score bands: Healthy 75–100, Watch 50–74.9, Action 0–49.9

## Fleet output

The fleet table ranks synthetic assets by Random Forest risk probability and then by lower health score. Each row includes the components behind the health heuristic and suggestions that are intended to prompt engineering review, not autonomous maintenance.

## Limitation

Replace the synthetic data and demo thresholds with documented real data, domain-reviewed health definitions, calibrated probabilities, and engineering approval before any operational use.
