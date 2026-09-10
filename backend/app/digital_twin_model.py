"""
Digital Twin State Estimation & Residual Calculation
Calculates nominal physics expected states and computes dynamic residuals:
residual = actual - expected
"""
import math
from typing import Dict, List
from datetime import datetime, timezone

from .config import GeneratorConfig, DEFAULT_CONFIG
from .models import CanonicalTelemetry, ResidualsData, TwinVisualizationState


class DigitalTwinModel:
    def __init__(self, config: GeneratorConfig = DEFAULT_CONFIG):
        self.config = config
        self.model_version = config.model_version

    def compute_expected_state(self, telemetry: CanonicalTelemetry, operating_state: str) -> Dict[str, float]:
        """Physics nominal mathematical expectation given operating state and current RPM demand."""
        cfg = self.config.operating_states.get(operating_state, self.config.operating_states["CRUISE"])

        # Baseline expected values based on nominal flight envelope curves
        expected = {
            "rpm": cfg.target_rpm,
            "map": cfg.map_bar,
            "cht_c1": cfg.cht_base_c - 1.5,
            "cht_c2": cfg.cht_base_c + 2.2,
            "cht_c3": cfg.cht_base_c + 1.8,
            "cht_c4": cfg.cht_base_c - 2.5,
            "egt_c1": cfg.egt_base_c - 4.0,
            "egt_c2": cfg.egt_base_c + 5.5,
            "egt_c3": cfg.egt_base_c + 3.0,
            "egt_c4": cfg.egt_base_c - 4.5,
            "oil_pressure": cfg.oil_press_bar,
            "oil_temperature": cfg.oil_temp_c,
            "fuel_flow": cfg.fuel_flow_lh,
            "vibration": cfg.vibration_mms,
            "battery_voltage": cfg.battery_volt,
            "alternator_current": cfg.alternator_curr_a
        }
        return expected

    def evaluate_residuals(
        self,
        telemetry: CanonicalTelemetry,
        operating_state: str
    ) -> ResidualsData:
        expected = self.compute_expected_state(telemetry, operating_state)

        actual = {
            "rpm": telemetry.rpm,
            "map": telemetry.map,
            "cht_c1": telemetry.cht[0] if len(telemetry.cht) > 0 else 0.0,
            "cht_c2": telemetry.cht[1] if len(telemetry.cht) > 1 else 0.0,
            "cht_c3": telemetry.cht[2] if len(telemetry.cht) > 2 else 0.0,
            "cht_c4": telemetry.cht[3] if len(telemetry.cht) > 3 else 0.0,
            "egt_c1": telemetry.egt[0] if len(telemetry.egt) > 0 else 0.0,
            "egt_c2": telemetry.egt[1] if len(telemetry.egt) > 1 else 0.0,
            "egt_c3": telemetry.egt[2] if len(telemetry.egt) > 2 else 0.0,
            "egt_c4": telemetry.egt[3] if len(telemetry.egt) > 3 else 0.0,
            "oil_pressure": telemetry.oil_pressure,
            "oil_temperature": telemetry.oil_temperature,
            "fuel_flow": telemetry.fuel_flow,
            "vibration": telemetry.vibration,
            "battery_voltage": telemetry.battery_voltage,
            "alternator_current": telemetry.alternator_current
        }

        # Calculate residual = actual - expected
        residuals: Dict[str, float] = {}
        squared_normalized_errors = []

        # Normalization weights for residual score calculation
        scales = {
            "rpm": 150.0,
            "map": 0.15,
            "cht_c1": 15.0, "cht_c2": 15.0, "cht_c3": 15.0, "cht_c4": 15.0,
            "egt_c1": 35.0, "egt_c2": 35.0, "egt_c3": 35.0, "egt_c4": 35.0,
            "oil_pressure": 0.8,
            "oil_temperature": 12.0,
            "fuel_flow": 4.0,
            "vibration": 1.5,
            "battery_voltage": 1.5,
            "alternator_current": 10.0
        }

        for key, act_val in actual.items():
            exp_val = expected.get(key, act_val)
            delta = round(act_val - exp_val, 2)
            residuals[key] = delta

            norm_scale = scales.get(key, 10.0)
            norm_err = delta / norm_scale
            squared_normalized_errors.append(norm_err ** 2)

        # Root Mean Square of normalized errors
        rms_norm_error = math.sqrt(sum(squared_normalized_errors) / max(1, len(squared_normalized_errors)))
        residual_score = min(1.0, round(rms_norm_error * 0.4, 3))
        prediction_error_pct = round(rms_norm_error * 2.8, 1)

        return ResidualsData(
            timestamp=telemetry.timestamp,
            mission_id=telemetry.mission_id,
            frame_id=telemetry.frame_id,
            model_version=self.model_version,
            expected=expected,
            actual=actual,
            residuals=residuals,
            residual_score=residual_score,
            prediction_error_pct=prediction_error_pct
        )
