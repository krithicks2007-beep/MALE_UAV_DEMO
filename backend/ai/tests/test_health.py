"""
Unit Tests for X4 Engine Health Estimation
"""

import unittest
from ai.models.health import HealthEstimator
from ai.data.schemas import HealthStatus, FaultType


class TestHealthEstimator(unittest.TestCase):

    def setUp(self):
        self.estimator = HealthEstimator()

    def test_healthy_baseline_score(self):
        health, status = self.estimator.assess_health(
            anomaly_score=0.05,
            residual_score=0.1,
            degradation_estimate=0.0,
            fault_type=None
        )
        self.assertGreaterEqual(health, 80.0)
        self.assertEqual(status, HealthStatus.HEALTHY.value)

    def test_degraded_status(self):
        health, status = self.estimator.assess_health(
            anomaly_score=0.45,
            residual_score=1.2,
            degradation_estimate=0.30,
            fault_type=None
        )
        self.assertTrue(60.0 <= health < 80.0)
        self.assertEqual(status, HealthStatus.DEGRADED.value)

    def test_critical_lubrication_failure(self):
        health, status = self.estimator.assess_health(
            anomaly_score=0.95,
            residual_score=3.5,
            degradation_estimate=0.60,
            fault_type=FaultType.LUBRICATION_ISSUE.value,
            fault_confidence=0.90
        )
        self.assertLess(health, 30.0)
        self.assertEqual(status, HealthStatus.CRITICAL.value)


if __name__ == "__main__":
    unittest.main()
