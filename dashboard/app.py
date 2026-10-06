"""
GridWatch — Transformer Health Intelligence
Phase 13 Master Dashboard & Examiner-Ready Decision Support Application

Integrates validated outputs from:
- Phase 9B: Real DGA Anomaly Screening (Isolation Forest top-5% proxy)
- Phase 10: Anomaly Methodology & Temporal Leakage Validation
- Phase 11: Real DGA Condition Assessment & Engineering Review Prioritisation (P1-P4)
- Phase 12: Robustness, Sensitivity & Methodological Stability Audit (18 runs)
- Phase 3/4: Separate Synthetic ML Demonstration (Fixed seed 42)

Usage:
    streamlit run dashboard/app.py
"""

from pathlib import Path
import json
import pandas as pd
import numpy as np

# Try importing streamlit, with clear guidance if running via standard python
try:
    import streamlit as st
except ImportError:
    st = None

BASE_DIR = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = BASE_DIR / "artifacts"


def load_condition_summary() -> pd.DataFrame:
    """Load Phase 11 transformer condition summary."""
    p11_file = ARTIFACTS_DIR / "phase11_condition_assessment" / "transformer_condition_summary.csv"
    if p11_file.exists():
        return pd.read_csv(p11_file)
    # Fallback to embedded validated records
    return pd.DataFrame([
        {"transformer_id": "TX-I", "condition_indicator": 90.72, "condition_band": "HIGH REVIEW", "review_priority": "P1 — High Review Priority", "confidence": "High confidence", "observations": 5754, "total_anomaly_rate": 0.1943, "max_consecutive_anomalies": 47, "strongest_reason": "carbon_monoxide_ppm_delta"},
        {"transformer_id": "TX-M", "condition_indicator": 80.40, "condition_band": "HIGH REVIEW", "review_priority": "P1 — High Review Priority", "confidence": "High confidence", "observations": 5545, "total_anomaly_rate": 0.3573, "max_consecutive_anomalies": 128, "strongest_reason": "ethane_ppm_log1p"},
        {"transformer_id": "TX-J", "condition_indicator": 80.38, "condition_band": "HIGH REVIEW", "review_priority": "P2 — Review", "confidence": "Limited confidence", "observations": 21390, "total_anomaly_rate": 0.2046, "max_consecutive_anomalies": 38, "strongest_reason": "hydrogen_ppm_delta"},
        {"transformer_id": "TX-L", "condition_indicator": 62.73, "condition_band": "REVIEW", "review_priority": "P2 — Review", "confidence": "High confidence", "observations": 14501, "total_anomaly_rate": 0.0029, "max_consecutive_anomalies": 7, "strongest_reason": "oxygen_ppm_roll_std_3"},
        {"transformer_id": "TX-F", "condition_indicator": 57.26, "condition_band": "REVIEW", "review_priority": "P2 — Review", "confidence": "High confidence", "observations": 18288, "total_anomaly_rate": 0.0671, "max_consecutive_anomalies": 435, "strongest_reason": "ethane_ppm_roll_std_3"},
        {"transformer_id": "TX-D", "condition_indicator": 54.14, "condition_band": "REVIEW", "review_priority": "P2 — Review", "confidence": "High confidence", "observations": 9075, "total_anomaly_rate": 0.0196, "max_consecutive_anomalies": 11, "strongest_reason": "oxygen_ppm_delta"},
        {"transformer_id": "TX-C", "condition_indicator": 52.08, "condition_band": "REVIEW", "review_priority": "P2 — Review", "confidence": "High confidence", "observations": 7936, "total_anomaly_rate": 0.0060, "max_consecutive_anomalies": 5, "strongest_reason": "oxygen_ppm_roll_std_3"},
        {"transformer_id": "TX-A", "condition_indicator": 50.71, "condition_band": "REVIEW", "review_priority": "P2 — Review", "confidence": "Moderate confidence", "observations": 3021, "total_anomaly_rate": 0.0020, "max_consecutive_anomalies": 3, "strongest_reason": "carbon_dioxide_ppm_log1p"},
        {"transformer_id": "TX-H", "condition_indicator": 48.67, "condition_band": "MONITOR", "review_priority": "P3 — Monitor", "confidence": "High confidence", "observations": 23788, "total_anomaly_rate": 0.0079, "max_consecutive_anomalies": 5, "strongest_reason": "ethane_ppm_log1p"},
        {"transformer_id": "TX-E", "condition_indicator": 46.39, "condition_band": "MONITOR", "review_priority": "P3 — Monitor", "confidence": "High confidence", "observations": 23934, "total_anomaly_rate": 0.0048, "max_consecutive_anomalies": 26, "strongest_reason": "hydrogen_ppm_log1p"},
        {"transformer_id": "TX-G", "condition_indicator": 46.39, "condition_band": "MONITOR", "review_priority": "P3 — Monitor", "confidence": "High confidence", "observations": 23934, "total_anomaly_rate": 0.0048, "max_consecutive_anomalies": 26, "strongest_reason": "hydrogen_ppm_log1p"},
        {"transformer_id": "TX-B", "condition_indicator": 42.29, "condition_band": "MONITOR", "review_priority": "P3 — Monitor", "confidence": "High confidence", "observations": 17540, "total_anomaly_rate": 0.0173, "max_consecutive_anomalies": 7, "strongest_reason": "oxygen_ppm_log1p"},
        {"transformer_id": "TX-K", "condition_indicator": 36.89, "condition_band": "MONITOR", "review_priority": "P3 — Monitor", "confidence": "High confidence", "observations": 28508, "total_anomaly_rate": 0.0163, "max_consecutive_anomalies": 101, "strongest_reason": "water_ppm_roll_std_3"},
    ])


