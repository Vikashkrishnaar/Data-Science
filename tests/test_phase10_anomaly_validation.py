import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from phase10_anomaly_validation import (
    fit_isolation_forest,
    impute_by_transformer,
    percentile_flag,
    robust_baseline_scores,
    transformer_time_split,
)


class Phase10ValidationTests(unittest.TestCase):
    def setUp(self):
        timestamps = pd.date_range("2020-01-01", periods=6, freq="h")
        self.df = pd.DataFrame({
            "transformer_id": ["TX-A"] * 3 + ["TX-B"] * 3,
            "timestamp": list(timestamps[:3]) + list(timestamps[:3]),
            "x_ppm_log1p": [0.0, 0.0, 1.0, 2.0, 2.0, 3.0],
            "x_ppm_delta": [np.nan, 0.0, 1.0, np.nan, 0.0, 1.0],
            "x_ppm_roll_std_3": [np.nan, 0.0, 0.5, np.nan, 0.0, 0.5],
            "observed_gas_count": [9, 9, 8, 9, 8, 7],
            "missing_gas_count": [0, 0, 1, 0, 1, 2],
            "hours_since_previous_record": [np.nan, 1.0, 1.0, np.nan, 48.0, 1.0],
        })
        self.cols = ["x_ppm_log1p", "x_ppm_delta", "x_ppm_roll_std_3", "observed_gas_count", "missing_gas_count", "hours_since_previous_record"]

    def test_trailing_window_does_not_use_future_value(self):
        series = pd.Series([1.0, 3.0, 10.0])
        rolling = series.rolling(2, min_periods=1).mean()
        self.assertEqual(rolling.iloc[1], 2.0)
        self.assertEqual(rolling.iloc[2], 6.5)

    def test_timestamp_split_is_per_transformer_and_ordered(self):
        mask = transformer_time_split(self.df, 2 / 3)
        self.assertTrue(mask.iloc[0])
        self.assertTrue(mask.iloc[1])
        self.assertFalse(mask.iloc[2])
        self.assertTrue(mask.iloc[3])
        self.assertTrue(mask.iloc[4])
        self.assertFalse(mask.iloc[5])

    def test_imputation_handles_missing_and_invalid_values(self):
        df = self.df.copy()
        df.loc[0, "x_ppm_log1p"] = np.inf
        fit, score, _ = impute_by_transformer(df, self.cols)
        self.assertTrue(np.isfinite(fit).all())
        self.assertTrue(np.isfinite(score).all())

    def test_threshold_calculation_and_empty_input(self):
        threshold, flags = percentile_flag([1, 2, 3, 4], 0.25)
        self.assertEqual(threshold, 3.25)
        self.assertEqual(int(flags.sum()), 1)
        with self.assertRaises(ValueError):
            percentile_flag([], 0.05)
        with self.assertRaises(ValueError):
            percentile_flag([1, 2], 1.0)

    def test_transformer_specific_baseline_is_finite_for_constant_features(self):
        mask = pd.Series([True, True, False, True, True, False])
        train_score, score, reasons = robust_baseline_scores(self.df, self.cols, mask, ~mask)
        self.assertTrue(np.isfinite(train_score).all())
        self.assertTrue(np.isfinite(score).all())
        self.assertEqual(len(reasons), int((~mask).sum()))

    def test_single_transformer_and_sparse_observations(self):
        one = self.df.iloc[:3].copy()
        mask = pd.Series([True, True, False], index=one.index)
        train, score, _ = robust_baseline_scores(one, self.cols, mask, ~mask)
        self.assertEqual(len(score), 1)
        self.assertTrue(np.isfinite(score).all())

    def test_duplicate_timestamp_key_is_detectable(self):
        duplicate = pd.concat([self.df, self.df.iloc[[0]]], ignore_index=True)
        self.assertTrue(duplicate.duplicated(["transformer_id", "timestamp"]).any())

    def test_isolation_forest_scores_are_finite_and_deterministic(self):
        fit, score, _ = impute_by_transformer(self.df, self.cols)
        _, first = fit_isolation_forest(fit, score, n_estimators=20, max_samples=4, contamination=0.2)
        _, second = fit_isolation_forest(fit, score, n_estimators=20, max_samples=4, contamination=0.2)
        self.assertTrue(np.isfinite(first).all())
        np.testing.assert_allclose(first, second)


if __name__ == "__main__":
    unittest.main()
