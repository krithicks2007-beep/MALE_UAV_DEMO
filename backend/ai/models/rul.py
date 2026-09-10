"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Remaining Useful Life (RUL) & Uncertainty Quantification Model
Spec: MVP v0.1 | Model Version: ai-v0.1
Outputs: rul (operating_hours), rul_unit ("operating_hours"), rul_uncertainty (± hours)
"""

from typing import Dict, Any, Optional, Tuple, List
import numpy as np


class RULEstimator:
    """
    Predicts Remaining Useful Life (RUL) in operating hours and estimates
    uncertainty bounds (± hours) using degradation trajectory regression.
    """

    def __init__(
        self,
        nominal_useful_life_hours: float = 100.0,
        base_uncertainty_hours: float = 4.0,
        model_version: str = "ai-v0.1"
    ):
        self.nominal_useful_life_hours = nominal_useful_life_hours
        self.base_uncertainty_hours = base_uncertainty_hours
        self.model_version = model_version
        self.slope_coefficient: float = -100.0
        self.intercept: float = 100.0
        self.is_trained: bool = False

    def train(self, trajectory_data: List[Dict[str, Any]]):
        """
        Fits degradation-to-RUL linear/polynomial regression parameters.
        Each sample contains: features, degradation_progress, true_rul_hours.
        """
        if not trajectory_data:
            return

        degradations = []
        ruls = []

        for sample in trajectory_data:
            deg = sample.get("ground_truth", {}).get("degradation_progress", 0.0)
            rul = sample.get("ground_truth", {}).get("true_rul_hours", 100.0)
            degradations.append(deg)
            ruls.append(rul)

        if len(degradations) > 2:
            poly = np.polyfit(degradations, ruls, deg=1)
            self.slope_coefficient = float(poly[0])
            self.intercept = float(poly[1])
            self.is_trained = True

    def predict(
        self,
        degradation_estimate: float,
        features: Optional[Dict[str, float]] = None,
        anomaly_score: float = 0.0
    ) -> Tuple[float, str, float]:
        """
        Computes RUL prediction and uncertainty interval.
        Returns:
            (rul: float, rul_unit: str, rul_uncertainty: float)
        """
        # Linear degradation projection: RUL = Intercept + Slope * Degradation
        deg = min(1.0, max(0.0, degradation_estimate))

        if self.is_trained:
            pred_rul = self.intercept + (self.slope_coefficient * deg)
        else:
            # Nominal analytical degradation curve
            pred_rul = self.nominal_useful_life_hours * (1.0 - deg)

        # Severe anomalies accelerate useful life consumption
        if anomaly_score > 0.7:
            pred_rul *= (1.0 - 0.25 * anomaly_score)

        pred_rul = max(0.0, pred_rul)
        pred_rul = round(float(pred_rul), 1)

        # Uncertainty Quantification (UQ):
        # Uncertainty is higher when degradation is low/early stage and narrows as end-of-life approaches,
        # plus volatility penalty if anomaly score is elevated.
        unc = self.base_uncertainty_hours + (3.0 * (1.0 - deg)) + (2.5 * anomaly_score)
        rul_uncertainty = round(float(unc), 1)

        return pred_rul, "operating_hours", rul_uncertainty

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nominal_useful_life_hours": self.nominal_useful_life_hours,
            "base_uncertainty_hours": self.base_uncertainty_hours,
            "slope_coefficient": self.slope_coefficient,
            "intercept": self.intercept,
            "model_version": self.model_version,
            "is_trained": self.is_trained
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RULEstimator":
        model = cls(
            nominal_useful_life_hours=float(data.get("nominal_useful_life_hours", 100.0)),
            base_uncertainty_hours=float(data.get("base_uncertainty_hours", 4.0)),
            model_version=str(data.get("model_version", "ai-v0.1"))
        )
        model.slope_coefficient = float(data.get("slope_coefficient", -100.0))
        model.intercept = float(data.get("intercept", 100.0))
        model.is_trained = bool(data.get("is_trained", False))
        return model
