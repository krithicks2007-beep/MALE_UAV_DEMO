"""
Dummy Data Generator Configuration
Centralized configuration parameters for UAV aero-piston engine simulation,
physical boundaries, noise characteristics, and fault thresholds.
"""
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import os


class OperatingStateConfig(BaseModel):
    name: str
    target_rpm: float
    map_bar: float
    cht_base_c: float
    egt_base_c: float
    oil_press_bar: float
    oil_temp_c: float
    fuel_flow_lh: float
    vibration_mms: float
    battery_volt: float
    alternator_curr_a: float
    injection_timing_btdc: float
    altitude_m: float
    airspeed_kmh: float


class GeneratorConfig(BaseModel):
    # Simulation timing
    update_interval_sec: float = float(os.getenv("GEN_UPDATE_INTERVAL", "1.0"))
    random_seed: Optional[int] = None  # None for nondeterministic, or integer for reproducible
    mission_id: str = "MALE-MSN-2026-001"
    engine_id: str = "AERO-PISTON-MALE-01"
    model_version: str = "DT-AERO-PHYSICS-v1.4.2"
    ai_model_version: str = "AI-X4-DEV-DUMMY-v1.0"
    cylinder_count: int = 4

    # Baseline operating states
    operating_states: Dict[str, OperatingStateConfig] = {
        "IDLE": OperatingStateConfig(
            name="IDLE",
            target_rpm=1500.0,
            map_bar=0.45,
            cht_base_c=145.0,
            egt_base_c=590.0,
            oil_press_bar=3.2,
            oil_temp_c=82.0,
            fuel_flow_lh=9.5,
            vibration_mms=1.4,
            battery_volt=28.1,
            alternator_curr_a=22.0,
            injection_timing_btdc=18.0,
            altitude_m=120.0,
            airspeed_kmh=0.0
        ),
        "TAKEOFF": OperatingStateConfig(
            name="TAKEOFF",
            target_rpm=5500.0,
            map_bar=1.35,
            cht_base_c=205.0,
            egt_base_c=795.0,
            oil_press_bar=4.8,
            oil_temp_c=98.0,
            fuel_flow_lh=42.0,
            vibration_mms=3.4,
            battery_volt=27.9,
            alternator_curr_a=48.0,
            injection_timing_btdc=28.0,
            altitude_m=450.0,
            airspeed_kmh=145.0
        ),
        "CLIMB": OperatingStateConfig(
            name="CLIMB",
            target_rpm=4950.0,
            map_bar=1.18,
            cht_base_c=192.0,
            egt_base_c=745.0,
            oil_press_bar=4.5,
            oil_temp_c=96.0,
            fuel_flow_lh=33.5,
            vibration_mms=2.8,
            battery_volt=28.0,
            alternator_curr_a=44.0,
            injection_timing_btdc=26.5,
            altitude_m=2800.0,
            airspeed_kmh=165.0
        ),
        "CRUISE": OperatingStateConfig(
            name="CRUISE",
            target_rpm=2850.0,
            map_bar=0.98,
            cht_base_c=178.0,
            egt_base_c=685.0,
            oil_press_bar=4.2,
            oil_temp_c=92.0,
            fuel_flow_lh=21.0,
            vibration_mms=2.2,
            battery_volt=28.2,
            alternator_curr_a=38.0,
            injection_timing_btdc=25.0,
            altitude_m=8467.0,
            airspeed_kmh=195.0
        ),
        "DESCENT": OperatingStateConfig(
            name="DESCENT",
            target_rpm=2200.0,
            map_bar=0.68,
            cht_base_c=160.0,
            egt_base_c=630.0,
            oil_press_bar=3.8,
            oil_temp_c=87.0,
            fuel_flow_lh=14.0,
            vibration_mms=1.8,
            battery_volt=28.2,
            alternator_curr_a=32.0,
            injection_timing_btdc=22.0,
            altitude_m=3500.0,
            airspeed_kmh=180.0
        ),
        "LANDING": OperatingStateConfig(
            name="LANDING",
            target_rpm=1800.0,
            map_bar=0.55,
            cht_base_c=152.0,
            egt_base_c=610.0,
            oil_press_bar=3.5,
            oil_temp_c=84.0,
            fuel_flow_lh=11.0,
            vibration_mms=1.6,
            battery_volt=28.1,
            alternator_curr_a=26.0,
            injection_timing_btdc=20.0,
            altitude_m=250.0,
            airspeed_kmh=120.0
        )
    }

    # Smoothing and noise parameters
    inertia_alpha: float = 0.15  # Low-pass filter inertia (0.05 = slow, 0.3 = rapid)
    thermal_inertia_alpha: float = 0.08  # CHT changes more slowly than RPM
    rpm_noise_std: float = 12.0
    map_noise_std: float = 0.012
    cht_noise_std: float = 0.8
    egt_noise_std: float = 2.5
    oil_press_noise_std: float = 0.04
    oil_temp_noise_std: float = 0.4
    vibration_noise_std: float = 0.12
    fuel_flow_noise_std: float = 0.25

    # Nominal base degradation & RUL
    initial_operating_hours: float = 1240.0
    nominal_degradation_rate_per_hour: float = 0.005  # Health points per nominal hour
    max_service_hours: float = 2500.0


DEFAULT_CONFIG = GeneratorConfig()
