"""
RUL Engine
Interprets Remaining Useful Life (RUL) predictions and planning statuses.
Thresholds: >500h (NORMAL), 200-500h (PLANNING), 50-200h (HIGH_PRIORITY), <50h (CRITICAL).
"""
from typing import Dict, Any
from ..models.rul_state import RULState
from ..rules.risk_rules import load_risk_config


class RULEngine:
    def __init__(self):
        cfg = load_risk_config().get("rul", {})
        self.normal_hours = cfg.get("normal_monitoring_hours", 500)
        self.planning_hours = cfg.get("maintenance_planning_hours", 200)
        self.high_priority_hours = cfg.get("high_priority_hours", 50)

    def evaluate(self, rul: RULState, health_index: float = 1.0) -> Dict[str, Any]:
        hours = rul.rul_hours
        confidence = rul.rul_confidence

        if hours is None:
            return {
                "status": "NORMAL",
                "rul_hours": None,
                "confidence": confidence,
                "planning_category": "UNKNOWN",
            }

        if hours < self.high_priority_hours:
            status = "CRITICAL"
            planning_category = "CRITICAL_REVIEW"
        elif hours < self.planning_hours:
            status = "HIGH_PRIORITY"
            planning_category = "HIGH_PRIORITY"
        elif hours < self.normal_hours:
            status = "PLANNING"
            planning_category = "MAINTENANCE_PLANNING"
        else:
            status = "NORMAL"
            planning_category = "NORMAL_MONITORING"

        return {
            "status": status,
            "rul_hours": hours,
            "confidence": confidence,
            "planning_category": planning_category,
        }
