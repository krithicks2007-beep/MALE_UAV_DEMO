"""
Canonical Data Models & Schemas
Strictly matching the dashboard TypeScript contracts and Canonical Telemetry Schema v1.0.0.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal, Any
from datetime import datetime, timezone


class CanonicalTelemetry(BaseModel):
    timestamp: str = Field(description="ISO 8601 UTC timestamp")
    mission_id: str = Field(default="MALE-MSN-2026-001")
    frame_id: int = Field(description="Monotonic frame counter")
    source: str = Field(default="SIMULATION_ENGINE")
    rpm: float = Field(description="Engine RPM")
    map: float = Field(description="Manifold Absolute Pressure in bar")
    cht: List[float] = Field(description="Cylinder Head Temps [C1..C4] in °C")
    egt: List[float] = Field(description="Exhaust Gas Temps [C1..C4] in °C")
    oil_pressure: float = Field(description="Oil pressure in bar")
    oil_temperature: float = Field(description="Oil temperature in °C")
    fuel_flow: float = Field(description="Fuel flow in L/h")
    vibration: float = Field(description="Vibration magnitude in mm/s")
    battery_voltage: float = Field(description="Electrical system voltage in V")
    alternator_current: float = Field(description="Alternator current output in A")
    injection_timing: float = Field(description="Injection timing in °BTDC")


class FlightContext(BaseModel):
    altitude_m: float
    airspeed_kmh: float
    ambient_temp_c: float
    ambient_pressure_hpa: float
    fuel_quantity_pct: float
    mission_phase: str
    throttle_pct: float


class SubsystemHealth(BaseModel):
    mechanical: float = 95.0
    thermal: float = 91.0
    lubrication: float = 95.0
    combustion: float = 92.0


class HealthState(BaseModel):
    index: float = 93.0
    engine_state: Literal["NOMINAL", "WARNING", "DEGRADED", "CRITICAL"] = "NOMINAL"
    subsystems: SubsystemHealth = Field(default_factory=SubsystemHealth)
    degradation_trend: List[float] = Field(default_factory=list)
    last_updated: str = ""


class TwinVisualizationState(BaseModel):
    engine_state: Literal["NOMINAL", "WARNING", "DEGRADED", "CRITICAL"] = "NOMINAL"
    health_index: float = 93.0
    rpm: float = 2850.0
    thermal_state: Literal["NOMINAL", "ELEVATED", "HIGH", "CRITICAL"] = "NOMINAL"
    combustion_state: Literal["NOMINAL", "ABNORMAL", "MISFIRE"] = "NOMINAL"
    lubrication_state: Literal["NOMINAL", "DEGRADED", "CRITICAL"] = "NOMINAL"
    vibration_state: Literal["NOMINAL", "ELEVATED", "HIGH"] = "NOMINAL"
    active_fault: Optional[str] = None
    affected_cylinders: List[int] = Field(default_factory=list)
    twin_sync_status: Literal["SYNCED", "DELAYED", "DISCONNECTED"] = "SYNCED"
    last_sync_timestamp: str = ""
    model_version: str = "DT-AERO-PHYSICS-v1.4.2"


class ResidualsData(BaseModel):
    timestamp: str
    mission_id: str
    frame_id: int
    model_version: str
    expected: Dict[str, float]
    actual: Dict[str, float]
    residuals: Dict[str, float]
    residual_score: float
    prediction_error_pct: float


class DummyAIDiagnostics(BaseModel):
    anomaly_detected: bool = False
    anomaly_score: float = 0.03  # 0.00 to 1.00
    primary_fault: str = "NONE"
    fault_type: Optional[str] = None
    confidence: float = 0.0      # 0 to 100%
    severity: Literal["NOMINAL", "INFO", "WARNING", "HIGH", "CRITICAL"] = "NOMINAL"
    degradation_status: Literal["NOMINAL", "SLIGHT", "MODERATE", "SEVERE"] = "NOMINAL"
    degradation_estimate: float = 0.05
    health_index: float = 93.0
    health_status: Literal["NOMINAL", "WARNING", "DEGRADED", "CRITICAL"] = "NOMINAL"
    rul_value: Optional[float] = 1240.0
    rul: Optional[float] = 1240.0
    rul_unit: str = "HOURS"
    rul_confidence: Optional[float] = 87.0
    rul_uncertainty: float = 15.0
    failure_risk_pct: float = 0.4
    evidence: List[str] = Field(default_factory=list)
    model_version: str = "AI-X4-DEV-DUMMY-v1.0"
    last_updated: str = ""


class ChannelQuality(BaseModel):
    overall_quality: Literal["GOOD", "DEGRADED", "INVALID"] = "GOOD"
    channel_quality: Dict[str, Literal["GOOD", "DEGRADED", "INVALID", "MISSING"]] = Field(
        default_factory=lambda: {
            "rpm": "GOOD",
            "map": "GOOD",
            "cht_c1": "GOOD",
            "cht_c2": "GOOD",
            "cht_c3": "GOOD",
            "cht_c4": "GOOD",
            "egt_c1": "GOOD",
            "egt_c2": "GOOD",
            "egt_c3": "GOOD",
            "egt_c4": "GOOD",
            "oil_pressure": "GOOD",
            "oil_temperature": "GOOD",
            "fuel_flow": "GOOD",
            "vibration": "GOOD",
            "battery_voltage": "GOOD",
            "alternator_current": "GOOD"
        }
    )


class ScenarioDefinition(BaseModel):
    id: str
    scenario_id: str
    mission_id: str
    scenario_type: Literal["normal", "fault", "degradation", "sensor_fault", "environment", "mission", "combined"]
    name: str
    description: str
    severity: Literal["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
    affected_component: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    duration_s: float = 60.0
    active: bool = False


class ScenarioEvent(BaseModel):
    event_id: str
    scenario_id: str
    mission_id: str
    timestamp: str
    event_type: str
    component: str
    severity: Literal["INFO", "LOW", "MEDIUM", "WARNING", "HIGH", "CRITICAL"]
    status: Literal["TRIGGERED", "RAMP_UP", "ACTIVE", "PEAK", "RECOVERING", "RESOLVED"]


class MaintenanceAdvisory(BaseModel):
    timestamp: str
    mission_id: str
    advisory_type: str
    severity: Literal["INFO", "LOW", "MEDIUM", "WARNING", "HIGH", "CRITICAL"]
    reason: str
    recommended_action: str
    confidence: float
    related_fault_type: Optional[str] = None
    related_event_id: Optional[str] = None


class LiveStreamFrame(BaseModel):
    """Unified WebSocket streaming payload matching dashboard consumption."""
    telemetry: CanonicalTelemetry
    flight_context: FlightContext
    health: HealthState
    twin_state: TwinVisualizationState
    twin_analysis: ResidualsData
    diagnostics: DummyAIDiagnostics
    quality: ChannelQuality
    active_scenario: Optional[ScenarioDefinition] = None
    latest_event: Optional[ScenarioEvent] = None
    advisories: List[MaintenanceAdvisory] = Field(default_factory=list)
    system_status: Dict[str, str] = Field(
        default_factory=lambda: {
            "ecu": "ONLINE",
            "can_bus": "CONNECTED",
            "sensors": "NORMAL",
            "source": "SIMULATION"
        }
    )
