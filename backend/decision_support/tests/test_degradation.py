"""
Unit tests for Degradation Engine trend classification.
"""
import pytest
from decision_support.engine.degradation_engine import DegradationEngine
from decision_support.models import DegradationState


def test_degradation_trends():
    engine = DegradationEngine()

    # Stable
    d_stable = DegradationState(overall_degradation=0.05, degradation_rate=1.0e-8)
    r1 = engine.evaluate(d_stable)
    assert r1["trend"] == "STABLE"
    assert r1["status"] == "NORMAL"

    # Increasing
    d_inc = DegradationState(overall_degradation=0.20, degradation_rate=3.0e-7)
    r2 = engine.evaluate(d_inc)
    assert r2["trend"] == "INCREASING"
    assert r2["status"] == "DEGRADING"

    # Rapidly increasing
    d_rapid = DegradationState(overall_degradation=0.45, degradation_rate=2.0e-6)
    r3 = engine.evaluate(d_rapid)
    assert r3["trend"] == "RAPIDLY_INCREASING"
    assert r3["status"] == "CRITICAL"
