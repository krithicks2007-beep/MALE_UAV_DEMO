"""
Mission rules & environment stress factors loader
"""
import os
import yaml
from typing import Dict, Any

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "mission_rules.yaml")


def load_mission_config() -> Dict[str, Any]:
    if os.path.exists(_CONFIG_PATH):
        with open(_CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    return {
        "environment": {"high_altitude_m": 5000.0, "hot_weather_temp_k": 308.15},
        "mission": {"long_endurance_seconds": 14400, "high_load_threshold": 0.80},
    }
