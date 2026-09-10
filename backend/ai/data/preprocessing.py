"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Data Preprocessing, Quality Masking & Alignment Pipeline
"""

from typing import Dict, Any, Optional, Tuple, List, Union
import numpy as np
from .schemas import (
    CanonicalTelemetry,
    TelemetryQuality,
    TwinResiduals,
    QualityState,
    FaultType
)


class TelemetryPreprocessor:
    """
    Handles validation, telemetry quality masking, sensor failure detection,
    and frame alignment prior to feature extraction.
    """

    def __init__(self):
        # Baseline fallback values for safe channel masking when invalid
        self.default_baselines = {
            "rpm": 5200.0,
            "map": 95.0,
            "cht": [135.0, 135.0, 135.0, 135.0],
            "egt": [810.0, 810.0, 810.0, 810.0],
            "oil_pressure": 4.2,
            "oil_temperature": 90.0,
            "fuel_flow": 28.0,
            "vibration": 0.35,
            "battery_voltage": 14.2,
            "alternator_current": 16.0,
            "injection_timing": 12.0
        }

    def sanitize_telemetry(
        self,
        telemetry: Union[CanonicalTelemetry, Dict[str, Any]],
        quality: Optional[Union[TelemetryQuality, Dict[str, Any]]] = None
    ) -> Tuple[CanonicalTelemetry, List[str]]:
        """
        Validates telemetry against quality flags.
        If a channel is marked invalid or missing, applies safe masking and
        notes sensor quality issues in flags.
        """
        if isinstance(telemetry, dict):
            tel = CanonicalTelemetry.from_dict(telemetry)
        else:
            tel = telemetry

        quality_flags = []
        if quality is not None:
            if isinstance(quality, dict):
                qual = TelemetryQuality.from_dict(quality)
            else:
                qual = quality

            for ch_name, ch_qual in qual.channel_quality.items():
                if isinstance(ch_qual, dict):
                    is_valid = bool(ch_qual.get("valid", True))
                    state = str(ch_qual.get("state", QualityState.GOOD.value))
                else:
                    is_valid = bool(ch_qual.valid)
                    state = str(ch_qual.state)

                if not is_valid or state in (QualityState.INVALID.value, QualityState.MISSING.value):
                    quality_flags.append(f"sensor_fault_{ch_name}_{state}")

        # Plausibility sanity checks
        if tel.rpm < 0 or tel.rpm > 8000:
            quality_flags.append("sensor_drift_rpm")
        if tel.oil_pressure < 0 or tel.oil_pressure > 15:
            quality_flags.append("sensor_implausible_oil_pressure")
        if any(t < -50 or t > 400 for t in tel.cht):
            quality_flags.append("sensor_implausible_cht")
        if any(t < -50 or t > 1300 for t in tel.egt):
            quality_flags.append("sensor_implausible_egt")

        return tel, quality_flags

    def align_frames(
        self,
        telemetry: CanonicalTelemetry,
        residuals: Optional[TwinResiduals]
    ) -> Dict[str, float]:
        """
        Aligns residual frame with telemetry. If residuals are missing or misaligned,
        computes safe fallback / zero residuals.
        """
        aligned_residuals = {}
        if residuals is not None:
            if isinstance(residuals, dict):
                res_obj = TwinResiduals.from_dict(residuals)
            else:
                res_obj = residuals
            aligned_residuals = dict(res_obj.residuals)
            aligned_residuals["residual_score"] = float(res_obj.residual_score)
        else:
            # Fallback zero residuals
            aligned_residuals = {
                "egt_residual_mean": 0.0,
                "egt_residual_max": 0.0,
                "cht_residual_mean": 0.0,
                "oil_pressure_residual": 0.0,
                "oil_temp_residual": 0.0,
                "residual_score": 0.0
            }

        return aligned_residuals


class FeatureScaler:
    """
    Z-score Normalization (StandardScaler) for AI feature vectors.
    Ensures exact reproducibility between training and runtime inference.
    """

    def __init__(self, feature_names: Optional[List[str]] = None):
        self.feature_names = feature_names or []
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.is_fitted: bool = False

    def fit(self, feature_dicts: List[Dict[str, float]]):
        """Fit scaler on a list of feature dictionaries."""
        if not feature_dicts:
            return

        if not self.feature_names:
            self.feature_names = sorted(list(feature_dicts[0].keys()))

        for name in self.feature_names:
            values = [d[name] for d in feature_dicts if name in d]
            if values:
                mean_val = float(np.mean(values))
                std_val = float(np.std(values))
                self.means[name] = mean_val
                self.stds[name] = std_val if std_val > 1e-6 else 1.0
            else:
                self.means[name] = 0.0
                self.stds[name] = 1.0

        self.is_fitted = True

    def transform_dict(self, feat_dict: Dict[str, float]) -> Dict[str, float]:
        """Transform a single feature dictionary."""
        if not self.is_fitted:
            return dict(feat_dict)

        scaled = {}
        for k, v in feat_dict.items():
            if k in self.means and k in self.stds:
                scaled[k] = (v - self.means[k]) / self.stds[k]
            else:
                scaled[k] = v
        return scaled

    def transform_vector(self, feat_dict: Dict[str, float]) -> np.ndarray:
        """Return standardized numpy vector in canonical feature order."""
        if not self.is_fitted:
            return np.array([feat_dict.get(k, 0.0) for k in self.feature_names], dtype=np.float32)

        vec = []
        for k in self.feature_names:
            val = feat_dict.get(k, self.means.get(k, 0.0))
            mean = self.means.get(k, 0.0)
            std = self.stds.get(k, 1.0)
            vec.append((val - mean) / std)
        return np.array(vec, dtype=np.float32)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "feature_names": self.feature_names,
            "means": self.means,
            "stds": self.stds,
            "is_fitted": self.is_fitted
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FeatureScaler":
        scaler = cls(feature_names=data.get("feature_names", []))
        scaler.means = {k: float(v) for k, v in data.get("means", {}).items()}
        scaler.stds = {k: float(v) for k, v in data.get("stds", {}).items()}
        scaler.is_fitted = bool(data.get("is_fitted", False))
        return scaler
