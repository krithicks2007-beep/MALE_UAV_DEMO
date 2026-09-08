"""
Unit Tests for X4 Anomaly Detection Model
"""

import unittest
from ai.models.anomaly import AnomalyDetector


class TestAnomalyDetector(unittest.TestCase):

    def setUp(self):
        self.detector = AnomalyDetector(threshold=0.65, persistence_window=2)
        # Train with healthy baseline
        healthy_samples = [
            {
                "rpm": 5200.0, "map": 94.0, "cht_mean": 135.0, "cht_spread": 2.0,
                "egt_mean": 810.0, "egt_spread": 5.0, "oil_pressure": 4.2,
                "oil_temperature": 88.0, "vibration": 0.32, "residual_score": 0.1,
                "thermal_residual_deviation": 0.1
            }
            for _ in range(50)
        ]
        self.detector.train(healthy_samples)

    def test_healthy_frame_scoring(self):
        healthy_feat = {
            "rpm": 5205.0, "map": 94.1, "cht_mean": 135.2, "cht_spread": 2.1,
            "egt_mean": 811.0, "egt_spread": 5.2, "oil_pressure": 4.18,
            "oil_temperature": 88.2, "vibration": 0.33, "residual_score": 0.15,
            "thermal_residual_deviation": 0.12
        }
        detected, score, evidence = self.detector.predict(healthy_feat)
        self.assertFalse(detected)
        self.assertLess(score, 0.65)

    def test_anomalous_frame_detection(self):
        fault_feat = {
            "rpm": 4800.0, "map": 94.0, "cht_mean": 175.0, "cht_spread": 25.0,
            "egt_mean": 920.0, "egt_spread": 90.0, "oil_pressure": 2.1,
            "oil_temperature": 115.0, "vibration": 1.1, "residual_score": 4.5,
            "thermal_residual_deviation": 3.8
        }
        # Run 2 consecutive frames to trigger persistence window
        self.detector.predict(fault_feat)
        detected, score, evidence = self.detector.predict(fault_feat)
        self.assertTrue(detected)
        self.assertGreaterEqual(score, 0.65)
        self.assertGreater(len(evidence), 0)


if __name__ == "__main__":
    unittest.main()
