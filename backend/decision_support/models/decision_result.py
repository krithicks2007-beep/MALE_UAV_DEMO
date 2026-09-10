"""
Decision Result Schema
Defines the final response object containing both full diagnostic details and the user-specified Output Schema.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal, Any


# User-Specified Explicit Output Schemas
class DecisionSummary(BaseModel):
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    risk_score: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)


class FaultAssessment(BaseModel):
    status: Literal["NORMAL", "WARNING", "CRITICAL"]
    severity: float = Field(..., ge=0.0, le=1.0)
    primary_fault: Optional[str] = None


class DegradationAssessment(BaseModel):
    status: Literal["NORMAL", "DEGRADING", "CRITICAL"]
    overall_degradation: float = Field(..., ge=0.0, le=1.0)
    trend: Literal["STABLE", "INCREASING", "RAPIDLY_INCREASING", "DECREASING"]


class RULAssessment(BaseModel):
    rul_hours: Optional[float] = None
    status: Literal["NORMAL", "PLANNING", "HIGH_PRIORITY", "CRITICAL"]
    confidence: float = Field(..., ge=0.0, le=1.0)


class MissionAssessment(BaseModel):
    mission_risk: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    mission_go: bool


class MaintenanceAdvisoryResult(BaseModel):
    priority: Literal["ROUTINE", "PLANNED", "HIGH", "IMMEDIATE"]
    recommendation: str


class OperationalAdvisoryResult(BaseModel):
    recommendation: str


class FusionResult(BaseModel):
    physics_fault: Optional[str] = None
    ai_fault: Optional[str] = None
    agreement: bool = True
    diagnostic_conflict: bool = False
    explanation: str = ""


class DecisionResult(BaseModel):
    timestamp: str
    schema_version: str = "1.0.0"
    decision_engine_version: str = "0.1.0"
    rules_version: str = "0.1.0"

    # User Output Schema (Explicit User Request)
    decision: DecisionSummary
    fault_assessment: FaultAssessment
    degradation_assessment: DegradationAssessment
    rul_assessment: RULAssessment
    mission_assessment: MissionAssessment
    maintenance: MaintenanceAdvisoryResult
    operational: OperationalAdvisoryResult
    explanation: List[str] = Field(default_factory=list)

    # Detailed Sub-Engine Payloads
    fusion: Optional[FusionResult] = None
    detailed_scores: Optional[Dict[str, float]] = None
