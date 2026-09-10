"""
Unit tests for FastAPI REST Endpoints using TestClient.
"""
import pytest
from fastapi.testclient import TestClient
from decision_support.api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"


def test_version_endpoint():
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert data["schema_version"] == "1.0.0"


def test_evaluate_endpoint():
    payload = {
        "engine": {
            "timestamp": "2026-09-06T15:00:00Z",
            "rpm": 5200,
            "cht": [135.0, 137.0, 134.5, 136.0],
            "egt": [680.0, 685.0, 678.0, 682.0],
            "oil_pressure": 4.5,
            "oil_temperature": 85.0,
            "fuel_flow": 18.5,
            "vibration": 1.2,
            "battery_voltage": 14.1,
            "alternator_current": 22.0,
            "injection_timing": 22.0,
            "health_index": 0.98,
        },
        "fault": {"fault_code": 0, "fault_name": "Healthy", "severity": 0.0, "active": False},
        "degradation": {"overall_degradation": 0.02, "degradation_rate": 5e-8},
        "rul": {"rul_hours": 850.0, "rul_confidence": 0.90},
        "mission": {"mission_phase": "CRUISE", "altitude_m": 3000.0},
        "ai": {"anomaly_score": 0.02, "anomaly_flag": False},
    }

    response = client.post("/decision/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data
    assert data["decision"]["risk_level"] == "LOW"
    assert "fault_assessment" in data
    assert "degradation_assessment" in data
    assert "rul_assessment" in data
    assert "mission_assessment" in data
    assert "maintenance" in data
    assert "operational" in data
    assert "explanation" in data
