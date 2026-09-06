"""
Unit Tests for X4 Degradation and RUL Forecasting
"""

import unittest
from ai.models.degradation import DegradationEstimator
from ai.models.rul import RULEstimator


class TestRUL(unittest.TestCase):

    def setUp(self):
        self.deg_estimator = DegradationEstimator()
        self.rul_estimator = RULEstimator(nominal_useful_life_hours=100.0, base_uncertainty_hours=4.0)

    def test_nominal_rul(self):
        rul, unit, unc = self.rul_estimator.predict(degradation_estimate=0.0, anomaly_score=0.0)
        self.assertAlmostEqual(rul, 100.0, delta=2.0)
        self.assertEqual(unit, "operating_hours")
        self.assertGreater(unc, 0.0)

    def test_progressed_degradation_rul(self):
        rul_50, _, unc_50 = self.rul_estimator.predict(degradation_estimate=0.50, anomaly_score=0.1)
        rul_80, _, unc_80 = self.rul_estimator.predict(degradation_estimate=0.80, anomaly_score=0.2)

        # Monotonic decrease in RUL
        self.assertLess(rul_80, rul_50)
        self.assertLess(rul_50, 100.0)
        self.assertGreater(rul_80, 0.0)


if __name__ == "__main__":
    unittest.main()
