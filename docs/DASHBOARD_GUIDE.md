# GridWatch — Phase 13 Final Dashboard Guide

> **Prototype Name:** GridWatch — Transformer Health Intelligence  
> **Subheading:** Data-driven DGA anomaly and condition-monitoring decision-support prototype  
> **Phase:** 13 (Final Dashboard, UX & System Integration)  
> **Evidence Boundaries:** Retrospective analytical screening; no failure probabilities or unverified causal claims.

---

## 1. Quick Start & Installation

GridWatch supports both a high-performance, responsive Single-Page Web Application (TypeScript/Vite) and an optional Python Streamlit analytical dashboard.

### Option A: Primary Web Application (Vite SPA)

```bash
# 1. Install Node.js dependencies
npm install

# 2. Start the interactive local development server
npm run dev

# 3. Build production bundle (verified build)
npm run build
```

The web dashboard is served locally at `http://localhost:5173/`.

### Option B: Python Analytical Dashboard (Streamlit)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt
pip install streamlit

# 2. Launch the Streamlit application
streamlit run dashboard/app.py
```

---

## 2. Information Architecture & Sections

The GridWatch dashboard is organized into 11 distinct, audited sections:

1. **01 · Overview:**  
   Landing page communicating project goals, fleet summary metrics (13 transformers, 316,203 rows, 1.92M non-null measurements, 203,214 scored feature rows), priority distribution, and prominent responsible-use disclaimers.
2. **02 · Real DGA Monitoring:**  
   Inspection of the 9 dissolved gas families (H₂, CH₄, C₂H₂, C₂H₄, C₂H₆, CO, CO₂, O₂, H₂O), sampling intervals (1–4 hours), and telemetry characteristics.
3. **03 · Transformer Review Queue:**  
   Interactive engineering worklist sorting transformers primarily by Review Priority (`P1` → `P2` → `P3` → `P4`) and Phase 11 Condition Indicator. Includes filtering by priority, condition band, data confidence, and text search.
4. **04 · Transformer Detail:**  
   Deep dive on selected transformers displaying baseline comparisons, 5-component decomposition charts, evidence-bound deviation reasons, and non-alarmist engineering review actions.
5. **05 · Condition Assessment:**  
   Phase 11 Condition Indicator formula breakdown (Intensity 30%, Persistence 20%, Recency 20%, Baseline 15%, Trend 15%) and the 4 condition bands (`HIGH REVIEW`, `REVIEW`, `MONITOR`, `NORMAL`).
6. **06 · DGA Trends Visualisations:**  
   Interactive time-series charts illustrating the monthly fleet anomaly proxy rate (2010–2015) and maximum consecutive anomaly runs across the fleet.
7. **07 · Explainability / Reason Codes:**  
   Statistical ranking of features driving anomaly flags (e.g., ethane rolling variability, hydrogen first delta) and rules for statistical interpretation vs causal claims.
8. **08 · Robustness & Validation (Phase 12):**  
   Audited stability across 18 analytical configurations, alternative algorithm comparisons (Isolation Forest vs Robust MAD vs Percentile), and threshold sensitivity matrices.
9. **09 · Synthetic ML Demonstration:**  
   Dedicated laboratory demonstrating supervised machine learning (Logistic Regression vs Random Forest, fixed seed 42) with explicit disclaimers separating it from real UK DGA data.
10. **10 · Methodology & Pipeline:**  
    End-to-end visual workflow showing the separate Real UK DGA Pipeline and Synthetic ML Demonstration Pipeline across all approval gates.
11. **11 · Limitations & Responsible Use:**  
    Comprehensive 12-point limitation checklist governing responsible decision-support deployment.

---

## 3. Real UK DGA Data vs Synthetic ML Demonstration

| Dimension | Real UK DGA Pipeline (Phases 9B–12) | Synthetic ML Demonstration (Phases 3–4) |
| :--- | :--- | :--- |
| **Data Source** | 13 UK power-station transformers (2010–2015) | 12 simulated assets (5,760 rows, seed 42) |
| **Target Variable** | **None** (Target gate locked; unsupervised screening) | Simulated binary failure event target |
| **Algorithms** | Isolation Forest, Robust MAD, Within-TX Percentile | Logistic Regression, Random Forest |
| **Key Metrics** | Anomaly proxy rate, Condition Indicator (0–100), Priority (P1–P4) | Precision, Recall, F1, ROC-AUC, PR-AUC |
| **Output Interpretation** | Retrospective screening and engineering review prioritization | Pedagogical proof-of-concept for supervised workflow |
| **Label in UI** | `REAL UK DGA DATA` | `SYNTHETIC DEMONSTRATION — NOT REAL UTILITY PERFORMANCE` |

---

## 4. Interpretation Guidelines

### Condition Bands
- **HIGH REVIEW (75–100):** Concentrated recent anomaly activity, prolonged consecutive episode runs, and strong deviation from transformer historical baseline. (*TX-I, TX-M, TX-J*).
- **REVIEW (50–<75):** Notable deviation from fleet or transformer baseline, moderate persistence history, or recent anomaly activity warranting engineering inspection. (*TX-L, TX-F, TX-D, TX-C, TX-A*).
- **MONITOR (25–<50):** Low or zero recent anomaly flags; older historical isolated spikes; stable gas concentration trends conforming to baseline. (*TX-H, TX-E, TX-G, TX-B, TX-K*).
- **NORMAL (0–<25):** Baseline quiescence across all gas families.

### Review Priorities
- **P1 (High Review Priority):** High indicator score + High data confidence. Requires immediate engineering review of recent DGA trends. (*TX-I, TX-M*).
- **P2 (Review Priority):** Review band indicator OR High band with downgraded confidence. (*TX-J [due to 40.27% missingness], TX-L, TX-F, TX-D, TX-C, TX-A*).
- **P3 (Monitor Priority):** Monitor band indicator. Maintain routine observation cadence. (*TX-H, TX-E, TX-G, TX-B, TX-K*).
- **P4 (Routine):** Normal band indicator.

### Confidence Ratings
- **High Confidence:** ≥ 1,000 observations, > 365 days coverage, < 10% missing gases, median gap ≤ 24h.
- **Moderate Confidence:** Intermediate observations or coverage span.
- **Limited Confidence:** Substantial missingness (> 30%) or sparse sampling (e.g., TX-J with 40.27% missing gas observations). Prevents unwarranted promotion to P1.

---

## 5. Responsible Use Notice

> **IMPORTANT:** GridWatch is an analytical decision-support prototype. It does not calculate real failure probabilities, trigger autonomous maintenance work orders, or replace qualified high-voltage electrical engineering evaluations.
