"""
Engine State Model
Pydantic validation for standardized telemetry, expected values, residuals, and z-scores.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict


class EngineState(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    rpm: float = Field(..., ge=0.0, description="Engine speed in rev/min")
    cht: List[float] = Field(..., description="Cylinder Head Temps [C1..C4] in °C")
    egt: List[float] = Field(..., description="Exhaust Gas Temps [C1..C4] in °C")
    oil_pressure: float = Field(..., ge=0.0, description="Oil pressure in bar or Pa")
    oil_temperature: float = Field(..., description="Oil temperature in °C")
    fuel_flow: float = Field(..., ge=0.0, description="Fuel flow measurement")
    vibration: float = Field(..., ge=0.0, description="Engine vibration magnitude")
    battery_voltage: float = Field(..., ge=0.0, description="Electrical system voltage in V")
    alternator_current: float = Field(..., description="Alternator current output in A")
    injection_timing: float = Field(..., description="Fuel injection timing in °BTDC")
    engine_load: float = Field(default=0.8, ge=0.0, le=1.0, description="Normalized engine load [0, 1]")
    throttle: float = Field(default=0.8, ge=0.0, le=1.0, description="Normalized throttle position [0, 1]")
    health_index: float = Field(default=1.0, ge=0.0, le=1.0, description="Engine overall health index [0, 1]")

    # Optional expected physics values
    expected_cht: Optional[List[float]] = None
    expected_egt: Optional[List[float]] = None
    expected_oil_pressure: Optional[float] = None
    expected_oil_temperature: Optional[float] = None
    expected_fuel_flow: Optional[float] = None

    # Residuals (actual - expected)
    cht_residual: Optional[List[float]] = None
    egt_residual: Optional[List[float]] = None
    oil_pressure_residual: Optional[float] = None
    oil_temperature_residual: Optional[float] = None
    fuel_flow_residual: Optional[float] = None

    # Z-scores
    cht_z: Optional[List[float]] = None
    egt_z: Optional[List[float]] = None
    oil_pressure_z: Optional[float] = None
    oil_temperature_z: Optional[float] = None
    fuel_flow_z: Optional[float] = None

    @field_validator("health_index", "engine_load", "throttle", mode="before")
    @classmethod
    def clamp_normalized(cls, v: float) -> float:
        if v is None:
            return 1.0
        # If passed in percentage format (e.g. 93.0), normalize to [0, 1]
        if v > 1.0:
            return min(1.0, max(0.0, v / 100.0))
        return min(1.0, max(0.0, v))
