"""
Fault Severity Engine
Evaluates fault severity, active status, evidence, and status categories (NORMAL | WARNING | CRITICAL).
"""
from typing import Dict, Any, Tuple, Optional
from ..models.fault_state import FaultState
from ..rules.fault_rules import get_fault_info


class FaultSeverityEngine:
    def evaluate(self, fault: FaultState) -> Dict[str, Any]:
        info = get_fault_info(fault.fault_code)
        fault_name = fault.fault_name if fault.fault_name != "Healthy" else info.get("name", "Healthy")
        if fault.fault_code == 0:
            fault_name = "Healthy"

        severity = fault.severity
        confidence = fault.confidence
        active = fault.active or (fault.fault_code > 0 and severity > 0.1)

        if not active or fault.fault_code == 0:
            status = "NORMAL"
            primary_fault = None
        elif severity >= 0.7:
            status = "CRITICAL"
            primary_fault = fault_name
        else:
            status = "WARNING"
            primary_fault = fault_name

        return {
            "status": status,
            "severity": severity,
            "confidence": confidence,
            "primary_fault": primary_fault,
            "active": active,
            "fault_code": fault.fault_code,
            "fault_name": fault_name,
            "subsystem": info.get("subsystem", "GENERAL"),
            "advisory": info.get("advisory", ""),
            "operational": info.get("operational", ""),
        }
