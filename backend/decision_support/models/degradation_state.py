"""
Degradation State Model
Subsystem degradation tracking normalized to [0, 1] and trend rate.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class DegradationState(BaseModel):
    thermal_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    lubrication_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    combustion_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    mechanical_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    electrical_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    overall_degradation: float = Field(default=0.0, ge=0.0, le=1.0)
    degradation_rate: float = Field(default=0.0, ge=0.0, description="Normalized degradation rate per second")

    previous_overall_degradation: Optional[float] = None
    previous_rate: Optional[float] = None
    trend_window: Optional[float] = Field(default=60.0, description="Window size in seconds")

    @field_validator(
        "thermal_degradation",
        "lubrication_degradation",
        "combustion_degradation",
        "mechanical_degradation",
        "electrical_degradation",
        "overall_degradation",
        mode="before",
    )
    @classmethod
    def normalize_pct(cls, v: Optional[float]) -> float:
        if v is None:
            return 0.0
        if v > 1.0:
            return min(1.0, max(0.0, v / 100.0))
        return min(1.0, max(0.0, v))
