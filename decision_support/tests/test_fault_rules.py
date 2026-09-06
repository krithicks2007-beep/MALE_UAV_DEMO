"""
Unit tests for all 8 fault codes (Misfire, Injector, Overheating, etc.).
"""
import pytest
from decision_support.engine.fault_severity import FaultSeverityEngine
from decision_support.models import FaultState


@pytest.mark.parametrize(
    "code, name, expected_subsystem",
    [
        (0, "Healthy", "GENERAL"),
        (1, "Misfire", "COMBUSTION"),
        (2, "Injector Abnormality", "FUEL_SYSTEM"),
        (3, "Coding Degradation", "CONTROL"),
        (4, "Lubrication Issue", "LUBRICATION"),
        (5, "Sensor Drift/Failure", "SENSORS"),
        (6, "Combustion Instability", "COMBUSTION"),
        (7, "Overheating Trend", "THERMAL"),
        (8, "Abnormal Vibration", "MECHANICAL"),
    ],
)
def test_all_eight_faults(code, name, expected_subsystem):
    engine = FaultSeverityEngine()
    fault = FaultState(fault_code=code, severity=0.6, active=(code > 0))
    res = engine.evaluate(fault)
    assert res["subsystem"] == expected_subsystem
    if code == 0:
        assert res["status"] == "NORMAL"
    else:
        assert res["status"] in ["WARNING", "CRITICAL"]
