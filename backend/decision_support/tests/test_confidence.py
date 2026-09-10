"""
Unit tests for Confidence Manager & Uncertainty logic.
"""
import pytest
from decision_support.engine.confidence_manager import ConfidenceManager
from decision_support.models import FaultState, AIState, RULState
from decision_support.models.decision_result import FusionResult


def test_confidence_conflict_penalty():
    mgr = ConfidenceManager()
    fault = FaultState(fault_code=7, confidence=0.9, evidence=0.85)
    ai = AIState(anomaly_confidence=0.85, ml_fault_confidence=0.85)
    rul = RULState(rul_confidence=0.8)

    # Agreement case
    fusion_agree = FusionResult(agreement=True, diagnostic_conflict=False)
    r1 = mgr.evaluate(fault, ai, rul, fusion_agree)
    assert r1["uncertainty_level"] == "LOW_UNCERTAINTY"

    # Conflict case
    fusion_conflict = FusionResult(agreement=False, diagnostic_conflict=True)
    r2 = mgr.evaluate(fault, ai, rul, fusion_conflict)
    assert r2["confidence"] < r1["confidence"]
