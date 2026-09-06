"""
Physics + AI Fusion Engine
Evaluates physics-based fault diagnosis vs ML anomaly / fault classification.
Explicitly identifies AGREEMENT, DISAGREEMENT, PARTIAL_AGREEMENT, or INSUFFICIENT_EVIDENCE.
"""
from typing import Dict, Any
from ..models.fault_state import FaultState
from ..models.ai_state import AIState
from ..models.decision_result import FusionResult
from ..rules.fault_rules import get_fault_info


class FusionEngine:
    def evaluate(self, fault: FaultState, ai: AIState) -> FusionResult:
        physics_code = fault.fault_code if (fault.active or fault.fault_code > 0) else 0
        ai_code = ai.ml_fault_code if (ai.anomaly_flag or (ai.ml_fault_code and ai.ml_fault_code > 0)) else 0

        phys_info = get_fault_info(physics_code)
        ai_info = get_fault_info(ai_code if ai_code is not None else 0)

        physics_fault_name = phys_info.get("name", "Healthy") if physics_code > 0 else "None"
        ai_fault_name = ai_info.get("name", "Healthy") if (ai_code and ai_code > 0) else "None"

        # Case 1: Insufficient evidence
        if fault.confidence < 0.2 and ai.anomaly_confidence < 0.2:
            return FusionResult(
                physics_fault=physics_fault_name,
                ai_fault=ai_fault_name,
                agreement=True,
                diagnostic_conflict=False,
                explanation="Insufficient evidence from both physics model and AI classifier.",
            )

        # Case 2: Both Healthy
        if physics_code == 0 and (ai_code == 0 or ai_code is None):
            return FusionResult(
                physics_fault="None",
                ai_fault="None",
                agreement=True,
                diagnostic_conflict=False,
                explanation="Physics model and AI classifier both indicate nominal operation.",
            )

        # Case 3: Agreement
        if physics_code == ai_code:
            return FusionResult(
                physics_fault=physics_fault_name,
                ai_fault=ai_fault_name,
                agreement=True,
                diagnostic_conflict=False,
                explanation=f"Physics model and AI classifier AGREE on fault: {physics_fault_name}.",
            )

        # Case 4: Disagreement / Conflict
        if physics_code != 0 and ai_code != 0 and physics_code != ai_code:
            return FusionResult(
                physics_fault=physics_fault_name,
                ai_fault=ai_fault_name,
                agreement=False,
                diagnostic_conflict=True,
                explanation=f"Diagnostic Conflict: Physics model indicates {physics_fault_name} while AI indicates {ai_fault_name}.",
            )

        # Case 5: Partial Agreement (One detects fault, other indicates normal or anomaly)
        if physics_code != 0 and (ai_code == 0 or ai_code is None):
            expl = f"Physics model detected {physics_fault_name}, but AI classifier has not confirmed."
        else:
            expl = f"AI classifier detected {ai_fault_name}, but Physics model indicates nominal."

        return FusionResult(
            physics_fault=physics_fault_name,
            ai_fault=ai_fault_name,
            agreement=False,
            diagnostic_conflict=True,
            explanation=expl,
        )
