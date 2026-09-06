"""
Engine Physics Simulation Core
Implements correlated multi-cylinder aero-piston dynamics across 6 operating states
with continuous low-pass state inertia and realistic physics correlations.
"""
import random
import math
from typing import List, Dict, Tuple, Optional, Any
from datetime import datetime, timezone

from .config import GeneratorConfig, DEFAULT_CONFIG
from .models import CanonicalTelemetry, FlightContext


class EnginePhysicsSimulation:
    def __init__(self, config: GeneratorConfig = DEFAULT_CONFIG):
        self.config = config
        self.rng = random.Random(config.random_seed)

        # Current flight / operating state
        self.current_state_name: str = "CRUISE"
        self.target_state_name: str = "CRUISE"
        self.transition_progress: float = 1.0  # 0.0 to 1.0

        # Monotonic frame counter and mission tracking
        self.frame_id: int = 0
        self.mission_id: str = config.mission_id
        self.operating_hours: float = config.initial_operating_hours

        # Internal continuous physical state variables (actual running states)
        cfg = self.config.operating_states[self.current_state_name]
        self.rpm: float = cfg.target_rpm
        self.map: float = cfg.map_bar
        # Multi-cylinder baseline distribution: inner cylinders run slightly hotter
        self.cht: List[float] = [
            cfg.cht_base_c - 1.5,
            cfg.cht_base_c + 2.2,
            cfg.cht_base_c + 1.8,
            cfg.cht_base_c - 2.5
        ]
        self.egt: List[float] = [
            cfg.egt_base_c - 4.0,
            cfg.egt_base_c + 5.5,
            cfg.egt_base_c + 3.0,
            cfg.egt_base_c - 4.5
        ]
        self.oil_pressure: float = cfg.oil_press_bar
        self.oil_temperature: float = cfg.oil_temp_c
        self.fuel_flow: float = cfg.fuel_flow_lh
        self.vibration: float = cfg.vibration_mms
        self.battery_voltage: float = cfg.battery_volt
        self.alternator_current: float = cfg.alternator_curr_a
        self.injection_timing: float = cfg.injection_timing_btdc

        # Flight context
        self.altitude_m: float = cfg.altitude_m
        self.airspeed_kmh: float = cfg.airspeed_kmh
        self.ambient_temp_c: float = 38.0
        self.ambient_pressure_hpa: float = 1013.25 * math.exp(-self.altitude_m / 8400.0)
        self.fuel_quantity_pct: float = 72.0

        # Manual override mode for Data Generator UI
        self.manual_override: bool = False
        self.manual_state: Dict[str, Any] = {
            "rpm": cfg.target_rpm,
            "map": cfg.map_bar,
            "cht": [cfg.cht_base_c - 1.5, cfg.cht_base_c + 2.2, cfg.cht_base_c + 1.8, cfg.cht_base_c - 2.5],
            "egt": [cfg.egt_base_c - 4.0, cfg.egt_base_c + 5.5, cfg.egt_base_c + 3.0, cfg.egt_base_c - 4.5],
            "oil_pressure": cfg.oil_press_bar,
            "oil_temperature": cfg.oil_temp_c,
            "fuel_flow": cfg.fuel_flow_lh,
            "vibration": cfg.vibration_mms,
            "battery_voltage": cfg.battery_volt,
            "alternator_current": cfg.alternator_curr_a,
            "injection_timing": cfg.injection_timing_btdc,
            "altitude_m": cfg.altitude_m,
            "airspeed_kmh": cfg.airspeed_kmh,
        }

        # Fault offsets injected by FaultInjector
        self.fault_offsets = {
            "rpm": 0.0,
            "map": 0.0,
            "cht": [0.0, 0.0, 0.0, 0.0],
            "egt": [0.0, 0.0, 0.0, 0.0],
            "oil_pressure": 0.0,
            "oil_temperature": 0.0,
            "fuel_flow": 0.0,
            "vibration": 0.0,
            "battery_voltage": 0.0,
            "alternator_current": 0.0,
            "injection_timing": 0.0,
        }

    def set_operating_state(self, state_name: str):
        if state_name in self.config.operating_states:
            self.target_state_name = state_name
            if self.current_state_name != state_name:
                self.transition_progress = 0.0

    def set_fault_offsets(self, offsets: Dict):
        """Update fault offsets injected into physics calculation."""
        self.fault_offsets.update(offsets)

    def set_manual_override(self, enabled: bool, values: Optional[Dict] = None):
        """Enable or disable manual telemetry override from the Data Generator UI."""
        self.manual_override = enabled
        if values:
            self.manual_state.update(values)

    def update_manual_value(self, key: str, value: Any):
        """Update a specific parameter in manual override mode."""
        self.manual_state[key] = value
        self.manual_override = True

    def step(self, dt: float = 1.0) -> Tuple[CanonicalTelemetry, FlightContext]:
        """Advance physics simulation by dt seconds."""
        self.frame_id += 1
        self.operating_hours += dt / 3600.0

        if self.manual_override:
            # In manual override mode, user directly commands the target telemetry values
            m = self.manual_state
            target_rpm = float(m.get("rpm", self.rpm))
            target_map = float(m.get("map", self.map))
            m_cht = m.get("cht", self.cht)
            m_egt = m.get("egt", self.egt)
            target_oil_press = float(m.get("oil_pressure", self.oil_pressure))
            target_oil_temp = float(m.get("oil_temperature", self.oil_temperature))
            target_fuel_flow = float(m.get("fuel_flow", self.fuel_flow))
            target_vibration = float(m.get("vibration", self.vibration))
            target_alt = float(m.get("altitude_m", self.altitude_m))
            target_speed = float(m.get("airspeed_kmh", self.airspeed_kmh))
            target_volt = float(m.get("battery_voltage", self.battery_voltage))
            target_inj = float(m.get("injection_timing", self.injection_timing))

            # Instant response for manual slider control
            self.rpm = target_rpm
            self.map = target_map
            self.fuel_flow = target_fuel_flow
            self.oil_pressure = target_oil_press
            self.oil_temperature = target_oil_temp
            self.vibration = target_vibration
            self.battery_voltage = target_volt
            self.injection_timing = target_inj
            self.altitude_m = target_alt
            self.airspeed_kmh = target_speed

            cht_values = []
            for i in range(4):
                tgt_c = float(m_cht[i]) if isinstance(m_cht, list) and len(m_cht) > i else float(m_cht)
                self.cht[i] = tgt_c
                cht_noisy = round(self.cht[i] + self.rng.gauss(0.0, 0.4), 1)
                cht_values.append(cht_noisy)

            egt_values = []
            for i in range(4):
                tgt_e = float(m_egt[i]) if isinstance(m_egt, list) and len(m_egt) > i else float(m_egt)
                self.egt[i] = tgt_e
                egt_noisy = round(self.egt[i] + self.rng.gauss(0.0, 1.2), 1)
                egt_values.append(egt_noisy)

            rpm_noisy = round(self.rpm + self.rng.gauss(0.0, 3.0), 1)
            map_noisy = round(max(0.1, self.map + self.rng.gauss(0.0, 0.01)), 2)
            fuel_flow_noisy = round(max(0.5, self.fuel_flow + self.rng.gauss(0.0, 0.1)), 1)
            oil_press_noisy = round(max(0.1, self.oil_pressure + self.rng.gauss(0.0, 0.02)), 2)
            oil_temp_noisy = round(self.oil_temperature + self.rng.gauss(0.0, 0.2), 1)
            vibration_noisy = round(max(0.1, self.vibration + self.rng.gauss(0.0, 0.05)), 2)

            timestamp_str = datetime.now(timezone.utc).isoformat()
            telemetry = CanonicalTelemetry(
                timestamp=timestamp_str,
                mission_id=self.mission_id,
                frame_id=self.frame_id,
                source="MANUAL_OVERRIDE_STREAM",
                rpm=rpm_noisy,
                map=map_noisy,
                cht=cht_values,
                egt=egt_values,
                oil_pressure=oil_press_noisy,
                oil_temperature=oil_temp_noisy,
                fuel_flow=fuel_flow_noisy,
                vibration=vibration_noisy,
                battery_voltage=self.battery_voltage,
                alternator_current=self.alternator_current,
                injection_timing=self.injection_timing
            )
            flight_context = FlightContext(
                altitude_m=round(self.altitude_m, 0),
                airspeed_kmh=round(self.airspeed_kmh, 0),
                ambient_temp_c=self.ambient_temp_c,
                ambient_pressure_hpa=round(self.ambient_pressure_hpa, 1),
                fuel_quantity_pct=round(self.fuel_quantity_pct, 1),
                mission_phase=self.current_state_name,
                throttle_pct=round(min(100.0, (self.rpm / 5500.0) * 100.0), 1)
            )
            return telemetry, flight_context

        # Auto Physics Simulation Mode
        # Handle gradual state transitions
        if self.transition_progress < 1.0:
            self.transition_progress = min(1.0, self.transition_progress + (dt * 0.1))
            if self.transition_progress >= 1.0:
                self.current_state_name = self.target_state_name

        curr_cfg = self.config.operating_states[self.current_state_name]
        tgt_cfg = self.config.operating_states[self.target_state_name]
        alpha_trans = self.transition_progress

        # Interpolate target setpoints based on operating state transition
        target_rpm = (1 - alpha_trans) * curr_cfg.target_rpm + alpha_trans * tgt_cfg.target_rpm
        target_map = (1 - alpha_trans) * curr_cfg.map_bar + alpha_trans * tgt_cfg.map_bar
        target_cht_base = (1 - alpha_trans) * curr_cfg.cht_base_c + alpha_trans * tgt_cfg.cht_base_c
        target_egt_base = (1 - alpha_trans) * curr_cfg.egt_base_c + alpha_trans * tgt_cfg.egt_base_c
        target_oil_press = (1 - alpha_trans) * curr_cfg.oil_press_bar + alpha_trans * tgt_cfg.oil_press_bar
        target_oil_temp = (1 - alpha_trans) * curr_cfg.oil_temp_c + alpha_trans * tgt_cfg.oil_temp_c
        target_fuel_flow = (1 - alpha_trans) * curr_cfg.fuel_flow_lh + alpha_trans * tgt_cfg.fuel_flow_lh
        target_vibration = (1 - alpha_trans) * curr_cfg.vibration_mms + alpha_trans * tgt_cfg.vibration_mms
        target_alt = (1 - alpha_trans) * curr_cfg.altitude_m + alpha_trans * tgt_cfg.altitude_m
        target_speed = (1 - alpha_trans) * curr_cfg.airspeed_kmh + alpha_trans * tgt_cfg.airspeed_kmh

        # 1. RPM dynamic update with inertia and small realistic variation
        inertia = self.config.inertia_alpha
        rpm_target_with_fault = target_rpm + self.fault_offsets.get("rpm", 0.0)
        self.rpm += (rpm_target_with_fault - self.rpm) * inertia
        rpm_noisy = self.rpm + self.rng.gauss(0.0, self.config.rpm_noise_std)

        # 2. Correlated MAP (Manifold Absolute Pressure)
        # Scales with throttle/RPM demand
        rpm_ratio = max(0.2, self.rpm / 5500.0)
        calculated_map = target_map * (0.3 + 0.7 * rpm_ratio) + self.fault_offsets.get("map", 0.0)
        self.map += (calculated_map - self.map) * inertia
        map_noisy = max(0.2, self.map + self.rng.gauss(0.0, self.config.map_noise_std))

        # 3. Correlated Fuel Flow (L/h)
        # Fuel flow correlates with RPM and MAP: FF ~ MAP * RPM / constant
        calculated_ff = target_fuel_flow * (self.rpm / target_rpm) * (self.map / max(0.1, target_map))
        calculated_ff += self.fault_offsets.get("fuel_flow", 0.0)
        self.fuel_flow += (calculated_ff - self.fuel_flow) * inertia
        fuel_flow_noisy = max(0.5, self.fuel_flow + self.rng.gauss(0.0, self.config.fuel_flow_noise_std))

        # 4. Correlated EGT (Exhaust Gas Temperature - reacts fast to combustion)
        egt_faults = self.fault_offsets.get("egt", [0.0, 0.0, 0.0, 0.0])
        egt_cyl_offsets = [-4.0, 5.5, 3.0, -4.5]
        egt_values = []
        for i in range(4):
            base_target = target_egt_base + egt_cyl_offsets[i] + egt_faults[i]
            # EGT responds rapidly to fuel combustion
            self.egt[i] += (base_target - self.egt[i]) * (inertia * 1.5)
            egt_noisy = self.egt[i] + self.rng.gauss(0.0, self.config.egt_noise_std)
            egt_values.append(round(egt_noisy, 1))

        # 5. Correlated CHT (Cylinder Head Temperature - high thermal mass inertia)
        cht_faults = self.fault_offsets.get("cht", [0.0, 0.0, 0.0, 0.0])
        cht_cyl_offsets = [-1.5, 2.2, 1.8, -2.5]
        cht_values = []
        thermal_inertia = self.config.thermal_inertia_alpha
        for i in range(4):
            # CHT follows EGT and load with slower time constant
            egt_influence = (self.egt[i] - 600.0) * 0.15
            base_target = target_cht_base + cht_cyl_offsets[i] + egt_influence + cht_faults[i]
            self.cht[i] += (base_target - self.cht[i]) * thermal_inertia
            cht_noisy = self.cht[i] + self.rng.gauss(0.0, self.config.cht_noise_std)
            cht_values.append(round(cht_noisy, 1))

        # 6. Correlated Oil Pressure (bar)
        # Higher RPM increases pump pressure; higher oil temp decreases viscosity
        oil_press_target = target_oil_press * (0.6 + 0.4 * (self.rpm / target_rpm))
        oil_press_target += self.fault_offsets.get("oil_pressure", 0.0)
        self.oil_pressure += (oil_press_target - self.oil_pressure) * inertia
        oil_press_noisy = max(0.1, round(self.oil_pressure + self.rng.gauss(0.0, self.config.oil_press_noise_std), 2))

        # 7. Correlated Oil Temperature (°C)
        # Slower thermal inertia, heats up with engine work
        oil_temp_target = target_oil_temp + (self.rpm / target_rpm - 1.0) * 8.0
        oil_temp_target += self.fault_offsets.get("oil_temperature", 0.0)
        self.oil_temperature += (oil_temp_target - self.oil_temperature) * (thermal_inertia * 0.7)
        oil_temp_noisy = round(self.oil_temperature + self.rng.gauss(0.0, self.config.oil_temp_noise_std), 1)

        # 8. Correlated Engine Vibration (mm/s)
        # Vibration increases non-linearly with RPM and cylinder combustion disparity
        cht_imbalance = max(self.cht) - min(self.cht)
        base_vib = target_vibration * ((self.rpm / target_rpm) ** 1.2) + (cht_imbalance * 0.05)
        base_vib += self.fault_offsets.get("vibration", 0.0)
        self.vibration += (base_vib - self.vibration) * inertia
        vibration_noisy = max(0.2, round(self.vibration + self.rng.gauss(0.0, self.config.vibration_noise_std), 2))

        # 9. Electrical: Voltage and Alternator Current
        # Voltage regulation with slight load droop
        self.battery_voltage = round(28.2 + self.rng.gauss(0.0, 0.05), 1)
        alt_curr_target = 20.0 + (self.rpm / 5500.0) * 30.0 + self.fault_offsets.get("alternator_current", 0.0)
        self.alternator_current += (alt_curr_target - self.alternator_current) * inertia
        alt_curr_noisy = round(self.alternator_current + self.rng.gauss(0.0, 0.5), 1)

        # 10. Injection Timing (°BTDC)
        # Varies slightly with RPM advance
        inj_target = 20.0 + (self.rpm / 5500.0) * 8.0 + self.fault_offsets.get("injection_timing", 0.0)
        self.injection_timing += (inj_target - self.injection_timing) * inertia
        inj_timing_noisy = round(self.injection_timing + self.rng.gauss(0.0, 0.1), 1)

        # 11. Flight context updates
        self.altitude_m += (target_alt - self.altitude_m) * (inertia * 0.5)
        self.airspeed_kmh += (target_speed - self.airspeed_kmh) * (inertia * 0.5)
        # Fuel consumption
        self.fuel_quantity_pct = max(0.0, self.fuel_quantity_pct - (fuel_flow_noisy * (dt / 3600.0) * 0.1))

        timestamp_str = datetime.now(timezone.utc).isoformat()

        telemetry = CanonicalTelemetry(
            timestamp=timestamp_str,
            mission_id=self.mission_id,
            frame_id=self.frame_id,
            source="SIMULATION_ENGINE",
            rpm=round(rpm_noisy, 1),
            map=round(map_noisy, 2),
            cht=cht_values,
            egt=egt_values,
            oil_pressure=oil_press_noisy,
            oil_temperature=oil_temp_noisy,
            fuel_flow=round(fuel_flow_noisy, 1),
            vibration=vibration_noisy,
            battery_voltage=self.battery_voltage,
            alternator_current=alt_curr_noisy,
            injection_timing=inj_timing_noisy
        )

        flight_context = FlightContext(
            altitude_m=round(self.altitude_m, 0),
            airspeed_kmh=round(self.airspeed_kmh, 0),
            ambient_temp_c=self.ambient_temp_c,
            ambient_pressure_hpa=round(self.ambient_pressure_hpa, 1),
            fuel_quantity_pct=round(self.fuel_quantity_pct, 1),
            mission_phase=self.current_state_name,
            throttle_pct=round(min(100.0, (self.rpm / 5500.0) * 100.0), 1)
        )

        return telemetry, flight_context
