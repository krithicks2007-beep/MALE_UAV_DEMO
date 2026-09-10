"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Anomaly Detection Model
Spec: MVP v0.1 | Model Version: ai-v0.1
Determines: NORMAL vs ABNORMAL, anomaly_score (0.0 to 1.0), and anomaly_detected
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np


class AnomalyDetector:
    """
    Multi-signal anomaly detector combining physics residual deviations,
    statistical mahalanobis distance, and temporal persistence filtering.
    """

    def __init__(
        self,
        threshold: float = 0.50,
        persistence_window: int = 3,
        model_version: str = "ai-v0.1"
    ):
        self.threshold = threshold
        self.persistence_window = persistence_window
        self.model_version = model_version
        self.recent_scores: List[float] = []
        self.baseline_stats: Dict[str, Dict[str, float]] = {}
        self.is_trained: bool = False

    def train(self, healthy_features: List[Dict[str, float]]):
        """
        Learns baseline distributions (mean, std) for key healthy operational parameters.
        """
        if not healthy_features:
            return

        tracked_keys = [
            "rpm", "map", "cht_mean", "cht_spread", "egt_mean", "egt_spread",
            "oil_pressure", "oil_temperature", "vibration",
            "residual_score", "thermal_residual_deviation"
        ]

        min_stds = {
            "rpm": 25.0,
            "map": 1.0,
            "cht_mean": 2.0,
            "cht_spread": 1.5,
            "egt_mean": 5.0,
            "egt_spread": 4.0,
            "oil_pressure": 0.15,
            "oil_temperature": 1.5,
            "vibration": 0.05,
            "residual_score": 0.3,
            "thermal_residual_deviation": 0.3,
        }

        self.baseline_stats = {}
        for key in tracked_keys:
            vals = [f[key] for f in healthy_features if key in f]
            if vals:
                mean_val = float(np.mean(vals))
                std_val = float(np.std(vals))
                floor_std = min_stds.get(key, 0.5)
                self.baseline_stats[key] = {
                    "mean": mean_val,
                    "std": max(std_val, floor_std)
                }

        self.is_trained = True

    def reset_state(self):
        """Reset temporal persistence buffer."""
        self.recent_scores.clear()

    def predict(
        self,
        features: Dict[str, float],
        quality_flags: Optional[List[str]] = None
    ) -> Tuple[bool, float, List[str]]:
        """
        Evaluates incoming feature dictionary.
        Returns:
            (anomaly_detected: bool, anomaly_score: float, evidence: List[str])
        """
        evidence = []
        z_scores = []

        # 1. Quality flag check (immediate sensor anomaly)
        if quality_flags:
            for qf in quality_flags:
                evidence.append(f"quality_flag_{qf}")

        # 2. Physics Residual Score contribution (authoritative signal from Digital Twin)
        residual_score = features.get("residual_score", 0.0)
        thermal_dev = features.get("thermal_residual_deviation", 0.0)

        if residual_score > 1.2:
            evidence.append(f"residual_score_high ({residual_score:.2f})")
        if thermal_dev > 1.0:
            evidence.append(f"thermal_residual_deviation_high ({thermal_dev:.2f})")

        # 3. Baseline Z-Score checks if trained
        if self.is_trained and self.baseline_stats:
            for key, stats in self.baseline_stats.items():
                if key in features:
                    val = features[key]
                    z = abs(val - stats["mean"]) / stats["std"]
                    z_scores.append(z)
                    if z > 2.5:
                        evidence.append(f"{key}_out_of_bounds (z={z:.1f})")

        # 4. Dynamic Slope / Vibration spikes
        vib_slope = abs(features.get("vibration_slope", 0.0))
        vib_val = features.get("vibration", 0.0)
        if vib_val > 0.60:
            evidence.append(f"high_vibration ({vib_val:.2f}g)")
        if vib_slope > 0.10:
            evidence.append(f"rapid_vibration_increase ({vib_slope:.3f}/s)")

        # 5. Synthesize composite anomaly metric using max-activation logic
        mean_z = float(np.mean(z_scores)) if z_scores else 0.0
        max_z = float(np.max(z_scores)) if z_scores else 0.0

        res_signal = min(1.0, residual_score / 1.5)
        z_signal = min(1.0, max_z / 2.8)
        vib_signal = min(1.0, max(0.0, (vib_val - 0.35) / 0.45))
        quality_signal = 1.0 if quality_flags else 0.0

        # Maximum deviation across physics, statistical, vibration, and quality domains
        raw_score = max(res_signal, z_signal, vib_signal, quality_signal)
        instant_score = min(1.0, max(0.0, raw_score))

        # 6. Temporal persistence filter
        self.recent_scores.append(instant_score)
        if len(self.recent_scores) > self.persistence_window:
            self.recent_scores.pop(0)

        smoothed_score = float(np.mean(self.recent_scores))
        smoothed_score = round(smoothed_score, 3)

        # Binary decision based on calibrated threshold
        anomaly_detected = bool(smoothed_score >= self.threshold)

        return anomaly_detected, smoothed_score, evidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "threshold": self.threshold,
            "persistence_window": self.persistence_window,
            "model_version": self.model_version,
            "baseline_stats": self.baseline_stats,
            "is_trained": self.is_trained
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AnomalyDetector":
        model = cls(
            threshold=float(data.get("threshold", 0.65)),
            persistence_window=int(data.get("persistence_window", 3)),
            model_version=str(data.get("model_version", "ai-v0.1"))
        )
        model.baseline_stats = data.get("baseline_stats", {})
        model.is_trained = bool(data.get("is_trained", False))
        return model
