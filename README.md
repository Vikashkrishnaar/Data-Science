# GridWatch — Transformer Health Intelligence

> **Data-driven DGA anomaly and condition-monitoring decision-support prototype**
> **Repository:** `Data-Science` / `GridWatch`
> **Version:** Phase 13 Final Dashboard, UX & System Integration

---

## ⚡ Project Overview

GridWatch is an evidence-bounded Data Science prototype for high-voltage transformer fleet monitoring and engineering review prioritisation using Dissolved Gas Analysis (DGA) telemetry.

### Core Pipelines
1. **Real UK DGA Pipeline (13 Transformers, 2010–2015):**
   - **Data Validation & Preprocessing:** 316,203 raw rows, 1.92M non-null ppm measurements across 9 gas families.
   - **Feature Engineering:** 48 trailing, leak-free feature columns (log1p, trailing deltas, rolling 3-obs stats).
   - **Anomaly Screening (Phase 9B):** Unsupervised Isolation Forest (fixed seed 42, top 5% descriptive proxy).
   - **Methodology & Leakage Audit (Phase 10):** Temporal splits, trailing windows, baseline sanity tests.
   - **Condition Assessment (Phase 11):** Multi-factor composite Condition Indicator (0–100) and Review Priority (`P1`–`P4`).
   - **Robustness & Sensitivity Audit (Phase 12):** 18 analytical configurations, alternative algorithm comparisons, consensus screening matrix.
2. **Synthetic ML Demonstration (12 Simulated Assets, Fixed Seed 42):**
   - Supervised classification (Logistic Regression vs Random Forest) demonstrating future failure-risk modelling, confusion matrices, and feature explainability on simulated data with strict separation from real assets.

---

## 🚀 Running the Dashboard

### 1. Primary Interactive Web Application (Vite SPA)

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

Open `http://localhost:5173/` in your browser.

### 2. Python Analytical Dashboard (Streamlit)

```bash
# Install Python dependencies
pip install -r requirements.txt
pip install streamlit

# Run Streamlit application
streamlit run dashboard/app.py
```

### 3. Running Test Suites

```bash
# Execute all 30 unit and integration tests
python -m unittest discover -s tests -p "test_*.py"
```

---

## 🛡️ Critical Evidence Boundaries

- **No Real Failure Labels:** The source telemetry contains no outage, breakdown, or maintenance ground truth.
- **Decision Support Only:** The Condition Indicator represents retrospective statistical deviation and screening urgency to support qualified electrical engineers.
- **No Novelty or Medical/Equipment Diagnosis Claims:** The prototype strictly separates what the data can support from unverified claims.

---

## 📁 Repository Structure

```
├── artifacts/
│   ├── phase9b_real_anomaly/          # Isolation Forest scores & proxy summaries
│   ├── phase10_anomaly_validation/     # Temporal leakage audits & method comparisons
│   ├── phase11_condition_assessment/   # Condition indicator & priority summaries
│   ├── phase12_robustness_validation/  # 18-run sensitivity & consensus matrices
│   └── phase13_dashboard/              # Phase 13 Final Master Report
├── dashboard/
│   └── app.py                          # Streamlit application entry point
├── docs/
│   └── DASHBOARD_GUIDE.md              # Detailed user & examiner manual
├── src/
│   ├── main.ts                         # Phase 13 TypeScript SPA implementation
│   └── style.css                       # Dark industrial smart-grid design system
├── tests/                              # Comprehensive test suite (30 tests)
├── requirements.txt                    # Python environment specifications
└── package.json                        # Node.js build configuration
```
