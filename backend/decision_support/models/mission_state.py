"""
Mission & Environment State Model
Operational context and environmental stressors.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal


class MissionState(BaseModel):
    mission_id: str = Field(default="MALE-MSN-2026-001")
    mission_phase: Literal[
        "TAKEOFF", "CLIMB", "CRUISE", "SURVEILLANCE", "ENDURANCE", "DESCENT", "LANDING"
    ] = Field(default="CRUISE")
    mission_elapsed_seconds: float = Field(default=3600.0, ge=0.0)
    mission_remaining_seconds: float = Field(default=7200.0, ge=0.0)
    mission_duration_seconds: float = Field(default=10800.0, ge=0.0)
    altitude_m: float = Field(default=3000.0, ge=0.0)
    target_altitude_m: Optional[float] = Field(default=3000.0)
    mission_load: float = Field(default=0.75, ge=0.0, le=1.0)
    throttle: float = Field(default=0.75, ge=0.0, le=1.0)

    # Environmental / stress flags
    high_altitude: bool = False
    hot_weather: bool = False
    endurance: bool = False
    rapid_throttle: bool = False
    combined_stress: bool = False


class EnvironmentState(BaseModel):
    ambient_temperature: float = Field(default=288.15, description="Ambient temperature in Kelvin")
    ambient_pressure: float = Field(default=101325.0, description="Ambient pressure in Pa")
    altitude_m: float = Field(default=3000.0, ge=0.0)
    humidity: Optional[float] = Field(default=0.5)
    wind_speed: Optional[float] = Field(default=5.0)
    wind_direction: Optional[float] = Field(default=0.0)
