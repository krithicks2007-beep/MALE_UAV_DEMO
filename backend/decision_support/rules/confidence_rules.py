"""
Confidence rules loader
"""
import os
import yaml
from typing import Dict, Any

_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "confidence_rules.yaml")


def load_confidence_config() -> Dict[str, Any]:
    if os.path.exists(_CONFIG_PATH):
        with open(_CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    return {
        "uncertainty_categories": {
            "LOW": {"min_confidence": 0.80, "label": "LOW_UNCERTAINTY"},
            "MODERATE": {"min_confidence": 0.50, "label": "MODERATE_UNCERTAINTY"},
            "HIGH": {"min_confidence": 0.00, "label": "HIGH_UNCERTAINTY"},
        }
    }
