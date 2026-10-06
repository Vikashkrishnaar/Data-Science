import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from phase11_condition_assessment import (
    build_row_metrics,
    build_transformer_summary,
    condition_band,
    confidence_label,
    count_anomaly_episodes,
    max_consecutive,
    priority_label,
    safe_percentile_rank,
    validate_input_frame,
)


class Phase11ConditionAssessmentTests(unittest.TestCase):
    def make_rows(self):
        ts = pd.date_range("2024-01-01", periods=6, freq="D")
        return pd.DataFrame({
            "transformer_id": ["TX-A"] * 3 + ["TX-B"] * 3,
            "timestamp": list(ts[:3]) + list(ts[:3]),
            "anomaly_score": [0.1, 0.9, 0.8, 0.2, 0.2, 0.2],
            "anomaly_flag_top_5pct": [False, True, True, False, False, False],
            "reason_code": ["", "hydrogen_ppm_delta", "hydrogen_ppm_delta", "", "", ""],
            "observed_gas_count": [9, 9, 9, 9, 8, 9],
            "missing_gas_count": [0, 0, 0, 0, 1, 0],
            "hours_since_previous_record": [np.nan, 1.0, 1.0, np.nan, 48.0, 1.0],
            "specific_baseline_score": [0.1, 2.0, 1.5, 0.2, 0.2, 0.2],
            "specific_baseline_reason": ["", "hydrogen_ppm_delta", "hydrogen_ppm_delta", "", "", ""],
        })

    def test_condition_band_boundaries(self):
        self.assertEqual(condition_band(0.0), "NORMAL")
        self.assertEqual(condition_band(0.2499), "NORMAL")
        self.assertEqual(condition_band(0.25), "MONITOR")
        self.assertEqual(condition_band(0.50), "REVIEW")
        self.assertEqual(condition_band(0.75), "HIGH REVIEW")
        self.assertEqual(condition_band(1.0), "HIGH REVIEW")

    def test_priority_boundaries_and_limited_confidence_cap(self):
        high = "High confidence"
        limited = "Limited confidence"
        self.assertTrue(priority_label(0.75, "HIGH REVIEW", high, 3, 3).startswith("P1"))
        self.assertTrue(priority_label(0.75, "HIGH REVIEW", limited, 10, 10).startswith("P2"))
        self.assertTrue(priority_label(0.50, "REVIEW", high, 0, 0).startswith("P2"))
        self.assertTrue(priority_label(0.25, "MONITOR", high, 0, 0).startswith("P3"))
        self.assertTrue(priority_label(0.24, "NORMAL", high, 0, 0).startswith("P4"))

    def test_persistence_and_episode_rules(self):
        flags = [False, True, True, False, True, False, True, True, True]
        self.assertEqual(max_consecutive(flags), 3)
        self.assertEqual(count_anomaly_episodes(flags), 3)
        self.assertEqual(max_consecutive([]), 0)
        self.assertEqual(count_anomaly_episodes([]), 0)

    def test_confidence_rules_are_separate_from_condition(self):
        self.assertEqual(confidence_label(1000, 365, 0.05, 8), "High confidence")
        self.assertEqual(confidence_label(100, 180, 0.25, 24), "Moderate confidence")
        self.assertEqual(confidence_label(10000, 2000, 0.40, 2), "Limited confidence")

    def test_single_transformer_summary_is_reproducible(self):
        rows = self.make_rows().iloc[:3].copy()
        first, _, _ = build_transformer_summary(rows)
        second, _, _ = build_transformer_summary(rows)
        self.assertEqual(len(first), 1)
        pd.testing.assert_frame_equal(first, second)
        self.assertGreaterEqual(float(first.iloc[0]["condition_indicator"]), 0)
        self.assertLessEqual(float(first.iloc[0]["condition_indicator"]), 100)

    def test_missing_and_sparse_rows_do_not_crash(self):
        rows = self.make_rows()
        rows.loc[4, "missing_gas_count"] = 9
        rows.loc[4, "hours_since_previous_record"] = 10000
        summary, _, _ = build_transformer_summary(rows)
        self.assertTrue(summary["condition_indicator"].between(0, 100).all())
        self.assertTrue(summary["confidence"].isin(["High confidence", "Moderate confidence", "Limited confidence"]).all())

    def test_duplicate_timestamps_invalid_timestamps_and_empty_data(self):
        rows = self.make_rows()
        validate_input_frame(rows)
        duplicate = pd.concat([rows, rows.iloc[[0]]], ignore_index=True)
        with self.assertRaises(ValueError):
            validate_input_frame(duplicate)
        invalid_time = rows.copy()
        invalid_time.loc[0, "timestamp"] = pd.NaT
        with self.assertRaises(ValueError):
            validate_input_frame(invalid_time)
        empty = rows.iloc[0:0].copy()
        with self.assertRaises(ValueError):
            validate_input_frame(empty)
        with self.assertRaises(ValueError):
            build_transformer_summary(empty)

    def test_extreme_and_infinite_values_are_rejected(self):
        rows = self.make_rows()
        rows.loc[0, "anomaly_score"] = np.inf
        with self.assertRaises(ValueError):
            validate_input_frame(rows)
        extreme = self.make_rows()
        extreme.loc[0, "anomaly_score"] = np.finfo(float).max / 2
        validate_input_frame(extreme)

    def test_percentile_rank_is_finite_for_single_and_tied_assets(self):
        single = safe_percentile_rank(pd.Series([10.0], index=["TX-A"]))
        self.assertEqual(float(single.iloc[0]), 0.5)
        tied = safe_percentile_rank(pd.Series([1.0, 1.0], index=["TX-A", "TX-B"]))
        self.assertTrue(np.isfinite(tied).all())
        self.assertTrue((tied == 0.75).all())


if __name__ == "__main__":
    unittest.main()
