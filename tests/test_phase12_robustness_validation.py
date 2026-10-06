import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from phase12_robustness_validation import (  # noqa: E402
    agreement,
    assign_band,
    compute_summary,
    kendall,
    percentile_flag,
    spearman,
    top_k_overlap,
)


class Phase12RobustnessTests(unittest.TestCase):
    def setUp(self):
        timestamps = pd.date_range("2025-01-01", periods=6, freq="D")
        self.df = pd.DataFrame({
            "transformer_id": ["TX-A"] * 3 + ["TX-B"] * 3,
            "timestamp": list(timestamps[:3]) + list(timestamps[:3]),
            "anomaly_score": [0.1, 0.2, 0.9, 0.2, 0.3, 0.4],
            "anomaly_flag": [False, True, True, False, False, True],
            "robust_score": [1.0, 2.0, 4.0, 1.0, 1.5, 2.0],
            "missing_gas_count": [0, 0, 1, 0, 0, 0],
            "observed_gas_count": [9, 9, 8, 9, 9, 9],
            "hours_since_previous_record": [np.nan, 1.0, 48.0, np.nan, 1.0, 1.0],
        })

    def test_threshold_boundary_and_empty_input(self):
        threshold, flags = percentile_flag([0.0, 1.0, 2.0, 3.0], 0.25)
        self.assertEqual(threshold, 2.25)
        self.assertEqual(int(flags.sum()), 1)
        with self.assertRaises(ValueError):
            percentile_flag([], 0.05)
        with self.assertRaises(ValueError):
            percentile_flag([1.0], 0.0)

    def test_rank_correlations_and_top_k(self):
        self.assertAlmostEqual(spearman([1, 2, 3], [1, 2, 3]), 1.0)
        self.assertAlmostEqual(kendall([1, 2, 3], [3, 2, 1]), -1.0)
        a = pd.Series([3, 2, 1], index=["A", "B", "C"])
        b = pd.Series([1, 2, 3], index=["A", "B", "C"])
        self.assertEqual(top_k_overlap(a, b, 1), 0.0)

    def test_agreement_aligns_transformer_ids(self):
        a = pd.Series(["P1", "P2"], index=["TX-A", "TX-B"])
        b = pd.Series(["P2", "P1"], index=["TX-B", "TX-A"])
        self.assertEqual(agreement(a, b), 1.0)

    def test_condition_band_boundaries(self):
        self.assertEqual(assign_band(24.999, (25, 50, 75)), "NORMAL")
        self.assertEqual(assign_band(25, (25, 50, 75)), "MONITOR")
        self.assertEqual(assign_band(50, (25, 50, 75)), "REVIEW")
        self.assertEqual(assign_band(75, (25, 50, 75)), "HIGH REVIEW")

    def test_summary_handles_single_asset_and_sparse_rows(self):
        summary = compute_summary(self.df, "anomaly_score", "anomaly_flag", recent_days=10)
        self.assertEqual(set(summary["transformer_id"]), {"TX-A", "TX-B"})
        self.assertTrue(np.isfinite(summary["condition_indicator"]).all())
        self.assertTrue(summary["condition_band"].isin(["NORMAL", "MONITOR", "REVIEW", "HIGH REVIEW"]).all())
        self.assertEqual(len(summary), 2)

    def test_summary_rejects_empty_data(self):
        with self.assertRaises(ValueError):
            compute_summary(self.df.iloc[0:0], "anomaly_score", "anomaly_flag")


if __name__ == "__main__":
    unittest.main()
