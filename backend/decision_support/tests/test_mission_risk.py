"""
Unit tests for Mission Risk Engine stress factors.
"""
import pytest
from decision_support.engine.mission_risk import MissionRiskEngine
from decision_support.models import (
    MissionState,
    EnvironmentState,
    EngineState,
    FaultState,
    DegradationState,
)


def test_mission_combined_stress():
    engine_mission = MissionRiskEngine()

    eng = EngineState(
        timestamp="2026-09-06T15:00:00Z",
        rpm=5200,
        cht=[135, 135, 135, 135],
        egt=[680, 680, 680, 680],
        oil_pressure=4.5,
        oil_temperature=85.0,
        fuel_flow=18.5,
        vibration=1.2,
        battery_voltage=14.1,
        alternator_current=22.0,
        injection_timing=22.0,
    )
    mission = MissionState(
        altitude_m=6000.0,
        high_altitude=True,
        hot_weather=True,
        endurance=True,
    )
    env = EnvironmentState(ambient_temperature=310.15, altitude_m=6000.0)
    fault = FaultState(fault_code=0)
    deg = DegradationState(overall_degradation=0.05)

    res = engine_mission.evaluate(mission, env, eng, fault, deg)
    assert "COMBINED_STRESS" in res["stressors"]
    assert res["risk_score"] > 0.4
