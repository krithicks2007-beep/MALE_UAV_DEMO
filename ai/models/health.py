"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Engine Health Index & Status Assessment Model
Spec: MVP v0.1 | Model Version: ai-v0.1
Scale: 0.0 to 100.0
Bands: healthy (80-100), degraded (60-79), warning (30-59), critical (0-29)
"""

from typing import Dict, Any, Optional, Tuple
from ..data.schemas import HealthStatus, FaultType


class HealthEstimator:
    """
    Computes overall Engine Health Index (0-100) and maps to discrete health status bands
    by synthesizing anomaly scores, physics residual severity, fault severity, and degradation.
    """

    def __init__(self, model_version: str = "ai-v0.1"):
        self.model_version = model_version

        # Fault severity penalties on health index
        self.fault_penalties = {
            FaultType.MISFIRE.value: 35.0,
            FaultType.INJECTOR_ABNORMALITY.value: 25.0,
            FaultType.LUBRICATION_ISSUE.value: 50.0,
            FaultType.OVERHEATING.value: 45.0,
            FaultType.ABNORMAL_VIBRATION.value: 30.0,
            FaultType.COMBUSTION_INSTABILITY.value: 25.0,
            FaultType.SENSOR_DRIFT.value: 12.0,
            FaultType.SENSOR_FAILURE.value: 15.0,
        }

    def assess_health(
        self,
        anomaly_score: float,
        residual_score: float,
        degradation_estimate: float = 0.0,
        fault_type: Optional[str] = None,
        fault_confidence: Optional[float] = None
    ) -> Tuple[float, str]:
        """
        Computes the unified Health Index and assigns Health Status band.
        """
        # Start from nominal baseline 100.0
        health = 100.0

        # 1. Anomaly score reduction (max -30 points)
        health -= (anomaly_score * 30.0)

        # 2. Physics residual score reduction (max -25 points)
        res_penalty = min(25.0, (residual_score / 3.0) * 25.0)
        health -= res_penalty

        # 3. Continuous mechanical degradation reduction (max -35 points)
        health -= (min(1.0, max(0.0, degradation_estimate)) * 35.0)

        # 4. Diagnosed Fault Severity Penalty
        if fault_type and fault_type in self.fault_penalties:
            conf = fault_confidence if fault_confidence is not None else 1.0
            fault_penalty = self.fault_penalties[fault_type] * conf
            health -= fault_penalty

        # Clamp between 0.0 and 100.0
        health_index = max(0.0, min(100.0, health))
        health_index = round(health_index, 1)

        # Determine Health Status Band
        if health_index >= 80.0:
            status = HealthStatus.HEALTHY.value
        elif health_index >= 60.0:
            status = HealthStatus.DEGRADED.value
        elif health_index >= 30.0:
            status = HealthStatus.WARNING.value
        else:
            status = HealthStatus.CRITICAL.value

        return health_index, status

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_version": self.model_version,
            "fault_penalties": self.fault_penalties
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "HealthEstimator":
        estimator = cls(model_version=str(data.get("model_version", "ai-v0.1")))
        if "fault_penalties" in data:
            estimator.fault_penalties = data["fault_penalties"]
        return estimator
