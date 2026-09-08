"""
Unit tests for Risk Engine calculation and level mapping.
"""
import pytest
from decision_support.engine.risk_engine import RiskEngine
from decision_support.models import (
    EngineState,
    FaultState,
    DegradationState,
    RULState,
    AIState,
)
from decision_support.models.decision_result import FusionResult


def test_risk_healthy_state():
    engine_risk = RiskEngine()
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
        health_index=0.98,
    )
    fault = FaultState(fault_code=0, active=False)
    deg = DegradationState(overall_degradation=0.02)
    rul = RULState(rul_hours=850.0)
    ai = AIState(anomaly_flag=False, anomaly_score=0.02)
    fusion = FusionResult(agreement=True, diagnostic_conflict=False)
    conf = {"confidence": 0.95, "uncertainty_level": "LOW_UNCERTAINTY"}
    mission_res = {"risk_score": 0.1, "stressors": []}

    res = engine_risk.evaluate(eng, fault, deg, rul, mission_res, ai, fusion, conf)
    assert res["risk_level"] == "LOW"
    assert res["risk_score"] < 0.35


def test_risk_critical_overheating():
    engine_risk = RiskEngine()
    eng = EngineState(
        timestamp="2026-09-06T15:00:00Z",
        rpm=5400,
        cht=[195, 198, 196, 199],
        egt=[820, 835, 828, 840],
        oil_pressure=3.8,
        oil_temperature=115.0,
        fuel_flow=22.0,
        vibration=2.5,
        battery_voltage=13.8,
        alternator_current=25.0,
        injection_timing=20.0,
        health_index=0.65,
    )
    fault = FaultState(fault_code=7, severity=0.85, active=True)
    deg = DegradationState(overall_degradation=0.35, degradation_rate=1.5e-6)
    rul = RULState(rul_hours=45.0)
    ai = AIState(anomaly_flag=True, anomaly_score=0.92)
    fusion = FusionResult(agreement=True, diagnostic_conflict=False)
    conf = {"confidence": 0.85, "uncertainty_level": "LOW_UNCERTAINTY"}
    mission_res = {"risk_score": 0.75, "stressors": ["COMBINED_STRESS"]}

    res = engine_risk.evaluate(eng, fault, deg, rul, mission_res, ai, fusion, conf)
    assert res["risk_level"] == "CRITICAL"
    assert res["risk_score"] >= 0.60

