"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Multi-Class Fault Classifier
Spec: MVP v0.1 | Model Version: ai-v0.1
Diagnoses the 8 standardized shared fault vocabulary types:
- misfire
- injector_abnormality
- lubrication_issue
- sensor_drift
- sensor_failure
- combustion_instability
- overheating
- abnormal_vibration
"""

from typing import Dict, Any, Optional, Tuple, List
import numpy as np
from ..data.schemas import FaultType


class FaultClassifier:
    """
    Multi-class diagnostic classifier mapping telemetry, residual patterns,
    and quality evidence to root-cause fault diagnoses with calibrated confidence.
    """

    def __init__(self, confidence_threshold: float = 0.60, model_version: str = "ai-v0.1"):
        self.confidence_threshold = confidence_threshold
        self.model_version = model_version
        self.fault_classes = [
            FaultType.MISFIRE.value,
            FaultType.INJECTOR_ABNORMALITY.value,
            FaultType.LUBRICATION_ISSUE.value,
            FaultType.SENSOR_DRIFT.value,
            FaultType.SENSOR_FAILURE.value,
            FaultType.COMBUSTION_INSTABILITY.value,
            FaultType.OVERHEATING.value,
            FaultType.ABNORMAL_VIBRATION.value,
        ]

    def predict(
        self,
        features: Dict[str, float],
        quality_flags: Optional[List[str]] = None,
        anomaly_detected: bool = True
    ) -> Tuple[Optional[str], Optional[float], List[str]]:
        """
        Diagnoses root cause fault and computes classification confidence.
        If evidence is insufficient or no anomaly detected, returns (None, None, []).
        """
        if not anomaly_detected:
            return None, None, []

        scores: Dict[str, float] = {f: 0.0 for f in self.fault_classes}
        evidence_map: Dict[str, List[str]] = {f: [] for f in self.fault_classes}

        # 1. Check for Sensor Failure / Quality Drops
        if quality_flags:
            for qf in quality_flags:
                if "sensor_fault" in qf or "sensor_implausible" in qf:
                    scores[FaultType.SENSOR_FAILURE.value] += 0.85
                    evidence_map[FaultType.SENSOR_FAILURE.value].append(f"quality_flag: {qf}")
                elif "sensor_drift" in qf:
                    scores[FaultType.SENSOR_DRIFT.value] += 0.80
                    evidence_map[FaultType.SENSOR_DRIFT.value].append(f"quality_flag: {qf}")

        # Extract diagnostic feature inputs
        egt_spread = features.get("egt_spread", 0.0)
        egt_res_mean = features.get("egt_residual_mean", 0.0)
        egt_res_max = features.get("egt_residual_max", 0.0)
        cht_mean = features.get("cht_mean", 135.0)
        cht_spread = features.get("cht_spread", 0.0)
        cht_res_mean = features.get("cht_residual_mean", 0.0)
        oil_p = features.get("oil_pressure", 4.2)
        oil_p_res = features.get("oil_pressure_residual", 0.0)
        oil_t = features.get("oil_temperature", 90.0)
        oil_t_res = features.get("oil_temp_residual", 0.0)
        vibration = features.get("vibration", 0.35)
        vib_res = features.get("vibration_residual", 0.0)
        vib_slope = features.get("vibration_slope", 0.0)
        vib_std = features.get("vibration_rolling_std", 0.0)
        res_score = features.get("residual_score", 0.0)

        # 2. Injector Abnormality Pattern
        # High individual cylinder EGT (positive residual), increased EGT spread, moderate CHT rise
        if egt_res_max > 45.0 and egt_spread > 40.0:
            score = min(0.95, 0.50 + (egt_res_max / 120.0) + (egt_spread / 100.0))
            scores[FaultType.INJECTOR_ABNORMALITY.value] = max(scores[FaultType.INJECTOR_ABNORMALITY.value], score)
            evidence_map[FaultType.INJECTOR_ABNORMALITY.value].append(
                f"high_egt_residual_max ({egt_res_max:.1f}°C) and egt_spread ({egt_spread:.1f}°C)"
            )

        # 3. Misfire Pattern
        # Negative EGT deviation in failed cylinder, elevated cyclic vibration, RPM instability
        if egt_spread > 80.0 and vibration > 0.65:
            score = min(0.96, 0.55 + (vibration / 1.5) + (egt_spread / 200.0))
            scores[FaultType.MISFIRE.value] = max(scores[FaultType.MISFIRE.value], score)
            evidence_map[FaultType.MISFIRE.value].append(
                f"severe_egt_split ({egt_spread:.1f}°C) with elevated_vibration ({vibration:.2f}g)"
            )

        # 4. Overheating Pattern
        # Both all CHTs and Oil Temperature elevated, positive CHT and Oil Temp residuals
        if cht_res_mean > 25.0 or (cht_mean > 165.0 and oil_t > 105.0):
            score = min(0.98, 0.60 + (cht_res_mean / 60.0) + (oil_t_res / 40.0))
            scores[FaultType.OVERHEATING.value] = max(scores[FaultType.OVERHEATING.value], score)
            evidence_map[FaultType.OVERHEATING.value].append(
                f"cht_residual_mean ({cht_res_mean:.1f}°C) and oil_temp ({oil_t:.1f}°C)"
            )

        # 5. Lubrication Issue Pattern
        # Oil pressure drop (negative residual) + Oil temperature elevation
        if oil_p_res < -1.0 or oil_p < 2.5:
            score = min(0.97, 0.60 + (abs(oil_p_res) / 3.0) + (oil_t_res / 50.0))
            scores[FaultType.LUBRICATION_ISSUE.value] = max(scores[FaultType.LUBRICATION_ISSUE.value], score)
            evidence_map[FaultType.LUBRICATION_ISSUE.value].append(
                f"oil_pressure_loss ({oil_p:.2f} bar, res: {oil_p_res:.2f} bar) and oil_temp_rise ({oil_t:.1f}°C)"
            )

        # 6. Abnormal Vibration Pattern
        # High vibration without major thermal deviations
        if vibration > 0.90 and abs(egt_res_mean) < 30.0 and abs(cht_res_mean) < 15.0:
            score = min(0.95, 0.55 + (vibration / 2.0))
            scores[FaultType.ABNORMAL_VIBRATION.value] = max(scores[FaultType.ABNORMAL_VIBRATION.value], score)
            evidence_map[FaultType.ABNORMAL_VIBRATION.value].append(
                f"excessive_mechanical_vibration ({vibration:.2f}g) with normal thermal profile"
            )

        # 7. Combustion Instability Pattern
        # Oscillating vibration std and dynamic slopes across thermal channels
        if vib_std > 0.15 and egt_spread > 30.0:
            score = min(0.92, 0.50 + (vib_std / 0.5) + (egt_spread / 100.0))
            scores[FaultType.COMBUSTION_INSTABILITY.value] = max(scores[FaultType.COMBUSTION_INSTABILITY.value], score)
            evidence_map[FaultType.COMBUSTION_INSTABILITY.value].append(
                f"cyclic_vibration_variance ({vib_std:.3f}) and thermal_instability"
            )

        # 8. Sensor Drift Pattern
        # Isolated single channel spread without physics multi-channel correlation
        if cht_spread > 40.0 and oil_t < 100.0 and vib_res < 0.1 and res_score < 2.5:
            score = min(0.90, 0.55 + (cht_spread / 80.0))
            scores[FaultType.SENSOR_DRIFT.value] = max(scores[FaultType.SENSOR_DRIFT.value], score)
            evidence_map[FaultType.SENSOR_DRIFT.value].append(
                f"isolated_thermal_spread ({cht_spread:.1f}°C) without mechanical/oil symptoms"
            )

        # Find best candidate
        best_fault = max(scores, key=lambda k: scores[k])
        best_score = scores[best_fault]

        if best_score >= self.confidence_threshold:
            return best_fault, round(float(best_score), 2), evidence_map[best_fault]

        return None, None, []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "confidence_threshold": self.confidence_threshold,
            "model_version": self.model_version,
            "fault_classes": self.fault_classes
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FaultClassifier":
        return cls(
            confidence_threshold=float(data.get("confidence_threshold", 0.60)),
            model_version=str(data.get("model_version", "ai-v0.1"))
        )
