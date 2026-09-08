"""
Fault State Model
Represents detected engine fault codes (0..8), severity, confidence, source, and evidence.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal


class FaultState(BaseModel):
    fault_code: int = Field(default=0, ge=0, le=8, description="Standard fault code 0..8")
    fault_name: str = Field(default="Healthy", description="Human-readable fault name")
    severity: float = Field(default=0.0, ge=0.0, le=1.0, description="Fault severity [0, 1]")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Fault classification confidence [0, 1]")
    evidence: Optional[float] = Field(default=0.0, ge=0.0, le=1.0, description="Supporting evidence strength [0, 1]")
    active: bool = Field(default=False, description="Whether fault is currently active")
    source: Literal["physics", "ai", "fused", "manual", "unknown"] = Field(
        default="physics", description="Origin of fault assessment"
    )

    @field_validator("severity", "confidence", "evidence", mode="before")
    @classmethod
    def normalize_pct(cls, v: Optional[float]) -> float:
        if v is None:
            return 0.0
        if v > 1.0:
            return min(1.0, max(0.0, v / 100.0))
        return min(1.0, max(0.0, v))
