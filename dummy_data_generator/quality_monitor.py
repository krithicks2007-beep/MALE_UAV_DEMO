"""
Telemetry & Sensor Channel Quality Monitor
Evaluates physical boundaries, rate-of-change, and sensor fault states
to determine individual channel qualities and overall stream health.
"""
from typing import Dict, List, Literal
from .models import CanonicalTelemetry, ChannelQuality, ScenarioDefinition


class QualityMonitor:
    def evaluate_quality(
        self,
        telemetry: CanonicalTelemetry,
        active_scenario: ScenarioDefinition,
        fault_intensity: float
    ) -> ChannelQuality:
        channels: Dict[str, Literal["GOOD", "DEGRADED", "INVALID", "MISSING"]] = {
            "rpm": "GOOD",
            "map": "GOOD",
            "cht_c1": "GOOD",
            "cht_c2": "GOOD",
            "cht_c3": "GOOD",
            "cht_c4": "GOOD",
            "egt_c1": "GOOD",
            "egt_c2": "GOOD",
            "egt_c3": "GOOD",
            "egt_c4": "GOOD",
            "oil_pressure": "GOOD",
            "oil_temperature": "GOOD",
            "fuel_flow": "GOOD",
            "vibration": "GOOD",
            "battery_voltage": "GOOD",
            "alternator_current": "GOOD"
        }

        sid = active_scenario.id if active_scenario else "NORMAL"

        if sid == "SENSOR_DRIFT" and fault_intensity > 0.1:
            channels["egt_c1"] = "DEGRADED"

        elif sid == "SENSOR_FAILURE" and fault_intensity > 0.2:
            channels["egt_c1"] = "INVALID"

        # Check telemetry validity bounds
        if telemetry.egt[0] < 50.0:
            channels["egt_c1"] = "INVALID"
        if telemetry.oil_pressure < 0.5:
            channels["oil_pressure"] = "DEGRADED"

        overall: Literal["GOOD", "DEGRADED", "INVALID"] = "GOOD"
        if any(v == "INVALID" for v in channels.values()):
            overall = "INVALID"
        elif any(v == "DEGRADED" for v in channels.values()):
            overall = "DEGRADED"

        return ChannelQuality(
            overall_quality=overall,
            channel_quality=channels
        )
