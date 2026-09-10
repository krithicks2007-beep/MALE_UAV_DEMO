"""
Decision Engine Master Orchestrator
Orchestrates input validation, sub-engines (fault severity, degradation trend, RUL, mission risk, fusion, confidence, risk calculation, maintenance/operational advisors, explainability), and produces the standardized DecisionResult response.
"""
import logging
from datetime import datetime, timezone
from typing import List
from ..models.input_state import DecisionInput
from ..models.decision_result import (
    DecisionResult,
    DecisionSummary,
    FaultAssessment,
    DegradationAssessment,
    RULAssessment,
    MissionAssessment,
    MaintenanceAdvisoryResult,
    OperationalAdvisoryResult,
)
from .fault_severity import FaultSeverityEngine
from .degradation_engine import DegradationEngine
from .rul_engine import RULEngine
from .mission_risk import MissionRiskEngine
from .fusion_engine import FusionEngine
from .confidence_manager import ConfidenceManager
from .risk_engine import RiskEngine
from .maintenance_advisor import MaintenanceAdvisor
from .operational_advisor import OperationalAdvisor

logger = logging.getLogger("decision_support")


class DecisionEngine:
    def __init__(self):
        self.fault_severity_engine = FaultSeverityEngine()
        self.degradation_engine = DegradationEngine()
        self.rul_engine = RULEngine()
        self.mission_risk_engine = MissionRiskEngine()
        self.fusion_engine = FusionEngine()
        self.confidence_manager = ConfidenceManager()
        self.risk_engine = RiskEngine()
        self.maintenance_advisor = MaintenanceAdvisor()
        self.operational_advisor = OperationalAdvisor()

    def evaluate(self, input_data: DecisionInput) -> DecisionResult:
        timestamp = input_data.timestamp or datetime.now(timezone.utc).isoformat()
        logger.info(f"[DSS Evaluation] ts={timestamp} fault_code={input_data.fault.fault_code} severity={input_data.fault.severity}")


        # 1. Fault Severity Assessment
        fault_res = self.fault_severity_engine.evaluate(input_data.fault)

        # 2. Degradation Trend Assessment
        deg_res = self.degradation_engine.evaluate(input_data.degradation)

        # 3. RUL Planning Assessment
        rul_res = self.rul_engine.evaluate(input_data.rul, input_data.engine.health_index)

        # 4. Mission Risk Assessment
        mission_res = self.mission_risk_engine.evaluate(
            input_data.mission,
            input_data.environment,
            input_data.engine,
            input_data.fault,
            input_data.degradation,
        )

        # 5. Physics vs AI Fusion Assessment
        fusion_res = self.fusion_engine.evaluate(input_data.fault, input_data.ai)

        # 6. Confidence Management
        confidence_res = self.confidence_manager.evaluate(
            input_data.fault, input_data.ai, input_data.rul, fusion_res
        )

        # 7. Risk Calculation
        risk_res = self.risk_engine.evaluate(
            input_data.engine,
            input_data.fault,
            input_data.degradation,
            input_data.rul,
            mission_res,
            input_data.ai,
            fusion_res,
            confidence_res,
        )

        # 8. Maintenance Advisory
        maint_res = self.maintenance_advisor.evaluate(
            input_data.fault, input_data.degradation, input_data.rul, risk_res["risk_level"]
        )

        # 9. Operational Advisory
        op_res = self.operational_advisor.evaluate(
            input_data.fault, input_data.degradation, mission_res, risk_res["risk_level"]
        )

        # 10. Construct Explainability Notes
        explanations: List[str] = []
        if fault_res["active"] and fault_res["primary_fault"]:
            explanations.append(f"Active fault condition: {fault_res['primary_fault']} (Severity: {fault_res['severity']:.2f}).")
        else:
            explanations.append("Engine telemetry indicates no active physical faults.")

        explanations.append(f"Overall degradation status: {deg_res['status']} with trend: {deg_res['trend']}.")

        if rul_res["rul_hours"] is not None:
            explanations.append(f"Estimated model-based RUL: {rul_res['rul_hours']:.1f} hours ({rul_res['planning_category']}).")

        if mission_res["stressors"]:
            explanations.append(f"Mission stressors active: {', '.join(mission_res['stressors'])}.")

        explanations.append(fusion_res.explanation)

        # Build Standardized User Output Schema
        decision_summary = DecisionSummary(
            risk_level=risk_res["risk_level"],
            risk_score=round(risk_res["risk_score"], 4),
            confidence=round(confidence_res["confidence"], 4),
        )

        fault_assessment = FaultAssessment(
            status=fault_res["status"],
            severity=round(fault_res["severity"], 4),
            primary_fault=fault_res["primary_fault"],
        )

        degradation_assessment = DegradationAssessment(
            status=deg_res["status"],
            overall_degradation=round(deg_res["overall_degradation"], 4),
            trend=deg_res["trend"],
        )

        rul_assessment = RULAssessment(
            rul_hours=round(rul_res["rul_hours"], 1) if rul_res["rul_hours"] is not None else None,
            status=rul_res["status"],
            confidence=round(rul_res["confidence"], 4),
        )

        mission_assessment = MissionAssessment(
            mission_risk=mission_res["mission_risk"],
            mission_go=mission_res["mission_go"],
        )

        maintenance_result = MaintenanceAdvisoryResult(
            priority=maint_res["priority"],
            recommendation=maint_res["recommendation"],
        )

        operational_result = OperationalAdvisoryResult(
            recommendation=op_res["recommendation"],
        )

        return DecisionResult(
            timestamp=timestamp,
            decision=decision_summary,
            fault_assessment=fault_assessment,
            degradation_assessment=degradation_assessment,
            rul_assessment=rul_assessment,
            mission_assessment=mission_assessment,
            maintenance=maintenance_result,
            operational=operational_result,
            explanation=explanations,
            fusion=fusion_res,
            detailed_scores=risk_res["components"],
        )
