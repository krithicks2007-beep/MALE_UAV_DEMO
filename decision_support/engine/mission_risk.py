"""
Mission Risk Engine
Evaluates environmental stressors, altitude, temperature, load, and phase risk.
Outputs mission_risk (LOW | MODERATE | HIGH | CRITICAL) and mission_go (boolean).
"""
from typing import Dict, Any, List
from ..models.mission_state import MissionState, EnvironmentState
from ..models.engine_state import EngineState
from ..models.fault_state import FaultState
from ..models.degradation_state import DegradationState
from ..rules.mission_rules import load_mission_config


class MissionRiskEngine:
    def __init__(self):
        cfg = load_mission_config()
        self.env_cfg = cfg.get("environment", {})
        self.mission_cfg = cfg.get("mission", {})

    def evaluate(
        self,
        mission: MissionState,
        env: EnvironmentState,
        engine: EngineState,
        fault: FaultState,
        degradation: DegradationState,
    ) -> Dict[str, Any]:
        stressors: List[str] = []
        risk_score = 0.1  # baseline

        # Environmental stressors
        alt = max(mission.altitude_m, env.altitude_m)
        if alt >= self.env_cfg.get("high_altitude_m", 5000.0) or mission.high_altitude:
            stressors.append("HIGH_ALTITUDE")
            risk_score += 0.2

        if env.ambient_temperature >= self.env_cfg.get("hot_weather_temp_k", 308.15) or mission.hot_weather:
            stressors.append("HOT_WEATHER")
            risk_score += 0.25

        if mission.mission_duration_seconds >= self.mission_cfg.get("long_endurance_seconds", 14400) or mission.endurance:
            stressors.append("ENDURANCE")
            risk_score += 0.15

        if mission.rapid_throttle:
            stressors.append("RAPID_THROTTLE")
            risk_score += 0.15

        if engine.engine_load >= self.mission_cfg.get("high_load_threshold", 0.80) or mission.mission_load >= 0.80:
            stressors.append("HIGH_LOAD")
            risk_score += 0.15

        if len(stressors) >= 2 or mission.combined_stress:
            stressors.append("COMBINED_STRESS")
            risk_score *= 1.3

        # Active engine fault or degradation impact on mission
        if fault.active and fault.severity > 0.5:
            risk_score += 0.3
        if degradation.overall_degradation > 0.3:
            risk_score += 0.25

        risk_score = min(1.0, risk_score)

        if risk_score >= 0.75:
            mission_risk = "CRITICAL"
            mission_go = False
        elif risk_score >= 0.50:
            mission_risk = "HIGH"
            mission_go = False if (fault.active and fault.severity >= 0.7) else True
        elif risk_score >= 0.30:
            mission_risk = "MODERATE"
            mission_go = True
        else:
            mission_risk = "LOW"
            mission_go = True

        return {
            "mission_risk": mission_risk,
            "mission_go": mission_go,
            "risk_score": risk_score,
            "stressors": stressors,
        }
