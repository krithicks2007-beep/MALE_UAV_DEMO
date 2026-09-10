"""
Operational Advisor
Provides human-readable flight/operator guidance and thermal/stress mitigation advice.
"""
from typing import Dict, Any, List
from ..models.fault_state import FaultState
from ..models.degradation_state import DegradationState
from ..models.mission_state import MissionState
from ..rules.fault_rules import get_fault_info


class OperationalAdvisor:
    def evaluate(
        self,
        fault: FaultState,
        degradation: DegradationState,
        mission_assessment: Dict[str, Any],
        risk_level: str,
    ) -> Dict[str, Any]:
        info = get_fault_info(fault.fault_code)
        fault_op = info.get("operational", "")

        recommendations: List[str] = []

        if fault_op and fault.fault_code > 0:
            recommendations.append(fault_op)

        stressors = mission_assessment.get("stressors", [])
        if "HOT_WEATHER" in stressors or fault.fault_code == 7:
            recommendations.append("Inspect cooling/thermal system and avoid prolonged high thermal stress where operationally feasible.")

        if "HIGH_ALTITUDE" in stressors:
            recommendations.append("High altitude detected; monitor manifold absolute pressure and fuel-air ratio balance.")

        if "RAPID_THROTTLE" in stressors:
            recommendations.append("Avoid abrupt throttle transients to reduce thermal and mechanical shock.")

        if risk_level == "CRITICAL":
            recommendations.append("CRITICAL RISK: Consider mission abort or flight profile reduction to preserve engine integrity.")
        elif risk_level == "HIGH":
            recommendations.append("HIGH RISK: Exercise flight caution; avoid continuous high-load regimes.")

        if not recommendations:
            rec_text = "Nominal operation within envelope. Maintain planned flight path."
        else:
            rec_text = " ".join(recommendations)

        return {
            "recommendation": rec_text,
        }
