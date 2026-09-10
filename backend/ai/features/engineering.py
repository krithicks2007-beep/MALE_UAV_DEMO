"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Comprehensive Feature Engineering Pipeline
Spec: MVP v0.1 | Feature Version: features-v0.1
"""

from typing import Dict, Any, Optional, Union
from ..data.schemas import CanonicalTelemetry, TwinResiduals, TelemetryQuality, AIFeatures
from .statistics import compute_cylinder_statistics, compute_operating_state_features
from .residuals import extract_residual_features
from .temporal import TemporalFeatureBuffer


class FeatureExtractor:
    """
    Main Feature Extraction Pipeline.
    Combines canonical telemetry, digital twin residuals, and temporal history.
    """

    def __init__(self, window_size: int = 8, feature_version: str = "features-v0.1"):
        self.feature_version = feature_version
        self.temporal_buffer = TemporalFeatureBuffer(window_size=window_size)
        self.last_mission_id: Optional[str] = None

    def extract_features(
        self,
        telemetry: Union[CanonicalTelemetry, Dict[str, Any]],
        residuals: Optional[Union[TwinResiduals, Dict[str, Any]]] = None,
        quality: Optional[Union[TelemetryQuality, Dict[str, Any]]] = None
    ) -> AIFeatures:
        """
        Extracts full standardized feature dictionary from incoming frame.
        """
        if isinstance(telemetry, dict):
            tel = CanonicalTelemetry.from_dict(telemetry)
        else:
            tel = telemetry

        # Auto-reset buffer when switching missions
        if self.last_mission_id is not None and self.last_mission_id != tel.mission_id:
            self.temporal_buffer.reset()
        self.last_mission_id = tel.mission_id

        # 1. Cylinder & telemetry statistics
        cht_stats = compute_cylinder_statistics(tel.cht, prefix="cht")
        egt_stats = compute_cylinder_statistics(tel.egt, prefix="egt")
        op_features = compute_operating_state_features(tel.rpm, tel.map)

        # 2. Physics Residual features
        res_dict = None
        if residuals is not None:
            if isinstance(residuals, dict):
                res_dict = residuals.get("residuals", residuals)
            elif isinstance(residuals, TwinResiduals):
                res_dict = residuals.residuals
        res_features = extract_residual_features(res_dict)

        # 3. Temporal Snapshot for moving buffer
        snapshot = {
            "timestamp": tel.timestamp,
            "rpm": tel.rpm,
            "map": tel.map,
            "cht_mean": cht_stats["cht_mean"],
            "egt_mean": egt_stats["egt_mean"],
            "oil_pressure": tel.oil_pressure,
            "oil_temperature": tel.oil_temperature,
            "vibration": tel.vibration,
            "residual_score": res_features["residual_score"]
        }
        temporal_features = self.temporal_buffer.update(snapshot)

        # 4. Consolidated Feature Map
        combined_features: Dict[str, float] = {
            # Raw Telemetry Essentials
            "rpm": round(tel.rpm, 1),
            "map": round(tel.map, 2),
            "oil_pressure": round(tel.oil_pressure, 3),
            "oil_temperature": round(tel.oil_temperature, 2),
            "fuel_flow": round(tel.fuel_flow, 2),
            "vibration": round(tel.vibration, 4),
            "battery_voltage": round(tel.battery_voltage, 2),
            "alternator_current": round(tel.alternator_current, 2),
            "injection_timing": round(tel.injection_timing, 2),

            # Cylinder Thermal Balances
            **cht_stats,
            **egt_stats,

            # Physics-Informed Residuals
            **res_features,

            # Dynamics & Slopes
            **temporal_features,

            # Operating Context
            **op_features,
        }

        return AIFeatures(
            timestamp=tel.timestamp,
            mission_id=tel.mission_id,
            frame_id=tel.frame_id,
            features=combined_features,
            feature_version=self.feature_version
        )
