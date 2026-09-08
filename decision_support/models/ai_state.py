"""
AI State Model
Machine Learning anomaly detection, classification, and RUL inputs.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List


class AIState(BaseModel):
    anomaly_score: float = Field(default=0.0, ge=0.0, le=1.0, description="ML Anomaly magnitude [0, 1]")
    anomaly_flag: bool = Field(default=False)
    anomaly_confidence: float = Field(default=0.9, ge=0.0, le=1.0)

    ml_fault_code: Optional[int] = Field(default=0, ge=0, le=8)
    ml_fault_probabilities: Optional[Dict[str, float]] = Field(default_factory=dict)
    ml_fault_confidence: float = Field(default=0.8, ge=0.0, le=1.0)

    predicted_degradation: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
    predicted_degradation_rate: Optional[float] = Field(default=0.0, ge=0.0)

    ml_rul_hours: Optional[float] = Field(default=1000.0, ge=0.0)
    ml_rul_confidence: float = Field(default=0.8, ge=0.0, le=1.0)

    model_version: str = Field(default="AI-X4-v1.0.0")
    feature_version: str = Field(default="FEAT-v1.0.0")
    inference_timestamp: Optional[str] = None

    @field_validator(
        "anomaly_score", "anomaly_confidence", "ml_fault_confidence", "ml_rul_confidence", mode="before"
    )
    @classmethod
    def normalize_pct(cls, v: Optional[float]) -> float:
        if v is None:
            return 0.8
        if v > 1.0:
            return min(1.0, max(0.0, v / 100.0))
        return min(1.0, max(0.0, v))
