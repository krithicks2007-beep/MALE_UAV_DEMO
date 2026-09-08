"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Runtime Model Predictor & Artifact Loader
Loads trained model artifacts once into memory for ultra-fast, lightweight inference.
"""

import json
import os
from typing import Optional
from ..models.anomaly import AnomalyDetector
from ..models.fault_classifier import FaultClassifier
from ..models.health import HealthEstimator
from ..models.degradation import DegradationEstimator
from ..models.rul import RULEstimator


class ModelPredictor:
    """
    Encapsulates all loaded AI models in memory.
    """

    def __init__(self, artifacts_dir: Optional[str] = None, model_version: str = "ai-v0.1"):
        self.model_version = model_version
        if artifacts_dir is None:
            base_dir = os.path.dirname(os.path.dirname(__file__))
            self.artifacts_dir = os.path.join(base_dir, "models", "artifacts")
        else:
            self.artifacts_dir = artifacts_dir

        self.anomaly_detector: AnomalyDetector = self._load_anomaly_model()
        self.fault_classifier: FaultClassifier = self._load_fault_model()
        self.health_estimator: HealthEstimator = HealthEstimator(model_version=self.model_version)
        self.degradation_estimator: DegradationEstimator = DegradationEstimator(model_version=self.model_version)
        self.rul_estimator: RULEstimator = self._load_rul_model()

    def _load_anomaly_model(self) -> AnomalyDetector:
        path = os.path.join(self.artifacts_dir, "anomaly_model.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return AnomalyDetector.from_dict(json.load(f))
        return AnomalyDetector(model_version=self.model_version)

    def _load_fault_model(self) -> FaultClassifier:
        path = os.path.join(self.artifacts_dir, "fault_model.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return FaultClassifier.from_dict(json.load(f))
        return FaultClassifier(model_version=self.model_version)

    def _load_rul_model(self) -> RULEstimator:
        path = os.path.join(self.artifacts_dir, "rul_model.json")
        if os.path.exists(path):
            with open(path, "r") as f:
                return RULEstimator.from_dict(json.load(f))
        return RULEstimator(model_version=self.model_version)
