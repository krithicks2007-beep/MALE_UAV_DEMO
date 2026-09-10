"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Training Pipeline for Remaining Useful Life (RUL) Regression
"""

import json
import os
from ..data.loaders import DataLoader
from ..models.rul import RULEstimator


def train_rul_model(output_path: str = None) -> RULEstimator:
    """
    Fits RUL degradation regression parameters on mission trajectories.
    """
    loader = DataLoader(seed=42)
    train_trajectories, _ = loader.load_rul_dataset()

    all_samples = []
    for traj in train_trajectories:
        all_samples.extend(traj)

    rul_model = RULEstimator(
        nominal_useful_life_hours=100.0,
        base_uncertainty_hours=4.0,
        model_version="ai-v0.1"
    )
    rul_model.train(all_samples)

    if output_path is None:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        output_dir = os.path.join(base_dir, "models", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "rul_model.json")

    with open(output_path, "w") as f:
        json.dump(rul_model.to_dict(), f, indent=2)

    print(f"[OK] RUL model fitted (slope={rul_model.slope_coefficient:.2f}, intercept={rul_model.intercept:.2f}). Saved to: {output_path}")
    return rul_model


if __name__ == "__main__":
    train_rul_model()
