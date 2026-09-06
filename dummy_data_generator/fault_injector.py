"""
Fault & Degradation Scenario Injection Engine
Handles gradual fault inception, ramp-up, peak/sustained state, and graceful recovery
across all canonical aero-piston fault scenarios.
"""
from typing import Dict, Optional, Tuple, List
from datetime import datetime, timezone
import uuid

from .models import ScenarioDefinition, ScenarioEvent


class FaultInjector:
    def __init__(self):
        self.active_scenario: Optional[ScenarioDefinition] = None
        self.elapsed_time: float = 0.0
        self.scenario_phase: str = "IDLE"  # "TRIGGERED", "RAMP_UP", "PEAK", "RECOVERING", "RESOLVED"
        self.events_history: List[ScenarioEvent] = []

    def start_scenario(self, scenario_id: str, duration_s: float = 60.0) -> ScenarioDefinition:
        scenario_id_clean = scenario_id.upper()
        scenarios_catalog = {
            "NORMAL": ScenarioDefinition(
                id="NORMAL",
                scenario_id="SCEN-000",
                mission_id="MALE-MSN-2026-001",
                scenario_type="normal",
                name="Normal Operation",
                description="Engine operating within nominal physical envelopes.",
                severity="NONE",
                affected_component=None,
                duration_s=duration_s,
                active=True
            ),
            "OVERHEATING": ScenarioDefinition(
                id="OVERHEATING",
                scenario_id="SCEN-001",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Engine Overheating",
                description="Cooling degradation causing elevated CHT and EGT across all cylinders.",
                severity="HIGH",
                affected_component="COOLING_SYSTEM",
                duration_s=duration_s,
                active=True
            ),
            "ABNORMAL_VIBRATION": ScenarioDefinition(
                id="ABNORMAL_VIBRATION",
                scenario_id="SCEN-002",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Abnormal Vibration",
                description="Mechanical harmonic imbalance causing elevated airframe and engine vibration.",
                severity="MEDIUM",
                affected_component="CRANKSHAFT_BEARINGS",
                duration_s=duration_s,
                active=True
            ),
            "LUBRICATION_ISSUE": ScenarioDefinition(
                id="LUBRICATION_ISSUE",
                scenario_id="SCEN-003",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Lubrication Pressure Loss",
                description="Oil pump pressure drop with accelerating oil sump temperature.",
                severity="CRITICAL",
                affected_component="OIL_PUMP",
                duration_s=duration_s,
                active=True
            ),
            "INJECTOR_ABNORMALITY": ScenarioDefinition(
                id="INJECTOR_ABNORMALITY",
                scenario_id="SCEN-004",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Injector Abnormality",
                description="Fuel delivery deviation on Cylinder 3 causing thermal disparity.",
                severity="HIGH",
                affected_component="INJECTOR_CYL_3",
                duration_s=duration_s,
                active=True
            ),
            "SENSOR_DRIFT": ScenarioDefinition(
                id="SENSOR_DRIFT",
                scenario_id="SCEN-005",
                mission_id="MALE-MSN-2026-001",
                scenario_type="sensor_fault",
                name="EGT Sensor Drift",
                description="Sensor drift on Cylinder 1 EGT thermocouple without physical engine damage.",
                severity="MEDIUM",
                affected_component="EGT_SENSOR_CYL_1",
                duration_s=duration_s,
                active=True
            ),
            "SENSOR_FAILURE": ScenarioDefinition(
                id="SENSOR_FAILURE",
                scenario_id="SCEN-006",
                mission_id="MALE-MSN-2026-001",
                scenario_type="sensor_fault",
                name="EGT Sensor Loss of Signal",
                description="EGT sensor on Cylinder 1 experiences open-circuit signal failure.",
                severity="HIGH",
                affected_component="EGT_SENSOR_CYL_1",
                duration_s=duration_s,
                active=True
            ),
            "MISFIRE": ScenarioDefinition(
                id="MISFIRE",
                scenario_id="SCEN-007",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Cylinder Misfire",
                description="Combustion misfire in Cylinder 2 producing RPM oscillation and cold exhaust.",
                severity="MEDIUM",
                affected_component="IGNITION_CYL_2",
                duration_s=duration_s,
                active=True
            ),
            "PROPELLER_OVERSPEED": ScenarioDefinition(
                id="PROPELLER_OVERSPEED",
                scenario_id="SCEN-009",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Propeller Overspeed / Thrust Surge",
                description="Pusher propeller pitch governor malfunction producing high-speed overspin at drone aft hub.",
                severity="HIGH",
                affected_component="PROPELLER_HUB",
                duration_s=duration_s,
                active=True
            ),
            "MOTOR_STRESS_VIBRATION": ScenarioDefinition(
                id="MOTOR_STRESS_VIBRATION",
                scenario_id="SCEN-010",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Motor Friction & Bearing Stress",
                description="Internal friction increase and bearing vibration stress located in the middle drone engine bay.",
                severity="HIGH",
                affected_component="ENGINE_MOTOR_CORE",
                duration_s=duration_s,
                active=True
            ),
            "WING_STRUCTURAL_STRESS": ScenarioDefinition(
                id="WING_STRUCTURAL_STRESS",
                scenario_id="SCEN-011",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Wing Structural Overload & Stress",
                description="Excessive aerodynamic stress and structural spar flexure on left and right main wings.",
                severity="HIGH",
                affected_component="WING_STRUCTURE",
                duration_s=duration_s,
                active=True
            ),
            "MISSILE_HARDPOINT_FAULT": ScenarioDefinition(
                id="MISSILE_HARDPOINT_FAULT",
                scenario_id="SCEN-012",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Missile Hardpoint / Pylon Error",
                description="Underwing weapons rail actuator fault and power linkage failure at the bottom of the wings.",
                severity="MEDIUM",
                affected_component="MISSILE_HARDPOINTS",
                duration_s=duration_s,
                active=True
            ),
            "AVIONICS_RADAR_FAILURE": ScenarioDefinition(
                id="AVIONICS_RADAR_FAILURE",
                scenario_id="SCEN-013",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Front Head Radar & Sensor Failure",
                description="Front nose radome sensor pod, optical payload, and pitot static probe loss at drone head.",
                severity="HIGH",
                affected_component="FRONT_NOSE_AVIONICS",
                duration_s=duration_s,
                active=True
            ),
            "HIGH_ALTITUDE_ICING": ScenarioDefinition(
                id="HIGH_ALTITUDE_ICING",
                scenario_id="SCEN-014",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Sub-Zero High Altitude Icing (Cold Blue Glow)",
                description="Severe sub-zero atmospheric freeze (-45°C) causing wing ice, propeller icing, nose pitot freeze, and oil thickening.",
                severity="HIGH",
                affected_component="ANTI_ICING_SYSTEM",
                duration_s=duration_s,
                active=True
            ),
            "FULL_AIRFRAME_ALERT": ScenarioDefinition(
                id="FULL_AIRFRAME_ALERT",
                scenario_id="SCEN-008",
                mission_id="MALE-MSN-2026-001",
                scenario_type="fault",
                name="Full Airframe Critical (All Parts Glow)",
                description="Multi-subsystem critical emergency: overspeed, extreme CHT/EGT, severe airframe vibration, and oil pressure collapse triggering red glow on wings, propeller, engine, and tail.",
                severity="CRITICAL",
                affected_component="ALL_AIRFRAME_SYSTEMS",
                duration_s=duration_s,
                active=True
            )
        }

        self.active_scenario = scenarios_catalog.get(scenario_id_clean, scenarios_catalog["NORMAL"])
        self.elapsed_time = 0.0
        self.scenario_phase = "TRIGGERED"

        event = ScenarioEvent(
            event_id=f"EVT-{str(uuid.uuid4())[:8]}",
            scenario_id=self.active_scenario.scenario_id,
            mission_id=self.active_scenario.mission_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            event_type=f"SCENARIO_STARTED_{self.active_scenario.id}",
            component=self.active_scenario.affected_component or "ENGINE_CORE",
            severity=self.active_scenario.severity if self.active_scenario.severity != "NONE" else "INFO",
            status="TRIGGERED"
        )
        self.events_history.append(event)
        return self.active_scenario

    def stop_scenario(self) -> Optional[ScenarioEvent]:
        if not self.active_scenario or self.active_scenario.id == "NORMAL":
            return None

        event = ScenarioEvent(
            event_id=f"EVT-{str(uuid.uuid4())[:8]}",
            scenario_id=self.active_scenario.scenario_id,
            mission_id=self.active_scenario.mission_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            event_type=f"SCENARIO_ABORTED_{self.active_scenario.id}",
            component=self.active_scenario.affected_component or "ENGINE_CORE",
            severity="INFO",
            status="RESOLVED"
        )
        self.events_history.append(event)
        self.start_scenario("NORMAL")
        return event

    def step(self, dt: float = 1.0) -> Tuple[Dict, Optional[ScenarioEvent], float]:
        """
        Advance scenario progression and return (physics_fault_offsets, latest_event, fault_intensity).
        fault_intensity ranges smoothly from 0.0 (nominal) to 1.0 (peak fault).
        """
        if not self.active_scenario or self.active_scenario.id == "NORMAL":
            return {}, None, 0.0

        self.elapsed_time += dt
        duration = max(10.0, self.active_scenario.duration_s)
        progress = min(1.0, self.elapsed_time / duration)

        # Smooth progression envelope:
        # 0.0 -> 0.2: Ramp up (intensity 0.0 -> 1.0)
        # 0.2 -> 0.7: Sustained peak (intensity 1.0)
        # 0.7 -> 1.0: Graceful recovery (intensity 1.0 -> 0.0)
        if progress <= 0.2:
            intensity = progress / 0.2
            phase = "RAMP_UP"
        elif progress <= 0.7:
            intensity = 1.0
            phase = "PEAK"
        else:
            intensity = max(0.0, (1.0 - progress) / 0.3)
            phase = "RECOVERING" if progress < 1.0 else "RESOLVED"

        latest_event = None
        if phase != self.scenario_phase:
            self.scenario_phase = phase
            latest_event = ScenarioEvent(
                event_id=f"EVT-{str(uuid.uuid4())[:8]}",
                scenario_id=self.active_scenario.scenario_id,
                mission_id=self.active_scenario.mission_id,
                timestamp=datetime.now(timezone.utc).isoformat(),
                event_type=f"{self.active_scenario.id}_{phase}",
                component=self.active_scenario.affected_component or "ENGINE_CORE",
                severity=self.active_scenario.severity if self.active_scenario.severity != "NONE" else "INFO",
                status=phase  # type: ignore
            )
            self.events_history.append(latest_event)

        # Compute physics offsets proportional to intensity
        offsets: Dict = {}
        sid = self.active_scenario.id

        if sid == "OVERHEATING":
            # CHT +45°C, EGT +65°C, Oil Temp +22°C
            offsets["cht"] = [42.0 * intensity, 46.0 * intensity, 45.0 * intensity, 40.0 * intensity]
            offsets["egt"] = [60.0 * intensity, 68.0 * intensity, 65.0 * intensity, 58.0 * intensity]
            offsets["oil_temperature"] = 22.0 * intensity
            offsets["oil_pressure"] = -0.4 * intensity

        elif sid == "ABNORMAL_VIBRATION":
            # Vibration rises from 2.2 -> 7.8 mm/s
            offsets["vibration"] = 5.6 * intensity
            offsets["rpm"] = -40.0 * intensity

        elif sid == "LUBRICATION_ISSUE":
            # Oil pressure drops drastically (4.2 -> 1.6 bar), oil temp rises
            offsets["oil_pressure"] = -2.6 * intensity
            offsets["oil_temperature"] = 32.0 * intensity
            offsets["vibration"] = 2.4 * intensity

        elif sid == "INJECTOR_ABNORMALITY":
            # Cylinder 3 fuel starvation/leak: C3 EGT drops, C3 CHT drops, other cylinders compensate
            offsets["egt"] = [10.0 * intensity, 12.0 * intensity, -120.0 * intensity, 10.0 * intensity]
            offsets["cht"] = [4.0 * intensity, 5.0 * intensity, -28.0 * intensity, 4.0 * intensity]
            offsets["vibration"] = 2.8 * intensity
            offsets["rpm"] = -60.0 * intensity

        elif sid == "SENSOR_DRIFT":
            # Only EGT on Cylinder 1 drifts high; physical engine remains nominal
            offsets["egt"] = [75.0 * intensity, 0.0, 0.0, 0.0]

        elif sid == "SENSOR_FAILURE":
            # Sensor loss: EGT Cylinder 1 drops to 0 or out of bounds
            offsets["egt"] = [-650.0 * intensity, 0.0, 0.0, 0.0]

        elif sid == "MISFIRE":
            # Cylinder 2 combustion misfire: RPM instability, EGT drops on C2, vibration spikes
            offsets["rpm"] = -120.0 * intensity
            offsets["egt"] = [0.0, -145.0 * intensity, 0.0, 0.0]
            offsets["vibration"] = 4.2 * intensity

        elif sid == "PROPELLER_OVERSPEED":
            # Propeller governor failure: massive RPM surge & thrust vibration at the aft hub
            offsets["rpm"] = 920.0 * intensity
            offsets["vibration"] = 3.6 * intensity

        elif sid == "MOTOR_STRESS_VIBRATION":
            # Engine core friction & bearing stress in middle of drone: oil temp rises, pressure drops, vibration surges
            offsets["oil_temperature"] = 36.0 * intensity
            offsets["oil_pressure"] = -1.9 * intensity
            offsets["vibration"] = 5.4 * intensity
            offsets["cht"] = [35.0 * intensity, 38.0 * intensity, 36.0 * intensity, 32.0 * intensity]

        elif sid == "WING_STRUCTURAL_STRESS":
            # Aerodynamic overload and wing buffeting across main wings
            offsets["vibration"] = 4.8 * intensity
            offsets["fuel_flow"] = 8.0 * intensity

        elif sid == "MISSILE_HARDPOINT_FAULT":
            # Underwing weapons pylon actuator & electrical fault
            offsets["battery_voltage"] = -3.2 * intensity
            offsets["vibration"] = 1.6 * intensity

        elif sid == "AVIONICS_RADAR_FAILURE":
            # Nose radome sensor loss & pitot failure
            offsets["battery_voltage"] = -1.8 * intensity

        elif sid == "HIGH_ALTITUDE_ICING":
            # Sub-zero freeze: low oil temperature, oil pressure sluggish, wing/prop drag vibration, battery droop
            offsets["oil_temperature"] = -42.0 * intensity
            offsets["oil_pressure"] = -1.6 * intensity
            offsets["vibration"] = 3.6 * intensity
            offsets["battery_voltage"] = -4.2 * intensity
            offsets["cht"] = [-35.0 * intensity, -32.0 * intensity, -30.0 * intensity, -36.0 * intensity]

        elif sid == "FULL_AIRFRAME_ALERT":
            # Total system critical: overspeed + extreme CHT/EGT + severe vibration + oil pressure loss
            offsets["rpm"] = 850.0 * intensity
            offsets["map"] = 0.45 * intensity
            offsets["cht"] = [70.0 * intensity, 75.0 * intensity, 72.0 * intensity, 68.0 * intensity]
            offsets["egt"] = [135.0 * intensity, 145.0 * intensity, 140.0 * intensity, 130.0 * intensity]

            offsets["vibration"] = 7.2 * intensity
            offsets["oil_pressure"] = -2.8 * intensity
            offsets["oil_temperature"] = 42.0 * intensity
            offsets["fuel_flow"] = 28.0 * intensity



        if progress >= 1.0:
            self.start_scenario("NORMAL")

        return offsets, latest_event, intensity
