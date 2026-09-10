"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Confusion Matrix Generator for Fault Classification
"""

from typing import List, Dict, Any


def generate_confusion_matrix(
    y_true: List[str],
    y_pred: List[str],
    labels: List[str]
) -> Dict[str, Any]:
    """
    Generates a structured 2D confusion matrix dictionary across target labels.
    """
    matrix: Dict[str, Dict[str, int]] = {
        true_lbl: {pred_lbl: 0 for pred_lbl in labels}
        for true_lbl in labels
    }

    for yt, yp in zip(y_true, y_pred):
        if yt in matrix and yp in matrix[yt]:
            matrix[yt][yp] += 1

    return {
        "labels": labels,
        "matrix": matrix
    }
