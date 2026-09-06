"""
Decision Input Wrapper
Combines all standardized state inputs into a single DecisionInput object.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .engine_state import EngineState
from .fault_state import FaultState
from .degradation_state import DegradationState
from .rul_state import RULState
from .mission_state import MissionState, EnvironmentState
from .ai_state import AIState


class DecisionInput(BaseModel):
    timestamp: Optional[str] = Field(default=None)
    engine: EngineState
    fault: FaultState = Field(default_factory=FaultState)
    degradation: DegradationState = Field(default_factory=DegradationState)
    rul: RULState = Field(default_factory=RULState)
    mission: MissionState = Field(default_factory=MissionState)
    environment: EnvironmentState = Field(default_factory=EnvironmentState)
    ai: AIState = Field(default_factory=AIState)
    metadata: Dict[str, Any] = Field(default_factory=dict)
