"""
End-to-End Orchestrator Integration Test.
"""
import pytest
from decision_support.engine.decision_engine import DecisionEngine
from decision_support.models import (
    DecisionInput,
    EngineState,
    FaultState,
    DegradationState,
    RULState,
    MissionState,
    AIState,
)


def test_full_decision_engine_overheating_scenario():
    orchestrator = DecisionEngine()

    eng = EngineState(
        timestamp="2026-09-06T15:10:00Z",
        rpm=5400,
        cht=[195.0, 198.0, 196.0, 199.0],
        egt=[820.0, 835.0, 828.0, 840.0],
        oil_pressure=3.8,
        oil_temperature=115.0,
        fuel_flow=22.0,
        vibration=2.5,
        battery_voltage=13.8,
        alternator_current=25.0,
        injection_timing=20.0,
        health_index=0.65,
    )
    fault = FaultState(fault_code=7, severity=0.83, confidence=0.88, evidence=0.85, active=True)
    deg = DegradationState(thermal_degradation=0.35, overall_degradation=0.28, degradation_rate=1.2e-6)
    rul = RULState(rul_hours=114.7, rul_confidence=0.75)
    mission = MissionState(altitude_m=6000.0, high_altitude=True, hot_weather=True, endurance=True)
    ai = AIState(anomaly_score=0.91, anomaly_flag=True, ml_fault_code=7)

    payload = DecisionInput(
        engine=eng,
        fault=fault,
        degradation=deg,
        rul=rul,
        mission=mission,
        ai=ai,
    )

    result = orchestrator.evaluate(payload)

    # Verify Explicit User Output Schema
    assert result.decision.risk_level in ["HIGH", "CRITICAL"]
    assert result.fault_assessment.primary_fault == "Overheating Trend"
    assert result.fault_assessment.status in ["WARNING", "CRITICAL"]
    assert result.degradation_assessment.trend == "RAPIDLY_INCREASING"
    assert result.rul_assessment.status == "HIGH_PRIORITY"
    assert result.maintenance.priority in ["HIGH", "IMMEDIATE"]
    assert "thermal" in result.operational.recommendation.lower() or "overheating" in result.operational.recommendation.lower()
    assert len(result.explanation) > 0
