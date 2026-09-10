"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Degradation Estimation Model
Spec: MVP v0.1 | Model Version: ai-v0.1
Range: 0.0 (Nominal baseline) to 1.0 (End-of-useful-life threshold)
"""

from typing import Dict, Any, Optional
import numpy as np


class DegradationEstimator:
    """
    Estimates continuous mechanical and thermal degradation trajectory progression [0.0, 1.0].
    """

    def __init__(self, model_version: str = "ai-v0.1"):
        self.model_version = model_version
        self.cumulative_stress: float = 0.0

    def reset(self):
        """Reset degradation estimator state."""
        self.cumulative_stress = 0.0

    def estimate(
        self,
        features: Dict[str, float],
        anomaly_score: float = 0.0
    ) -> float:
        """
        Estimates degradation level based on thermo-mechanical stress indicators.
        """
        # Thermal stress indicator (CHT > 140°C or Oil Temp > 95°C)
        cht_mean = features.get("cht_mean", 135.0)
        oil_t = features.get("oil_temperature", 90.0)
        oil_p = features.get("oil_pressure", 4.2)
        vib = features.get("vibration", 0.35)
        res_score = features.get("residual_score", 0.0)

        thermal_stress = max(0.0, (cht_mean - 135.0) / 35.0) + max(0.0, (oil_t - 90.0) / 25.0)
        mechanical_stress = max(0.0, (vib - 0.35) / 0.8) + max(0.0, (4.2 - oil_p) / 2.0)
        residual_stress = max(0.0, res_score / 4.0)

        instant_stress = 0.4 * thermal_stress + 0.4 * mechanical_stress + 0.2 * residual_stress

        # Synthesize instantaneous degradation estimate
        degradation = min(1.0, max(0.0, instant_stress))
        return round(float(degradation), 3)

    def to_dict(self) -> Dict[str, Any]:
        return {"model_version": self.model_version}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DegradationEstimator":
        return cls(model_version=str(data.get("model_version", "ai-v0.1")))
