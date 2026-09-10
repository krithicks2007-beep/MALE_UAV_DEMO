"""
Unit tests for Pydantic input/output models and validation rules.
"""
import pytest
from decision_support.models import (
    EngineState,
    FaultState,
    DegradationState,
    RULState,
    MissionState,
    EnvironmentState,
    AIState,
    DecisionInput,
)


def test_engine_state_validation():
    state = EngineState(
        timestamp="2026-09-06T15:00:00Z",
        rpm=5200,
        cht=[135.0, 137.0, 134.5, 136.0],
        egt=[680.0, 685.0, 678.0, 682.0],
        oil_pressure=4.5,
        oil_temperature=85.0,
        fuel_flow=18.5,
        vibration=1.2,
        battery_voltage=14.1,
        alternator_current=22.0,
        injection_timing=22.0,
        health_index=95.0,  # Should normalize from percentage to 0.95
    )
    assert state.health_index == 0.95
    assert state.rpm == 5200


def test_fault_state_validation():
    fault = FaultState(fault_code=7, severity=85.0, confidence=90.0)
    assert fault.severity == 0.85
    assert fault.confidence == 0.90


def test_decision_input_construction():
    engine = EngineState(
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
    inp = DecisionInput(engine=engine)
    assert inp.engine.rpm == 5200
    assert inp.fault.fault_code == 0
