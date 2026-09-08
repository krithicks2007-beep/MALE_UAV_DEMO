"""
Unit Tests for X4 Evaluation Metrics & Confusion Matrix
"""

import unittest
from ai.evaluation.metrics import compute_classification_metrics, compute_regression_metrics
from ai.evaluation.confusion_matrix import generate_confusion_matrix


class TestEvaluation(unittest.TestCase):

    def test_classification_metrics(self):
        y_true = ["misfire", "misfire", "injector_abnormality", "healthy"]
        y_pred = ["misfire", "injector_abnormality", "injector_abnormality", "healthy"]
        labels = ["misfire", "injector_abnormality", "healthy"]

        metrics = compute_classification_metrics(y_true, y_pred, labels)
        self.assertIn("per_class", metrics)
        self.assertIn("macro_f1", metrics)
        self.assertGreater(metrics["macro_f1"], 0.0)
        self.assertEqual(metrics["per_class"]["healthy"]["f1"], 1.0)
        self.assertEqual(metrics["per_class"]["injector_abnormality"]["recall"], 1.0)

    def test_regression_metrics(self):
        y_true = [100.0, 80.0, 60.0, 40.0]
        y_pred = [98.0, 82.0, 59.0, 41.0]
        uncertainties = [3.0, 3.0, 3.0, 3.0]

        reg = compute_regression_metrics(y_true, y_pred, uncertainties)
        self.assertAlmostEqual(reg["mae"], 1.5, places=2)
        self.assertLess(reg["rmse"], 2.0)
        self.assertEqual(reg["max_error"], 2.0)
        self.assertEqual(reg["prediction_interval_coverage"], 1.0)

    def test_confusion_matrix(self):
        y_true = ["misfire", "healthy", "misfire"]
        y_pred = ["misfire", "healthy", "healthy"]
        labels = ["misfire", "healthy"]

        cm = generate_confusion_matrix(y_true, y_pred, labels)
        self.assertEqual(cm["matrix"]["misfire"]["misfire"], 1)
        self.assertEqual(cm["matrix"]["misfire"]["healthy"], 1)
        self.assertEqual(cm["matrix"]["healthy"]["healthy"], 1)


if __name__ == "__main__":
    unittest.main()
