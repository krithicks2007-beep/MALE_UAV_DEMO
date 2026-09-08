"""
Unit Tests for X4 Feature Extraction Pipeline
"""

import unittest
from ai.data.schemas import CanonicalTelemetry, TwinResiduals
from ai.features.engineering import FeatureExtractor
from ai.features.statistics import compute_cylinder_statistics, compute_operating_state_features


class TestFeatures(unittest.TestCase):

    def test_cylinder_statistics(self):
        egt_values = [810.0, 815.0, 805.0, 810.0]
        stats = compute_cylinder_statistics(egt_values, prefix="egt")
        self.assertEqual(stats["egt_mean"], 810.0)
        self.assertEqual(stats["egt_max"], 815.0)
        self.assertEqual(stats["egt_min"], 805.0)
        self.assertEqual(stats["egt_spread"], 10.0)

    def test_operating_state_features(self):
        op = compute_operating_state_features(rpm=5200.0, map_kpa=95.0)
        self.assertTrue(op["is_high_power"] == 1.0)
        self.assertTrue(op["is_idle"] == 0.0)
        self.assertGreater(op["engine_load_factor"], 0.8)

    def test_feature_extractor_pipeline(self):
        extractor = FeatureExtractor()
        tel = CanonicalTelemetry(
            timestamp=1725450000.0,
            mission_id="TEST-001",
            frame_id=1,
            rpm=5200.0,
            map=95.0,
            cht=[135.0, 136.0, 134.0, 135.0],
            egt=[810.0, 812.0, 808.0, 810.0],
            oil_pressure=4.2,
            oil_temperature=90.0,
            vibration=0.32
        )
        res = TwinResiduals(
            timestamp=1725450000.0,
            mission_id="TEST-001",
            frame_id=1,
            residuals={"egt_residual_mean": 2.0, "residual_score": 0.1}
        )
        feats = extractor.extract_features(tel, res)
        self.assertIn("egt_mean", feats.features)
        self.assertIn("egt_spread", feats.features)
        self.assertIn("oil_pressure", feats.features)
        self.assertIn("egt_slope", feats.features)
        self.assertEqual(feats.feature_version, "features-v0.1")


if __name__ == "__main__":
    unittest.main()
