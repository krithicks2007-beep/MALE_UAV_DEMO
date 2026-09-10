"""
Unit tests for Physics vs AI Fusion Engine.
"""
import pytest
from decision_support.engine.fusion_engine import FusionEngine
from decision_support.models import FaultState, AIState


def test_fusion_agreement_and_conflict():
    fusion = FusionEngine()

    # Agreement
    f1 = FaultState(fault_code=7, active=True)
    ai1 = AIState(anomaly_flag=True, ml_fault_code=7)
    r1 = fusion.evaluate(f1, ai1)
    assert r1.agreement is True
    assert r1.diagnostic_conflict is False

    # Conflict
    f2 = FaultState(fault_code=7, active=True)
    ai2 = AIState(anomaly_flag=True, ml_fault_code=1)
    r2 = fusion.evaluate(f2, ai2)
    assert r2.agreement is False
    assert r2.diagnostic_conflict is True
    assert "Physics model indicates Overheating Trend while AI indicates Misfire" in r2.explanation
