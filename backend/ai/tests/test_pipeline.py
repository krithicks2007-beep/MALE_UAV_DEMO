"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Comprehensive Integration Test Suite
Validates all 11 Required Specifications: TEST 001 through TEST 011
"""

import unittest
from ai.inference.diagnostics import DiagnosticsEngine
from ai.data.datasets import SyntheticFlightGenerator
from ai.data.schemas import FaultType, HealthStatus, QualityState


class TestDiagnosticsPipelineScenarios(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = DiagnosticsEngine()
        cls.generator = SyntheticFlightGenerator(seed=2026)

    def test_001_healthy(self):
        """TEST 001: Healthy baseline telemetry and nominal residuals."""
        mission = self.generator.generate_mission("MSN-TEST-001", n_frames=20, fault_type=None)
        for frame in mission:
            res = self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
            self.assertFalse(res.anomaly_detected)
            self.assertIsNone(res.fault_type)
            self.assertGreaterEqual(res.health_index, 80.0)
            self.assertEqual(res.health_status, HealthStatus.HEALTHY.value)

    def test_002_injector_abnormality(self):
        """TEST 002: Injector abnormality fault scenario."""
        mission = self.generator.generate_mission(
            "MSN-TEST-002", n_frames=180, fault_type=FaultType.INJECTOR_ABNORMALITY.value, fault_start_frame=50
        )
        # Process post-fault frame
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.INJECTOR_ABNORMALITY.value)
        self.assertLess(res.health_index, 80.0)

    def test_003_overheating(self):
        """TEST 003: Engine thermal overheating scenario."""
        mission = self.generator.generate_mission(
            "MSN-TEST-003", n_frames=180, fault_type=FaultType.OVERHEATING.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.OVERHEATING.value)
        self.assertLess(res.health_index, 60.0)

    def test_004_misfire(self):
        """TEST 004: Cylinder combustion misfire scenario."""
        mission = self.generator.generate_mission(
            "MSN-TEST-004", n_frames=180, fault_type=FaultType.MISFIRE.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.MISFIRE.value)

    def test_005_lubrication_issue(self):
        """TEST 005: Low oil pressure / lubrication failure."""
        mission = self.generator.generate_mission(
            "MSN-TEST-005", n_frames=180, fault_type=FaultType.LUBRICATION_ISSUE.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.LUBRICATION_ISSUE.value)
        self.assertEqual(res.health_status, HealthStatus.CRITICAL.value)

    def test_006_sensor_drift(self):
        """TEST 006: Sensor drift scenario."""
        mission = self.generator.generate_mission(
            "MSN-TEST-006", n_frames=180, fault_type=FaultType.SENSOR_DRIFT.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.SENSOR_DRIFT.value)

    def test_007_sensor_failure(self):
        """TEST 007: Sensor loss / missing data scenario."""
        mission = self.generator.generate_mission(
            "MSN-TEST-007", n_frames=180, fault_type=FaultType.SENSOR_FAILURE.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertEqual(res.fault_type, FaultType.SENSOR_FAILURE.value)

    def test_008_abnormal_vibration(self):
        """TEST 008: Excessive mechanical vibration."""
        mission = self.generator.generate_mission(
            "MSN-TEST-008", n_frames=180, fault_type=FaultType.ABNORMAL_VIBRATION.value, fault_start_frame=50
        )
        for frame in mission[:60]:
            self.engine.process(frame["telemetry"], frame["residuals"], frame["quality"])
        res = self.engine.process(mission[100]["telemetry"], mission[100]["residuals"], mission[100]["quality"])
        self.assertTrue(res.anomaly_detected)
        self.assertEqual(res.fault_type, FaultType.ABNORMAL_VIBRATION.value)

    def test_009_degradation_trajectory(self):
        """TEST 009: Continuous degradation estimate tracking."""
        traj = self.generator.generate_mission("MSN-TEST-009", n_frames=200, degradation_trajectory=True)
        res_start = self.engine.process(traj[10]["telemetry"], traj[10]["residuals"], traj[10]["quality"])
        res_end = self.engine.process(traj[190]["telemetry"], traj[190]["residuals"], traj[190]["quality"])
        self.assertGreater(res_end.degradation_estimate, res_start.degradation_estimate)

    def test_010_rul_trend(self):
        """TEST 010: Monotonic RUL decay and uncertainty reporting."""
        traj = self.generator.generate_mission("MSN-TEST-010", n_frames=200, degradation_trajectory=True, initial_rul_hours=100.0)
        res_start = self.engine.process(traj[10]["telemetry"], traj[10]["residuals"], traj[10]["quality"])
        res_end = self.engine.process(traj[190]["telemetry"], traj[190]["residuals"], traj[190]["quality"])
        self.assertLess(res_end.rul, res_start.rul)
        self.assertEqual(res_start.rul_unit, "operating_hours")
        self.assertIsNotNone(res_start.rul_uncertainty)

    def test_011_fault_recovery(self):
        """TEST 011: Engine health and anomaly recovery after fault resolution."""
        # Inject transient overheating and then recover
        for _ in range(5):
            self.engine.process(
                {
                    "timestamp": 1725450010.0, "mission_id": "RECOVERY-01", "frame_id": 1,
                    "rpm": 5200.0, "map": 94.0, "cht": [185.0, 185.0, 185.0, 185.0],
                    "egt": [850.0, 850.0, 850.0, 850.0], "oil_pressure": 3.8, "oil_temperature": 115.0,
                    "fuel_flow": 28.0, "vibration": 0.4
                },
                {"residuals": {"cht_residual_mean": 50.0, "residual_score": 3.5}}
            )
        # Send normal telemetry frames
        res_recovered = None
        for i in range(10):
            res_recovered = self.engine.process(
                {
                    "timestamp": 1725450020.0 + i, "mission_id": "RECOVERY-01", "frame_id": 10 + i,
                    "rpm": 5200.0, "map": 94.0, "cht": [135.0, 135.0, 135.0, 135.0],
                    "egt": [810.0, 810.0, 810.0, 810.0], "oil_pressure": 4.2, "oil_temperature": 88.0,
                    "fuel_flow": 26.5, "vibration": 0.32
                },
                {"residuals": {"cht_residual_mean": 0.0, "residual_score": 0.1}}
            )
        self.assertFalse(res_recovered.anomaly_detected)
        self.assertGreaterEqual(res_recovered.health_index, 80.0)


if __name__ == "__main__":
    unittest.main()
