"""
Confidence Manager
Computes decision confidence [0, 1] and uncertainty level (LOW_UNCERTAINTY | MODERATE_UNCERTAINTY | HIGH_UNCERTAINTY).
Incorporates physics confidence, AI confidence, RUL confidence, evidence strength, and fusion agreement.
"""
from typing import Dict, Any
from ..models.fault_state import FaultState
from ..models.ai_state import AIState
from ..models.rul_state import RULState
from ..models.decision_result import FusionResult
from ..rules.confidence_rules import load_confidence_config


class ConfidenceManager:
    def evaluate(self, fault: FaultState, ai: AIState, rul: RULState, fusion: FusionResult) -> Dict[str, Any]:
        conf_scores = [fault.confidence, ai.anomaly_confidence, ai.ml_fault_confidence, rul.rul_confidence]
        if fault.evidence is not None and fault.evidence > 0:
            conf_scores.append(fault.evidence)

        raw_confidence = sum(conf_scores) / len(conf_scores)

        # Apply penalty for physics/AI disagreement
        if fusion.diagnostic_conflict:
            raw_confidence *= 0.65

        # Apply penalty if severe fault is claimed with low evidence
        if fault.severity > 0.6 and (fault.evidence or 0.0) < 0.3:
            raw_confidence *= 0.70

        final_confidence = min(1.0, max(0.0, raw_confidence))

        if final_confidence >= 0.75:
            uncertainty_level = "LOW_UNCERTAINTY"
        elif final_confidence >= 0.45:
            uncertainty_level = "MODERATE_UNCERTAINTY"
        else:
            uncertainty_level = "HIGH_UNCERTAINTY"

        return {
            "confidence": final_confidence,
            "uncertainty_level": uncertainty_level,
        }
