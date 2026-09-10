"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Dataset Definitions & Synthetic Scenario Data Generator
Supports healthy baselines, 8 target fault types, and degradation trajectories for RUL.
"""

from typing import List, Dict, Tuple, Optional, Any
import numpy as np
from .schemas import (
    CanonicalTelemetry,
    TelemetryQuality,
    TwinResiduals,
    FaultType,
    QualityState
)


class SyntheticFlightGenerator:
    """
    Generates physically consistent flight telemetry & residual datasets
    for model training, validation, and offline benchmarking without data leakage.
    """

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)

    def generate_mission(
        self,
        mission_id: str,
        n_frames: int = 300,
        fault_type: Optional[str] = None,
        fault_start_frame: int = 150,
        severity: float = 1.0,
        degradation_trajectory: bool = False,
        initial_rul_hours: float = 100.0,
        dt: float = 0.5  # 2 Hz telemetry
    ) -> List[Dict[str, Any]]:
        """
        Generates a sequence of timestamped frames containing:
        - telemetry: CanonicalTelemetry
        - residuals: TwinResiduals
        - quality: TelemetryQuality
        - ground_truth: fault, degradation, rul (FOR TRAINING/EVAL ONLY)
        """
        frames = []
        base_time = 1725450000.0

        # Nominal engine operating baseline (Cruise regime)
        base_rpm = 5200.0
        base_map = 94.0
        base_cht = [135.0, 134.5, 136.0, 135.5]
        base_egt = [810.0, 812.0, 809.0, 811.0]
        base_oil_p = 4.2
        base_oil_t = 88.0
        base_fuel_flow = 26.5
        base_vibration = 0.32
        base_batt = 14.2
        base_current = 16.5
        base_timing = 12.0

        for frame_idx in range(n_frames):
            timestamp = base_time + (frame_idx * dt)
            is_faulted = (fault_type is not None) and (frame_idx >= fault_start_frame)

            # Natural slight operational variance / sensor noise
            noise_rpm = self.rng.normal(0, 15.0)
            noise_map = self.rng.normal(0, 0.4)
            noise_cht = self.rng.normal(0, 0.3, size=4)
            noise_egt = self.rng.normal(0, 1.2, size=4)
            noise_oil_p = self.rng.normal(0, 0.03)
            noise_oil_t = self.rng.normal(0, 0.2)
            noise_vib = self.rng.normal(0, 0.02)

            cur_rpm = base_rpm + noise_rpm
            cur_map = base_map + noise_map
            cur_cht = [base_cht[i] + noise_cht[i] for i in range(4)]
            cur_egt = [base_egt[i] + noise_egt[i] for i in range(4)]
            cur_oil_p = base_oil_p + noise_oil_p
            cur_oil_t = base_oil_t + noise_oil_t
            cur_fuel_flow = base_fuel_flow + self.rng.normal(0, 0.1)
            cur_vibration = base_vibration + noise_vib
            cur_batt = base_batt + self.rng.normal(0, 0.05)
            cur_curr = base_current + self.rng.normal(0, 0.1)
            cur_timing = base_timing

            # Physics Digital Twin expected baseline
            exp_egt_mean = 810.5
            exp_cht_mean = 135.25
            exp_oil_p = 4.2
            exp_oil_t = 88.0
            exp_vibration = 0.32

            quality_state = QualityState.GOOD.value
            channel_qualities = {}
            active_fault = None
            deg_progress = 0.0
            current_rul = initial_rul_hours

            # Degradation calculation across trajectory
            if degradation_trajectory:
                deg_progress = min(1.0, float(frame_idx) / float(n_frames))
                # Linear/exponential RUL decay
                current_rul = max(0.0, initial_rul_hours * (1.0 - deg_progress))
                # Degradation gradually affects friction, vibration and thermal efficiency
                cur_vibration += (0.45 * deg_progress)
                cur_oil_t += (8.0 * deg_progress)
                cur_oil_p -= (0.8 * deg_progress)

            # Fault Injection Scenarios
            if is_faulted:
                active_fault = fault_type
                fault_ramp = min(1.0, (frame_idx - fault_start_frame) / 20.0) * severity

                if fault_type == FaultType.INJECTOR_ABNORMALITY.value:
                    # Cylinder 2 lean injector -> severe EGT surge on cyl 2, CHT rise, slight RPM drop
                    cur_egt[1] += (85.0 * fault_ramp)
                    cur_cht[1] += (18.0 * fault_ramp)
                    cur_rpm -= (60.0 * fault_ramp)
                    cur_vibration += (0.12 * fault_ramp)

                elif fault_type == FaultType.MISFIRE.value:
                    # Cylinder 3 intermittent misfire -> EGT collapse on cyl 3, high vibration, RPM dip
                    cur_egt[2] -= (180.0 * fault_ramp)
                    cur_vibration += (0.65 * fault_ramp)
                    cur_rpm -= (140.0 * fault_ramp)

                elif fault_type == FaultType.OVERHEATING.value:
                    # Cooling failure -> all CHTs and Oil Temp surge
                    for i in range(4):
                        cur_cht[i] += (45.0 * fault_ramp)
                    cur_oil_t += (28.0 * fault_ramp)
                    cur_oil_p -= (0.5 * fault_ramp)

                elif fault_type == FaultType.LUBRICATION_ISSUE.value:
                    # Oil leak / pump wear -> severe oil pressure drop + high oil temp
                    cur_oil_p -= (2.2 * fault_ramp)
                    cur_oil_t += (22.0 * fault_ramp)
                    cur_vibration += (0.25 * fault_ramp)

                elif fault_type == FaultType.ABNORMAL_VIBRATION.value:
                    # Propeller / shaft mechanical unbalance -> high vibration, normal temps
                    cur_vibration += (1.2 * fault_ramp)

                elif fault_type == FaultType.COMBUSTION_INSTABILITY.value:
                    # Cyclic combustion oscillation -> cyclic variance across all EGTs
                    osc = np.sin(frame_idx * 0.5) * 45.0 * fault_ramp
                    for i in range(4):
                        cur_egt[i] += osc * (1.0 if i % 2 == 0 else -1.0)
                    cur_vibration += (0.35 * fault_ramp)

                elif fault_type == FaultType.SENSOR_DRIFT.value:
                    # CHT sensor 1 drifting upwards artificially, engine physically unaffected
                    cur_cht[0] += (65.0 * fault_ramp)

                elif fault_type == FaultType.SENSOR_FAILURE.value:
                    # EGT sensor 4 drops out / missing
                    cur_egt[3] = -999.0
                    quality_state = QualityState.DEGRADED.value
                    channel_qualities["egt_4"] = {
                        "valid": False,
                        "state": QualityState.MISSING.value,
                        "reason": "Sensor signal loss"
                    }

            # Calculate Physics Twin Residuals (Actual - Expected)
            egt_mean = float(np.mean([t for t in cur_egt if t > 0])) if any(t > 0 for t in cur_egt) else exp_egt_mean
            cht_mean = float(np.mean(cur_cht))
            egt_max = float(np.max(cur_egt)) if any(t > 0 for t in cur_egt) else exp_egt_mean

            residuals_dict = {
                "egt_residual_mean": egt_mean - exp_egt_mean,
                "egt_residual_max": egt_max - exp_egt_mean,
                "cht_residual_mean": cht_mean - exp_cht_mean,
                "oil_pressure_residual": cur_oil_p - exp_oil_p,
                "oil_temp_residual": cur_oil_t - exp_oil_t,
                "vibration_residual": cur_vibration - exp_vibration
            }
            res_score = float(np.sqrt(
                ((residuals_dict["egt_residual_mean"] / 40.0) ** 2) +
                ((residuals_dict["cht_residual_mean"] / 15.0) ** 2) +
                ((residuals_dict["oil_pressure_residual"] / 0.5) ** 2) +
                ((residuals_dict["vibration_residual"] / 0.2) ** 2)
            ))

            tel = CanonicalTelemetry(
                timestamp=timestamp,
                mission_id=mission_id,
                frame_id=frame_idx,
                rpm=cur_rpm,
                map=cur_map,
                cht=cur_cht,
                egt=cur_egt,
                oil_pressure=cur_oil_p,
                oil_temperature=cur_oil_t,
                fuel_flow=cur_fuel_flow,
                vibration=cur_vibration,
                battery_voltage=cur_batt,
                alternator_current=cur_curr,
                injection_timing=cur_timing
            )

            res = TwinResiduals(
                timestamp=timestamp,
                mission_id=mission_id,
                frame_id=frame_idx,
                residuals=residuals_dict,
                residual_score=res_score
            )

            qual = TelemetryQuality(
                timestamp=timestamp,
                mission_id=mission_id,
                frame_id=frame_idx,
                overall_quality=quality_state,
                channel_quality=channel_qualities
            )

            frames.append({
                "telemetry": tel,
                "residuals": res,
                "quality": qual,
                "ground_truth": {
                    "is_faulted": is_faulted,
                    "fault_type": active_fault,
                    "degradation_progress": deg_progress,
                    "true_rul_hours": current_rul
                }
            })

        return frames
