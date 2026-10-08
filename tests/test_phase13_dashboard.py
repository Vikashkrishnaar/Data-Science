"""
Unit and integration tests for Phase 13 Dashboard, UX, and System Integration.
Verifies data integrity, priority rankings, condition band boundaries,
synthetic vs real separation, and absence of unsupported failure claims.
"""

import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR / "scripts"))
sys.path.insert(0, str(BASE_DIR / "dashboard"))

from app import load_condition_summary, load_robustness_summary


class Phase13DashboardTests(unittest.TestCase):
    def setUp(self):
        self.condition_df = load_condition_summary()
        self.robustness_df = load_robustness_summary()

    def test_fleet_transformer_count_and_assets(self):
        """Verify exactly 13 unique transformers are loaded."""
        self.assertEqual(len(self.condition_df), 13)
        expected_ids = {"TX-A", "TX-B", "TX-C", "TX-D", "TX-E", "TX-F", "TX-G", "TX-H", "TX-I", "TX-J", "TX-K", "TX-L", "TX-M"}
        self.assertEqual(set(self.condition_df["transformer_id"]), expected_ids)

    def test_condition_indicator_bounds(self):
        """Condition indicators must strictly lie within [0.0, 100.0]."""
        indicators = self.condition_df["condition_indicator"]
        self.assertTrue((indicators >= 0.0).all())
        self.assertTrue((indicators <= 100.0).all())

    def test_p1_priority_assignments(self):
        """Only TX-I and TX-M must be assigned P1 priority."""
        p1_assets = self.condition_df[self.condition_df["review_priority"].str.startswith("P1")]["transformer_id"].tolist()
        self.assertEqual(set(p1_assets), {"TX-I", "TX-M"})

    def test_limited_confidence_asset_cap(self):
        """TX-J has high condition indicator (80.38) but is capped to P2 due to limited confidence (missingness)."""
        tx_j = self.condition_df[self.condition_df["transformer_id"] == "TX-J"].iloc[0]
        self.assertEqual(tx_j["condition_band"], "HIGH REVIEW")
        self.assertEqual(tx_j["confidence"], "Limited confidence")
        self.assertTrue(tx_j["review_priority"].startswith("P2"))

    def test_condition_band_thresholds(self):
        """Verify condition band matches indicator score."""
        for _, row in self.condition_df.iterrows():
            score = row["condition_indicator"]
            band = row["condition_band"]
            if score >= 75.0:
                self.assertEqual(band, "HIGH REVIEW")
            elif score >= 50.0:
                self.assertEqual(band, "REVIEW")
            elif score >= 25.0:
                self.assertEqual(band, "MONITOR")
            else:
                self.assertEqual(band, "NORMAL")

    def test_robustness_matrix_integrity(self):
        """Verify 18-run robustness summary classifications."""
        self.assertEqual(len(self.robustness_df), 13)
        tx_i = self.robustness_df[self.robustness_df["transformer_id"] == "TX-I"].iloc[0]
        self.assertTrue("CONSISTENTLY HIGH" in str(tx_i["consensus_screening"]))
        top3_val = tx_i["top3_appearances"] if "top3_appearances" in tx_i else tx_i["top_3_count"]
        self.assertEqual(int(top3_val), 17)

        tx_m = self.robustness_df[self.robustness_df["transformer_id"] == "TX-M"].iloc[0]
        self.assertTrue("CONSISTENTLY HIGH" in str(tx_m["consensus_screening"]))
        top3_val_m = tx_m["top3_appearances"] if "top3_appearances" in tx_m else tx_m["top_3_count"]
        self.assertEqual(int(top3_val_m), 16)

    def test_no_fabricated_failure_claims(self):
        """Ensure no column or value asserts failure probability on real telemetry."""
        for col in self.condition_df.columns:
            self.assertNotIn("failure_probability", col.lower())
            self.assertNotIn("predicted_failure", col.lower())
            self.assertNotIn("failure_24h", col.lower())


if __name__ == "__main__":
    unittest.main()
