from typing import Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict
import json


class ChannelQuality(BaseModel):
    """Quality status for an individual telemetry channel."""
    valid: bool = True
    state: str = "good"  # "good" | "degraded" | "invalid" | "missing"
    reason: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class TelemetryQuality(BaseModel):
    """Aggregated quality assessment conforming to Common Data Schemas Section 7."""
    overall_quality: str = "good"  # "good" | "degraded" | "invalid" | "missing"
    channel_quality: dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[float] = None

    model_config = ConfigDict(extra="ignore")

    def to_dict(self) -> dict:
        return self.model_dump()


class CanonicalTelemetry(BaseModel):
    """
    Canonical Telemetry representation conforming to Common Data Schemas Section 5.
    Canonical Units:
      rpm: rev/min
      map: kPa
      cht: °C (per cylinder, 4 cylinders)
      egt: °C (per cylinder, 4 cylinders)
      oil_pressure: bar
      oil_temperature: °C
      fuel_flow: L/h
      vibration: g
      battery_voltage: V
      alternator_current: A
      injection_timing: °BTDC
    """
    schema_version: str = "0.1"
    timestamp: float
    mission_id: str = "MISSION-001"
    frame_id: int
    source: str = "synthetic"

    rpm: Optional[float] = None
    map: float
    cht: List[float]
    egt: List[float]

    oil_pressure: float
    oil_temperature: float
    fuel_flow: float
    vibration: float

    battery_voltage: float
    alternator_current: float
    injection_timing: float

    model_config = ConfigDict(extra="ignore")

    def to_dict(self) -> dict:
        """Fast dictionary conversion."""
        return self.model_dump()

    def to_json(self) -> str:
        """JSON serialization for WebSocket / REST."""
        return self.model_dump_json()


class ProcessedTelemetry(BaseModel):
    """
    Unified container pairing CanonicalTelemetry with its TelemetryQuality assessment.
    Conforms to End-to-End Data Contract Section 26.
    """
    telemetry: CanonicalTelemetry
    quality: TelemetryQuality

    model_config = ConfigDict(extra="ignore")

    def to_dict(self) -> dict:
        return {
            "telemetry": self.telemetry.model_dump(),
            "quality": self.quality.model_dump()
        }

    def to_json(self) -> str:
        return self.model_dump_json()
