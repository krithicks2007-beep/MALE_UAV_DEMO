"""
Advisory rules loader
"""
import os
import yaml
from typing import Dict, Any

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "advisory_rules.yaml")


def load_advisory_config() -> Dict[str, Any]:
    if os.path.exists(_CONFIG_PATH):
        with open(_CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    return {}
