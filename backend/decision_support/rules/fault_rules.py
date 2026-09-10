"""
Fault rules loader
Maps fault codes (0..8) to names, subsystem categories, and advisories.
"""
import os
import yaml
from typing import Dict, Any

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "fault_rules.yaml")


def load_fault_config() -> Dict[str, Any]:
    if os.path.exists(_CONFIG_PATH):
        with open(_CONFIG_PATH, "r") as f:
            return yaml.safe_load(f).get("faults", {})
    return {}


def get_fault_info(fault_code: int) -> Dict[str, Any]:
    cfg = load_fault_config()
    info = cfg.get(fault_code) or cfg.get(str(fault_code))
    if info:
        return info
    return {
        "name": f"Fault_{fault_code}",
        "subsystem": "UNKNOWN",
        "advisory": "Inspect relevant engine subsystem.",
        "operational": "Exercise caution during operation.",
    }
