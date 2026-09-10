"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Performance & Diagnostic Evaluation Metrics
Spec: MVP v0.1
"""

from typing import List, Dict, Any, Tuple
import numpy as np


def compute_classification_metrics(
    y_true: List[str],
    y_pred: List[str],
    labels: List[str]
) -> Dict[str, Any]:
    """
    Computes per-class and macro Precision, Recall, and F1 score.
    """
    metrics: Dict[str, Dict[str, float]] = {}
    total_tp = 0
    total_fp = 0
    total_fn = 0

    for label in labels:
        tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == label and yp == label)
        fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt != label and yp == label)
        fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == label and yp != label)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        metrics[label] = {
            "precision": round(float(prec), 3),
            "recall": round(float(rec), 3),
            "f1": round(float(f1), 3),
            "support": sum(1 for yt in y_true if yt == label)
        }
        total_tp += tp
        total_fp += fp
        total_fn += fn

    macro_f1 = float(np.mean([m["f1"] for m in metrics.values()])) if metrics else 0.0
    macro_prec = float(np.mean([m["precision"] for m in metrics.values()])) if metrics else 0.0
    macro_rec = float(np.mean([m["recall"] for m in metrics.values()])) if metrics else 0.0

    return {
        "per_class": metrics,
        "macro_precision": round(macro_prec, 3),
        "macro_recall": round(macro_rec, 3),
        "macro_f1": round(macro_f1, 3),
    }


def compute_regression_metrics(
    y_true: List[float],
    y_pred: List[float],
    uncertainties: Optional[List[float]] = None
) -> Dict[str, float]:
    """
    Computes MAE, RMSE, Max Error, and Prediction Interval Coverage Probability (PICP).
    """
    arr_true = np.array(y_true, dtype=np.float64)
    arr_pred = np.array(y_pred, dtype=np.float64)

    errors = arr_pred - arr_true
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    max_err = float(np.max(np.abs(errors)))

    res = {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "max_error": round(max_err, 3),
    }

    if uncertainties is not None:
        arr_unc = np.array(uncertainties, dtype=np.float64)
        within_interval = np.abs(errors) <= arr_unc
        coverage = float(np.mean(within_interval))
        res["prediction_interval_coverage"] = round(coverage, 3)

    return res
