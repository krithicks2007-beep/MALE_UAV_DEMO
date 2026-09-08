"""
Unit tests for RUL threshold classification.
"""
import pytest
from decision_support.engine.rul_engine import RULEngine
from decision_support.models import RULState


def test_rul_planning_categories():
    engine = RULEngine()

    # > 500 h -> NORMAL
    r1 = engine.evaluate(RULState(rul_hours=600.0))
    assert r1["status"] == "NORMAL"
    assert r1["planning_category"] == "NORMAL_MONITORING"

    # 200 - 500 h -> PLANNING
    r2 = engine.evaluate(RULState(rul_hours=350.0))
    assert r2["status"] == "PLANNING"
    assert r2["planning_category"] == "MAINTENANCE_PLANNING"

    # 50 - 200 h -> HIGH_PRIORITY
    r3 = engine.evaluate(RULState(rul_hours=120.0))
    assert r3["status"] == "HIGH_PRIORITY"
    assert r3["planning_category"] == "HIGH_PRIORITY"

    # < 50 h -> CRITICAL
    r4 = engine.evaluate(RULState(rul_hours=30.0))
    assert r4["status"] == "CRITICAL"
    assert r4["planning_category"] == "CRITICAL_REVIEW"
