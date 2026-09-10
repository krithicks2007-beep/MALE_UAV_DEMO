"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Statistical Feature Extraction (Per-Cylinder and Aggregate Moments)
"""

from typing import List, Dict
import numpy as np


def compute_cylinder_statistics(values: List[float], prefix: str) -> Dict[str, float]:
    """
    Computes statistical moments and inter-cylinder balance/spread metrics.
    Filters out invalid/missing negative sentinel values (e.g. -999.0).
    """
    valid_vals = [float(v) for v in values if v > -50.0]
    if not valid_vals:
        return {
            f"{prefix}_mean": 0.0,
            f"{prefix}_std": 0.0,
            f"{prefix}_spread": 0.0,
            f"{prefix}_max": 0.0,
            f"{prefix}_min": 0.0,
        }

    mean_val = float(np.mean(valid_vals))
    std_val = float(np.std(valid_vals)) if len(valid_vals) > 1 else 0.0
    max_val = float(np.max(valid_vals))
    min_val = float(np.min(valid_vals))
    spread_val = max_val - min_val

    return {
        f"{prefix}_mean": round(mean_val, 3),
        f"{prefix}_std": round(std_val, 3),
        f"{prefix}_spread": round(spread_val, 3),
        f"{prefix}_max": round(max_val, 3),
        f"{prefix}_min": round(min_val, 3),
    }


def compute_operating_state_features(rpm: float, map_kpa: float) -> Dict[str, float]:
    """
    Extracts operational context and normalized engine load.
    """
    load_factor = (rpm / 5500.0) * (map_kpa / 100.0)
    return {
        "engine_load_factor": round(float(load_factor), 4),
        "is_idle": 1.0 if rpm < 2500.0 else 0.0,
        "is_high_power": 1.0 if (rpm > 5000.0 and map_kpa > 90.0) else 0.0
    }
