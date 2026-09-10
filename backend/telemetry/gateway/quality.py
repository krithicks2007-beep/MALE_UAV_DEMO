import math
from typing import Any, Dict, List, Optional
from telemetry.schema.telemetry import TelemetryQuality, ChannelQuality, CanonicalTelemetry


def assess_channel_quality(
    value: Optional[float],
    minimum: Optional[float] = None,
    maximum: Optional[float] = None,
    channel_name: str = "Channel"
) -> Dict[str, Any]:
    """
    Assess the quality of an individual telemetry channel value.
    States: 'good' | 'degraded' | 'invalid' | 'missing'
    """
    if value is None:
        return {
            "valid": False,
            "state": "missing",
            "reason": f"{channel_name} value is missing"
        }

    if isinstance(value, float) and math.isnan(value):
        return {
            "valid": False,
            "state": "missing",
            "reason": f"{channel_name} value is NaN"
        }

    # Range / outlier assessment
    if minimum is not None and value < minimum:
        return {
            "valid": False if value < (minimum * 0.5 if minimum > 0 else minimum * 2) else True,
            "state": "invalid" if value < 0 and minimum >= 0 else "degraded",
            "reason": f"{channel_name} ({value}) below nominal minimum ({minimum})"
        }

    if maximum is not None and value > maximum:
        return {
            "valid": False if value > maximum * 1.5 else True,
            "state": "invalid" if value > maximum * 1.5 else "degraded",
            "reason": f"{channel_name} ({value}) exceeds nominal maximum ({maximum})"
        }

    return {
        "valid": True,
        "state": "good",
        "reason": None
    }


def detect_outlier(value: Optional[float], minimum: float, maximum: float) -> bool:
    """
    Check whether a telemetry value is outside the configured acceptable range.
    """
    if value is None:
        return False
    if isinstance(value, float) and math.isnan(value):
        return True
    return value < minimum or value > maximum


def assess_telemetry_quality(telemetry: CanonicalTelemetry) -> TelemetryQuality:
    """
    Comprehensive quality assessment across all channels conforming to
    Common Data Schemas Section 7.
    """
    channel_q: Dict[str, Any] = {}
    states: List[str] = []

    # 1. RPM (Nominal 1400 - 5800, range limits 0 - 7000 rev/min)
    rpm_q = assess_channel_quality(telemetry.rpm, minimum=0.0, maximum=7000.0, channel_name="RPM")
    if telemetry.rpm is not None and detect_outlier(telemetry.rpm, 0, 7000):
        rpm_q["state"] = "degraded"
        rpm_q["reason"] = "RPM is outside expected range"
    channel_q["rpm"] = rpm_q
    states.append(rpm_q["state"])

    # 2. MAP (Nominal 30 - 125, range limits 15 - 150 kPa)
    map_q = assess_channel_quality(telemetry.map, minimum=15.0, maximum=150.0, channel_name="MAP")
    if detect_outlier(telemetry.map, 0, 150):
        map_q["state"] = "degraded"
        map_q["reason"] = "MAP is outside expected range"
    channel_q["map"] = map_q
    states.append(map_q["state"])

    # 3. Oil Pressure (Nominal 2.0 - 5.5, limits 0.8 - 7.0 bar)
    oil_p_q = assess_channel_quality(telemetry.oil_pressure, minimum=0.8, maximum=7.0, channel_name="Oil Pressure")
    channel_q["oil_pressure"] = oil_p_q
    states.append(oil_p_q["state"])

    # 4. Oil Temperature (Nominal 70 - 115, limits 40 - 140 °C)
    oil_t_q = assess_channel_quality(telemetry.oil_temperature, minimum=40.0, maximum=140.0, channel_name="Oil Temperature")
    channel_q["oil_temperature"] = oil_t_q
    states.append(oil_t_q["state"])

    # 5. Fuel Flow (Limits 0 - 60 L/h)
    ff_q = assess_channel_quality(telemetry.fuel_flow, minimum=0.0, maximum=60.0, channel_name="Fuel Flow")
    channel_q["fuel_flow"] = ff_q
    states.append(ff_q["state"])

    # 6. Vibration (Limits 0 - 2.5 g)
    vib_q = assess_channel_quality(telemetry.vibration, minimum=0.0, maximum=2.5, channel_name="Vibration")
    channel_q["vibration"] = vib_q
    states.append(vib_q["state"])

    # 7. Electrical
    batt_q = assess_channel_quality(telemetry.battery_voltage, minimum=18.0, maximum=32.0, channel_name="Battery Voltage")
    channel_q["battery_voltage"] = batt_q
    states.append(batt_q["state"])

    alt_q = assess_channel_quality(telemetry.alternator_current, minimum=0.0, maximum=60.0, channel_name="Alternator Current")
    channel_q["alternator_current"] = alt_q
    states.append(alt_q["state"])

    # 8. Injection Timing
    inj_q = assess_channel_quality(telemetry.injection_timing, minimum=10.0, maximum=40.0, channel_name="Injection Timing")
    channel_q["injection_timing"] = inj_q
    states.append(inj_q["state"])

    # 9. Multi-cylinder CHT (Nominal 80 - 135 °C, limit 180 °C)
    cht_qualities = []
    if telemetry.cht:
        for i, val in enumerate(telemetry.cht):
            cq = assess_channel_quality(val, minimum=40.0, maximum=180.0, channel_name=f"CHT Cyl {i+1}")
            cht_qualities.append(cq)
            states.append(cq["state"])

        # Check cylinder spread
        valid_chts = [v for v in telemetry.cht if v is not None and not math.isnan(v)]
        if len(valid_chts) > 1 and (max(valid_chts) - min(valid_chts)) > 35.0:
            for cq in cht_qualities:
                if cq["state"] == "good":
                    cq["state"] = "degraded"
                    cq["reason"] = f"Excessive CHT cylinder spread ({max(valid_chts) - min(valid_chts):.1f} °C)"
    channel_q["cht"] = cht_qualities

    # 10. Multi-cylinder EGT (Nominal 650 - 880 °C, limit 1000 °C)
    egt_qualities = []
    if telemetry.egt:
        for i, val in enumerate(telemetry.egt):
            eq = assess_channel_quality(val, minimum=400.0, maximum=1000.0, channel_name=f"EGT Cyl {i+1}")
            egt_qualities.append(eq)
            states.append(eq["state"])

        valid_egts = [v for v in telemetry.egt if v is not None and not math.isnan(v)]
        if len(valid_egts) > 1 and (max(valid_egts) - min(valid_egts)) > 90.0:
            for eq in egt_qualities:
                if eq["state"] == "good":
                    eq["state"] = "degraded"
                    eq["reason"] = f"Excessive EGT cylinder spread ({max(valid_egts) - min(valid_egts):.1f} °C)"
    channel_q["egt"] = egt_qualities

    # Collect all final states from channel_q
    all_states: List[str] = []
    for val in channel_q.values():
        if isinstance(val, list):
            for item in val:
                if isinstance(item, dict) and "state" in item:
                    all_states.append(item["state"])
        elif isinstance(val, dict) and "state" in val:
            all_states.append(val["state"])

    # Determine overall quality
    if "invalid" in all_states:
        overall = "invalid"
    elif "missing" in all_states:
        overall = "missing" if (channel_q.get("rpm", {}).get("state") == "missing" or channel_q.get("map", {}).get("state") == "missing") else "degraded"
    elif "degraded" in all_states:
        overall = "degraded"
    else:
        overall = "good"

    return TelemetryQuality(
        overall_quality=overall,
        channel_quality=channel_q,
        timestamp=telemetry.timestamp
    )
