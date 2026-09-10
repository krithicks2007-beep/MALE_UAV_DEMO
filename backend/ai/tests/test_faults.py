"""
Unit Tests for X4 Multi-Class Fault Classification
"""

import unittest
from ai.models.fault_classifier import FaultClassifier
from ai.data.schemas import FaultType


class TestFaultClassifier(unittest.TestCase):

    def setUp(self):
        self.classifier = FaultClassifier(confidence_threshold=0.60)

    def test_injector_abnormality(self):
        features = {
            "egt_residual_max": 75.0,
            "egt_spread": 60.0,
            "cht_mean": 140.0,
            "oil_pressure": 4.2,
            "oil_temperature": 90.0,
            "vibration": 0.38
        }
        fault, conf, evidence = self.classifier.predict(features, anomaly_detected=True)
        self.assertEqual(fault, FaultType.INJECTOR_ABNORMALITY.value)
        self.assertGreaterEqual(conf, 0.60)

    def test_misfire(self):
        features = {
            "egt_spread": 160.0,
            "vibration": 0.85,
            "oil_pressure": 4.2,
            "oil_temperature": 89.0
        }
        fault, conf, evidence = self.classifier.predict(features, anomaly_detected=True)
        self.assertEqual(fault, FaultType.MISFIRE.value)
        self.assertGreaterEqual(conf, 0.60)

    def test_overheating(self):
        features = {
            "cht_res_mean": 40.0,
            "cht_mean": 175.0,
            "oil_temperature": 118.0,
            "oil_temp_residual": 28.0,
            "oil_pressure": 3.8
        }
        fault, conf, evidence = self.classifier.predict(features, anomaly_detected=True)
        self.assertEqual(fault, FaultType.OVERHEATING.value)
        self.assertGreaterEqual(conf, 0.60)

    def test_lubrication_issue(self):
        features = {
            "oil_pressure": 1.8,
            "oil_pressure_residual": -2.4,
            "oil_temperature": 110.0,
            "oil_temp_residual": 20.0
        }
        fault, conf, evidence = self.classifier.predict(features, anomaly_detected=True)
        self.assertEqual(fault, FaultType.LUBRICATION_ISSUE.value)
        self.assertGreaterEqual(conf, 0.60)

    def test_abnormal_vibration(self):
        features = {
            "vibration": 1.35,
            "egt_residual_mean": 5.0,
            "cht_residual_mean": 2.0
        }
        fault, conf, evidence = self.classifier.predict(features, anomaly_detected=True)
        self.assertEqual(fault, FaultType.ABNORMAL_VIBRATION.value)
        self.assertGreaterEqual(conf, 0.60)

    def test_sensor_failure(self):
        features = {"vibration": 0.35}
        quality_flags = ["sensor_fault_egt_4_missing"]
        fault, conf, evidence = self.classifier.predict(features, quality_flags=quality_flags, anomaly_detected=True)
        self.assertEqual(fault, FaultType.SENSOR_FAILURE.value)
        self.assertGreaterEqual(conf, 0.60)


if __name__ == "__main__":
    unittest.main()
