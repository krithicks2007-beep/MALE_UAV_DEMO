"""
Maintenance Advisor
Recommends maintenance priority (ROUTINE | PLANNED | HIGH | IMMEDIATE) and action text.
"""
from typing import Dict, Any
from ..models.fault_state import FaultState
from ..models.degradation_state import DegradationState
from ..models.rul_state import RULState
from ..rules.fault_rules import get_fault_info


class MaintenanceAdvisor:
    def evaluate(
        self,
        fault: FaultState,
        degradation: DegradationState,
        rul: RULState,
        risk_level: str,
    ) -> Dict[str, Any]:
        info = get_fault_info(fault.fault_code)
        fault_advisory = info.get("advisory", "")

        # Determine priority
        if risk_level == "CRITICAL" or fault.severity >= 0.8 or (rul.rul_hours is not None and rul.rul_hours < 50):
            priority = "IMMEDIATE"
            recommendation = (
                f"IMMEDIATE ACTION: {fault_advisory} Engineering review required prior to continued operation."
            )
        elif (
            risk_level == "HIGH"
            or fault.severity >= 0.5
            or degradation.overall_degradation >= 0.3
            or (rul.rul_hours is not None and rul.rul_hours < 200)
        ):
            priority = "HIGH"
            recommendation = f"HIGH PRIORITY: {fault_advisory} Inspect subsystem before next scheduled mission."
        elif degradation.degradation_rate > 1.0e-7 or (rul.rul_hours is not None and rul.rul_hours < 500):
            priority = "PLANNED"
            recommendation = (
                "PLANNED MAINTENANCE: Review degradation trend and perform routine servicing during upcoming downtime."
            )
        else:
            priority = "ROUTINE"
            recommendation = "ROUTINE: Continue standard engine inspection interval and telemetry monitoring."

        return {
            "priority": priority,
            "recommendation": recommendation,
        }
