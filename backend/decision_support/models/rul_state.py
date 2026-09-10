"""
RUL State Model
Model-based Remaining Useful Life (RUL) estimation & uncertainty.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal


class RULState(BaseModel):
    rul_hours: Optional[float] = Field(default=1000.0, ge=0.0, description="Model-based RUL in operating hours")
    rul_normalized: Optional[float] = Field(default=1.0, ge=0.0, le=1.0, description="Normalized RUL [0, 1]")
    rul_confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="RUL prediction confidence [0, 1]")
    life_state: int = Field(
        default=1, ge=1, le=4, description="Prototype life state: 1=Normal, 2=Degraded, 3=Maintenance, 4=Critical"
    )

    @field_validator("rul_confidence", "rul_normalized", mode="before")
    @classmethod
    def normalize_pct(cls, v: Optional[float]) -> float:
        if v is None:
            return 1.0
        if v > 1.0:
            return min(1.0, max(0.0, v / 100.0))
        return min(1.0, max(0.0, v))