def load_robustness_summary() -> pd.DataFrame:
    """Load Phase 12 robustness matrix."""
    p12_file = ARTIFACTS_DIR / "phase12_robustness_validation" / "consensus_screening_summary.csv"
    if p12_file.exists():
        return pd.read_csv(p12_file)
    fallback_file = ARTIFACTS_DIR / "phase12_robustness_validation" / "transformer_robustness_summary.csv"
    if fallback_file.exists():
        return pd.read_csv(fallback_file)
    return pd.DataFrame([
        {"transformer_id": "TX-I", "condition_indicator": 90.72, "run_min_indicator": 35.96, "run_max_indicator": 91.50, "top_3_count": 17, "stability_classification": "SENSITIVE", "consensus_screening": "CONSISTENTLY HIGH"},
        {"transformer_id": "TX-M", "condition_indicator": 80.40, "run_min_indicator": 6.92, "run_max_indicator": 87.31, "top_3_count": 16, "stability_classification": "SENSITIVE", "consensus_screening": "CONSISTENTLY HIGH"},
        {"transformer_id": "TX-J", "condition_indicator": 80.38, "run_min_indicator": 51.10, "run_max_indicator": 100.00, "top_3_count": 17, "stability_classification": "INSUFFICIENT DATA", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-L", "condition_indicator": 62.73, "run_min_indicator": 52.26, "run_max_indicator": 92.72, "top_3_count": 2, "stability_classification": "MODERATELY STABLE", "consensus_screening": "NOT CONSENSUS-HIGH"},
        {"transformer_id": "TX-F", "condition_indicator": 57.26, "run_min_indicator": 37.31, "run_max_indicator": 76.39, "top_3_count": 1, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-D", "condition_indicator": 54.14, "run_min_indicator": 45.66, "run_max_indicator": 67.01, "top_3_count": 0, "stability_classification": "MODERATELY STABLE", "consensus_screening": "NOT CONSENSUS-HIGH"},
        {"transformer_id": "TX-C", "condition_indicator": 52.08, "run_min_indicator": 37.89, "run_max_indicator": 85.65, "top_3_count": 1, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-A", "condition_indicator": 50.71, "run_min_indicator": 8.08, "run_max_indicator": 57.69, "top_3_count": 0, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-H", "condition_indicator": 48.67, "run_min_indicator": 33.77, "run_max_indicator": 56.92, "top_3_count": 0, "stability_classification": "MODERATELY STABLE", "consensus_screening": "NOT CONSENSUS-HIGH"},
        {"transformer_id": "TX-E", "condition_indicator": 46.39, "run_min_indicator": 12.12, "run_max_indicator": 54.04, "top_3_count": 0, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-G", "condition_indicator": 46.39, "run_min_indicator": 12.12, "run_max_indicator": 54.04, "top_3_count": 0, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-B", "condition_indicator": 42.29, "run_min_indicator": 23.27, "run_max_indicator": 53.46, "top_3_count": 0, "stability_classification": "SENSITIVE", "consensus_screening": "METHOD-SENSITIVE / UNCERTAIN"},
        {"transformer_id": "TX-K", "condition_indicator": 36.89, "run_min_indicator": 25.38, "run_max_indicator": 48.46, "top_3_count": 0, "stability_classification": "MODERATELY STABLE", "consensus_screening": "NOT CONSENSUS-HIGH"},
    ])


def main():
    if st is None:
        print("Streamlit is not installed. To run the Streamlit dashboard, execute: pip install streamlit; streamlit run dashboard/app.py")
        print("Note: The primary web application runs natively in browser via Vite: npm run dev")
        return

    st.set_page_config(
        page_title="GridWatch — Transformer Health Intelligence",
        page_icon="⚡",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("⚡ GridWatch — Transformer Health Intelligence")
    st.caption("Data-driven DGA anomaly and condition-monitoring decision-support prototype")

    st.info(
        "🛡️ **RESPONSIBLE USE NOTICE:** This system provides analytical screening information intended to support "
        "qualified engineering review. It is not a diagnosis, failure probability, engineering standard, or autonomous "
        "maintenance decision."
    )

    # Sidebar Navigation
    menu = st.sidebar.radio(
        "Navigation Sections",
        [
            "01 · Overview",
            "02 · Real DGA Monitoring",
            "03 · Transformer Review Queue",
            "04 · Transformer Detail",
            "05 · Condition Assessment",
            "06 · DGA Trends",
            "07 · Explainability / Reason Codes",
            "08 · Robustness & Validation",
            "09 · Synthetic ML Demonstration",
            "10 · Methodology",
            "11 · Limitations & Responsible Use",
        ],
    )

    df_condition = load_condition_summary()
    df_robustness = load_robustness_summary()

    if menu.startswith("01"):
        st.header("01 · Overview")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Transformers", "13", "UK Power Station Fleet")
        col2.metric("Raw Observations", "316,203", "1.92M DGA points")
        col3.metric("Scored Features", "203,214", "48 Trailing features")
        col4.metric("Temporal Span", "2010 → 2015", "5-year coverage")

        st.subheader("Priority Distribution")
        p_col1, p_col2, p_col3, p_col4 = st.columns(4)
        p_col1.metric("P1 — High Review", "2 Assets", "TX-I, TX-M")
        p_col2.metric("P2 — Review", "6 Assets", "TX-J, TX-L, TX-F, TX-D, TX-C, TX-A")
        p_col3.metric("P3 — Monitor", "5 Assets", "TX-H, TX-E, TX-G, TX-B, TX-K")
        p_col4.metric("P4 — Routine", "0 Assets", "Fleet baseline")

    elif menu.startswith("03"):
        st.header("03 · Transformer Review Queue")
        st.write("Ranked by Phase 11 Condition Indicator and Review Priority (P1 → P2 → P3).")
        st.dataframe(df_condition, use_container_width=True)

    elif menu.startswith("08"):
        st.header("08 · Robustness & Validation (Phase 12)")
        st.write("Methodological stability across 18 sensitivity configurations.")
        st.dataframe(df_robustness, use_container_width=True)

    elif menu.startswith("09"):
        st.header("09 · Synthetic ML Demonstration")
        st.warning("⚠️ **SYNTHETIC DEMONSTRATION — NOT REAL UTILITY PERFORMANCE**")
        st.write("Synthetic 12-asset simulated failure-risk model results (Fixed Seed 42).")
        metrics_df = pd.DataFrame([
            {"Model": "Logistic Regression", "Precision": 0.655, "Recall": 0.662, "F1": 0.659, "ROC-AUC": 0.652, "PR-AUC": 0.648, "Accuracy": 0.636},
            {"Model": "Random Forest", "Precision": 0.618, "Recall": 0.681, "F1": 0.648, "ROC-AUC": 0.592, "PR-AUC": 0.608, "Accuracy": 0.607},
        ])
        st.dataframe(metrics_df, use_container_width=True)

    elif menu.startswith("11"):
        st.header("11 · Limitations & Responsible Use")
        st.markdown("""
        1. **No authoritative failure labels:** The real dataset contains no equipment breakdown or outage timestamps.
        2. **No validated future-failure target:** `failure_24h` is not trained on real data.
        3. **Irregular DGA sampling:** Intervals range from 1h to several days.
        4. **Missing gas measurements:** TX-J contains 40.27% missing values; confidence is capped to Limited.
        5. **Prototype screening indicator:** Condition Indicator is a heuristic decision-support rank, not a failure probability.
        6. **Qualified Engineering Review:** Decisions must involve human engineers.
        """)

    else:
        st.header(menu)
        st.write("Detailed data available in the primary web application.")


if __name__ == "__main__":
    main()
