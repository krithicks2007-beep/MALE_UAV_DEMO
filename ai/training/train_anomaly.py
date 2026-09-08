"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Training Pipeline for Baseline Anomaly Detection
"""

import json
import os
from ..data.loaders import DataLoader
from ..features.engineering import FeatureExtractor
from ..models.anomaly import AnomalyDetector


def train_anomaly_model(output_path: str = None) -> AnomalyDetector:
    """
    Learns healthy operational baselines across healthy missions
    and saves the model artifact.
    """
    loader = DataLoader(seed=42)
    train_missions, _, _ = loader.load_anomaly_dataset()

    feature_extractor = FeatureExtractor()
    healthy_feature_samples = []

    for mission in train_missions:
        feature_extractor.temporal_buffer.reset()
        for frame in mission:
            feats = feature_extractor.extract_features(
                telemetry=frame["telemetry"],
                residuals=frame["residuals"],
                quality=frame["quality"]
            )
            healthy_feature_samples.append(feats.features)

    detector = AnomalyDetector(threshold=0.65, persistence_window=3, model_version="ai-v0.1")
    detector.train(healthy_feature_samples)

    if output_path is None:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        output_dir = os.path.join(base_dir, "models", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "anomaly_model.json")

    with open(output_path, "w") as f:
        json.dump(detector.to_dict(), f, indent=2)

    print(f"[OK] Anomaly detector trained on {len(healthy_feature_samples)} healthy frames. Saved to: {output_path}")
    return detector


if __name__ == "__main__":
    train_anomaly_model()
