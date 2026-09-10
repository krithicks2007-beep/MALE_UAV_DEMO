"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Data Loaders & Mission Partitioning (Train / Val / Test)
"""

from typing import List, Dict, Tuple, Any
from .schemas import FaultType
from .datasets import SyntheticFlightGenerator


class DataLoader:
    """
    Builds full mission-separated datasets for:
    - Anomaly detection baseline & anomalous frames
    - Fault classification across all 8 fault classes
    - Degradation trajectories and RUL curves
    Ensures complete isolation across missions to prevent data leakage.
    """

    def __init__(self, seed: int = 100):
        self.generator = SyntheticFlightGenerator(seed=seed)

    def load_anomaly_dataset(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Returns:
            train_missions: List of healthy baseline missions
            val_missions: List of mixed healthy and faulted missions
            test_missions: List of completely unseen test missions
        """
        train_missions = []
        for i in range(5):
            m = self.generator.generate_mission(
                mission_id=f"TRAIN-HEALTHY-{i+1:03d}",
                n_frames=200,
                fault_type=None
            )
            train_missions.append(m)

        val_missions = []
        for fault_name in [FaultType.INJECTOR_ABNORMALITY.value, FaultType.OVERHEATING.value, None]:
            m = self.generator.generate_mission(
                mission_id=f"VAL-MSN-{fault_name or 'HEALTHY'}",
                n_frames=200,
                fault_type=fault_name,
                fault_start_frame=100
            )
            val_missions.append(m)

        test_missions = []
        for fault_name in [FaultType.MISFIRE.value, FaultType.LUBRICATION_ISSUE.value, None]:
            m = self.generator.generate_mission(
                mission_id=f"TEST-MSN-{fault_name or 'HEALTHY'}",
                n_frames=200,
                fault_type=fault_name,
                fault_start_frame=100
            )
            test_missions.append(m)

        return train_missions, val_missions, test_missions

    def load_fault_dataset(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Generates multi-class fault training and evaluation missions across all 8 fault classes.
        """
        all_faults = [
            FaultType.MISFIRE.value,
            FaultType.INJECTOR_ABNORMALITY.value,
            FaultType.LUBRICATION_ISSUE.value,
            FaultType.SENSOR_DRIFT.value,
            FaultType.SENSOR_FAILURE.value,
            FaultType.COMBUSTION_INSTABILITY.value,
            FaultType.OVERHEATING.value,
            FaultType.ABNORMAL_VIBRATION.value,
            None  # Healthy class
        ]

        train_missions = []
        test_missions = []

        for fault in all_faults:
            fname = fault or "healthy"
            # Train mission
            m_train = self.generator.generate_mission(
                mission_id=f"TRAIN-FAULT-{fname}",
                n_frames=250,
                fault_type=fault,
                fault_start_frame=80,
                severity=1.0
            )
            train_missions.append(m_train)

            # Independent test mission with different severity
            m_test = self.generator.generate_mission(
                mission_id=f"TEST-FAULT-{fname}",
                n_frames=250,
                fault_type=fault,
                fault_start_frame=80,
                severity=0.85
            )
            test_missions.append(m_test)

        return train_missions, test_missions

    def load_rul_dataset(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Generates continuous degradation trajectories with known remaining useful life (RUL).
        """
        train_trajectories = []
        test_trajectories = []

        # Train trajectories with varying initial life
        for i, initial_life in enumerate([80.0, 100.0, 120.0, 150.0]):
            traj = self.generator.generate_mission(
                mission_id=f"TRAIN-DEGRADATION-{i+1:03d}",
                n_frames=300,
                degradation_trajectory=True,
                initial_rul_hours=initial_life
            )
            train_trajectories.append(traj)

        # Unseen test trajectories
        for i, initial_life in enumerate([90.0, 110.0, 130.0]):
            traj = self.generator.generate_mission(
                mission_id=f"TEST-DEGRADATION-{i+1:03d}",
                n_frames=300,
                degradation_trajectory=True,
                initial_rul_hours=initial_life
            )
            test_trajectories.append(traj)

        return train_trajectories, test_trajectories
