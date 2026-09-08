"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Temporal Dynamics & Rolling History Feature Buffer
"""

from collections import deque
from typing import Dict, List, Optional
import numpy as np


class TemporalFeatureBuffer:
    """
    Maintains a rolling time-series window of recent frames to calculate:
    - Moving averages
    - Moving standard deviations
    - Derivatives / slopes (rate of change over time)
    """

    def __init__(self, window_size: int = 8):
        self.window_size = window_size
        self.history: deque = deque(maxlen=window_size)

    def reset(self):
        """Clear the temporal buffer (e.g., when a new mission starts)."""
        self.history.clear()

    def update(self, snapshot: Dict[str, float]) -> Dict[str, float]:
        """
        Appends current frame snapshot and computes dynamic temporal features.
        """
        self.history.append(snapshot)

        if len(self.history) < 2:
            return {
                "egt_slope": 0.0,
                "cht_slope": 0.0,
                "oil_p_slope": 0.0,
                "oil_t_slope": 0.0,
                "vibration_slope": 0.0,
                "residual_score_rolling_mean": snapshot.get("residual_score", 0.0),
                "residual_score_slope": 0.0,
                "vibration_rolling_std": 0.0,
            }

        # Extract time series arrays
        times = [f.get("timestamp", idx * 0.5) for idx, f in enumerate(self.history)]
        dt_total = max(0.1, times[-1] - times[0])

        egt_means = [f.get("egt_mean", 0.0) for f in self.history]
        cht_means = [f.get("cht_mean", 0.0) for f in self.history]
        oil_ps = [f.get("oil_pressure", 0.0) for f in self.history]
        oil_ts = [f.get("oil_temperature", 0.0) for f in self.history]
        vibs = [f.get("vibration", 0.0) for f in self.history]
        res_scores = [f.get("residual_score", 0.0) for f in self.history]

        # First-order finite difference slope: (val[-1] - val[0]) / dt
        egt_slope = (egt_means[-1] - egt_means[0]) / dt_total
        cht_slope = (cht_means[-1] - cht_means[0]) / dt_total
        oil_p_slope = (oil_ps[-1] - oil_ps[0]) / dt_total
        oil_t_slope = (oil_ts[-1] - oil_ts[0]) / dt_total
        vib_slope = (vibs[-1] - vibs[0]) / dt_total
        res_slope = (res_scores[-1] - res_scores[0]) / dt_total

        return {
            "egt_slope": round(float(egt_slope), 4),
            "cht_slope": round(float(cht_slope), 4),
            "oil_p_slope": round(float(oil_p_slope), 4),
            "oil_t_slope": round(float(oil_t_slope), 4),
            "vibration_slope": round(float(vib_slope), 4),
            "residual_score_rolling_mean": round(float(np.mean(res_scores)), 4),
            "residual_score_slope": round(float(res_slope), 4),
            "vibration_rolling_std": round(float(np.std(vibs)), 4),
        }
