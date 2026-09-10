"""
Risk Engine
Combines health index, fault severity, degradation, RUL, mission stressors, environmental stressors,
AI anomaly score, and uncertainty to calculate an overall risk_score [0, 1] and risk_level (LOW | MODERATE | HIGH | CRITICAL).
"""
from typing import Dict, Any
from ..models.engine_state import EngineState
from ..models.fault_state import FaultState
from ..models.degradation_state import DegradationState
from ..models.rul_state import RULState
from ..models.ai_state import AIState
from ..models.decision_result import FusionResult
from ..rules.risk_rules import load_risk_config


class RiskEngine:
    def __init__(self):
        cfg = load_risk_config()
        self.weights = cfg.get("weights", {})
        self.levels = cfg.get("levels", {})

    def evaluate(
        self,
        engine: EngineState,
        fault: FaultState,
        degradation: DegradationState,
        rul: RULState,
        mission_assessment: Dict[str, Any],
        ai: AIState,
        fusion: FusionResult,
        confidence_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        # 1. Health risk (0 if health=1.0, 1 if health=0.0)
        health_risk = max(0.0, 1.0 - engine.health_index)

        # 2. Fault risk
        fault_risk = fault.severity if (fault.active or fault.fault_code > 0) else 0.0

        # 3. Degradation risk
        degradation_risk = degradation.overall_degradation
        if degradation.degradation_rate > 1.0e-6:
            degradation_risk = min(1.0, degradation_risk + 0.3)

        # 4. RUL risk
        if rul.rul_hours is None:
            rul_risk = 0.1
        elif rul.rul_hours < 50:
            rul_risk = 1.0
        elif rul.rul_hours < 200:
            rul_risk = 0.7
        elif rul.rul_hours < 500:
            rul_risk = 0.4
        else:
            rul_risk = max(0.0, 1.0 - (rul.rul_hours / 1000.0))

        # 5. Mission risk
        mission_risk = mission_assessment.get("risk_score", 0.1)

        # 6. Environment risk
        env_risk = 0.2 if "COMBINED_STRESS" in mission_assessment.get("stressors", []) else 0.05

        # 7. AI Anomaly risk
        anomaly_risk = ai.anomaly_score if ai.anomaly_flag else 0.05

        # 8. Uncertainty risk
        uncertainty_risk = 0.3 if fusion.diagnostic_conflict else 0.05

        # Weighted calculation
        w = self.weights
        raw_score = (
            w.get("health_risk", 0.20) * health_risk
            + w.get("fault_risk", 0.20) * fault_risk
            + w.get("degradation_risk", 0.15) * degradation_risk
            + w.get("rul_risk", 0.15) * rul_risk
            + w.get("mission_risk", 0.15) * mission_risk
            + w.get("environment_risk", 0.05) * env_risk
            + w.get("anomaly_risk", 0.05) * anomaly_risk
            + w.get("uncertainty_risk", 0.05) * uncertainty_risk
        )

        risk_score = min(1.0, max(0.0, raw_score))

        # Classify level
        l = self.levels
        if risk_score >= l.get("high_max", 0.85) or (fault.active and fault.severity >= 0.85):
            risk_level = "CRITICAL"
        elif risk_score >= l.get("moderate_max", 0.60) or (fault.active and fault.severity >= 0.60):
            risk_level = "HIGH"
        elif risk_score >= l.get("low_max", 0.35) or (fault.active and fault.severity >= 0.30):
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "components": {
                "health_risk": health_risk,
                "fault_risk": fault_risk,
                "degradation_risk": degradation_risk,
                "rul_risk": rul_risk,
                "mission_risk": mission_risk,
                "environment_risk": env_risk,
                "anomaly_risk": anomaly_risk,
                "uncertainty_risk": uncertainty_risk,
            },
        }
