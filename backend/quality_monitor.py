"""
Telemetry & Sensor Channel Quality Monitor
Integrates with the canonical Telemetry Gateway Quality Engine (telemetry.gateway.quality)
to evaluate physical boundaries, spread deviations, and sensor fault states.
"""
from typing import Dict, List, Literal, Optional, Any
from .models import CanonicalTelemetry, ChannelQuality, ScenarioDefinition
from telemetry.gateway.quality import assess_telemetry_quality, assess_channel_quality
from telemetry.schema.telemetry import CanonicalTelemetry as GatewayCanonicalTelemetry


class QualityMonitor:
    def evaluate_quality(
        self,
        telemetry: CanonicalTelemetry,
        active_scenario: ScenarioDefinition,
        fault_intensity: float,
        gateway_quality: Optional[Any] = None
    ) -> ChannelQuality:
        """
        Evaluate channel quality using telemetry gateway quality rules combined
        with active scenario injection state.
        """
        # Run Telemetry Gateway quality assessment if not pre-computed
        if gateway_quality is None:
            try:
                # Convert to Gateway CanonicalTelemetry representation
                gw_telemetry = GatewayCanonicalTelemetry(
                    schema_version="0.1",
                    timestamp=0.0,
                    mission_id=telemetry.mission_id,
                    frame_id=telemetry.frame_id,
                    source=telemetry.source,
                    rpm=telemetry.rpm,
                    map=telemetry.map * 100.0,  # bar to kPa for gateway
                    cht=telemetry.cht,
                    egt=telemetry.egt,
                    oil_pressure=telemetry.oil_pressure,
                    oil_temperature=telemetry.oil_temperature,
                    fuel_flow=telemetry.fuel_flow,
                    vibration=telemetry.vibration,
                    battery_voltage=telemetry.battery_voltage,
                    alternator_current=telemetry.alternator_current,
                    injection_timing=telemetry.injection_timing
                )
                gateway_quality = assess_telemetry_quality(gw_telemetry)
            except Exception:
                gateway_quality = None

        # Base channels mapping
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

        # Apply gateway channel quality assessment if available
        if gateway_quality and hasattr(gateway_quality, "channel_quality"):
            cq = gateway_quality.channel_quality
            for key in ["rpm", "map", "oil_pressure", "oil_temperature", "fuel_flow", "vibration", "battery_voltage", "alternator_current"]:
                if key in cq and isinstance(cq[key], dict):
                    st = cq[key].get("state", "good").upper()
                    if st in ["GOOD", "DEGRADED", "INVALID", "MISSING"]:
                        channels[key] = st  # type: ignore

            if "cht" in cq and isinstance(cq["cht"], list):
                for i, item in enumerate(cq["cht"]):
                    k = f"cht_c{i+1}"
                    if k in channels and isinstance(item, dict):
                        st = item.get("state", "good").upper()
                        if st in ["GOOD", "DEGRADED", "INVALID", "MISSING"]:
                            channels[k] = st  # type: ignore

            if "egt" in cq and isinstance(cq["egt"], list):
                for i, item in enumerate(cq["egt"]):
                    k = f"egt_c{i+1}"
                    if k in channels and isinstance(item, dict):
                        st = item.get("state", "good").upper()
                        if st in ["GOOD", "DEGRADED", "INVALID", "MISSING"]:
                            channels[k] = st  # type: ignore

        # Apply scenario-specific fault injections
        sid = active_scenario.id if active_scenario else "NORMAL"

        if sid == "SENSOR_DRIFT" and fault_intensity > 0.1:
            channels["egt_c1"] = "DEGRADED"

        elif sid == "SENSOR_FAILURE" and fault_intensity > 0.2:
            channels["egt_c1"] = "INVALID"

        # Check telemetry validity bounds
        if telemetry.egt and len(telemetry.egt) > 0 and telemetry.egt[0] < 50.0:
            channels["egt_c1"] = "INVALID"
        if telemetry.oil_pressure < 0.5:
            channels["oil_pressure"] = "DEGRADED"

        # Determine overall quality
        overall: Literal["GOOD", "DEGRADED", "INVALID"] = "GOOD"
        if any(v == "INVALID" for v in channels.values()):
            overall = "INVALID"
        elif any(v == "DEGRADED" for v in channels.values()):
            overall = "DEGRADED"

        return ChannelQuality(
            overall_quality=overall,
            channel_quality=channels
        )
