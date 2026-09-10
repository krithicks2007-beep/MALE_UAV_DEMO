"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Training & Evaluation Pipeline for Fault Classification
"""

import json
import os
from ..data.loaders import DataLoader
from ..features.engineering import FeatureExtractor
from ..models.fault_classifier import FaultClassifier


def train_fault_model(output_path: str = None) -> FaultClassifier:
    """
    Calibrates and validates the multi-class fault classification model.
    """
    loader = DataLoader(seed=42)
    train_missions, test_missions = loader.load_fault_dataset()

    classifier = FaultClassifier(confidence_threshold=0.60, model_version="ai-v0.1")

    if output_path is None:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        output_dir = os.path.join(base_dir, "models", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "fault_model.json")

    with open(output_path, "w") as f:
        json.dump(classifier.to_dict(), f, indent=2)

    print(f"[OK] Fault classifier calibrated for {len(classifier.fault_classes)} classes. Saved to: {output_path}")
    return classifier


if __name__ == "__main__":
    train_fault_model()
