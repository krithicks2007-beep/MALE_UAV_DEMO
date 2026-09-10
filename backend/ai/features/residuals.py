"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Physics Residual Feature Processing
Residual = Actual - Expected (from Digital Twin Core)
"""

from typing import Dict, Any, Optional
import numpy as np
from ..data.schemas import TwinResiduals


def extract_residual_features(residuals: Optional[Dict[str, float]]) -> Dict[str, float]:
    """
    Extracts physics-deviation features from Digital Twin residuals.
    """
    if not residuals:
        return {
            "egt_residual_mean": 0.0,
            "egt_residual_max": 0.0,
            "cht_residual_mean": 0.0,
            "oil_pressure_residual": 0.0,
            "oil_temp_residual": 0.0,
            "vibration_residual": 0.0,
            "residual_score": 0.0,
            "thermal_residual_deviation": 0.0
        }

    egt_res_mean = float(residuals.get("egt_residual_mean", 0.0))
    egt_res_max = float(residuals.get("egt_residual_max", 0.0))
    cht_res_mean = float(residuals.get("cht_residual_mean", 0.0))
    oil_p_res = float(residuals.get("oil_pressure_residual", 0.0))
    oil_t_res = float(residuals.get("oil_temp_residual", 0.0))
    vib_res = float(residuals.get("vibration_residual", 0.0))
    res_score = float(residuals.get("residual_score", 0.0))

    # Combined thermo-mechanical deviation index
    thermal_dev = abs(egt_res_mean / 40.0) + abs(cht_res_mean / 15.0)

    return {
        "egt_residual_mean": round(egt_res_mean, 3),
        "egt_residual_max": round(egt_res_max, 3),
        "cht_residual_mean": round(cht_res_mean, 3),
        "oil_pressure_residual": round(oil_p_res, 3),
        "oil_temp_residual": round(oil_t_res, 3),
        "vibration_residual": round(vib_res, 3),
        "residual_score": round(res_score, 3),
        "thermal_residual_deviation": round(float(thermal_dev), 3)
    }
