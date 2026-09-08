"""
Degradation Engine
Calculates degradation trends (STABLE | INCREASING | RAPIDLY_INCREASING) and status.
"""
from typing import Dict, Any
from ..models.degradation_state import DegradationState
from ..rules.risk_rules import load_risk_config


class DegradationEngine:
    def __init__(self):
        cfg = load_risk_config().get("degradation", {})
        self.stable_rate_max = cfg.get("stable_rate_max", 1.0e-7)
        self.rapid_rate_min = cfg.get("rapid_rate_min", 1.0e-6)

    def evaluate(self, degradation: DegradationState) -> Dict[str, Any]:
        overall = degradation.overall_degradation
        rate = degradation.degradation_rate

        # Determine trend
        if rate >= self.rapid_rate_min:
            trend = "RAPIDLY_INCREASING"
        elif rate > self.stable_rate_max:
            trend = "INCREASING"
        elif rate < -1.0e-7:
            trend = "DECREASING"
        else:
            trend = "STABLE"

        # Determine degradation status
        if overall >= 0.5 or trend == "RAPIDLY_INCREASING":
            status = "CRITICAL"
        elif overall >= 0.15 or trend == "INCREASING":
            status = "DEGRADING"
        else:
            status = "NORMAL"

        return {
            "status": status,
            "overall_degradation": overall,
            "trend": trend,
            "degradation_rate": rate,
            "subsystem_degradations": {
                "thermal": degradation.thermal_degradation,
                "lubrication": degradation.lubrication_degradation,
                "combustion": degradation.combustion_degradation,
                "mechanical": degradation.mechanical_degradation,
                "electrical": degradation.electrical_degradation,
            },
        }
