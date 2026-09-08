"""
Dummy AI Diagnostics & Health Engine (Development Only)
Generates AI anomaly detection scores, fault classifications, health indexes,
dynamic demo RUL with uncertainty, and actionable maintenance advisories.
"""
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone
import math

from .config import GeneratorConfig, DEFAULT_CONFIG
from .models import (
    CanonicalTelemetry,
    ResidualsData,
    DummyAIDiagnostics,
    HealthState,
    SubsystemHealth,
    TwinVisualizationState,
    MaintenanceAdvisory,
    ScenarioDefinition
)


class DummyAIDiagnosticEngine:
    def __init__(self, config: GeneratorConfig = DEFAULT_CONFIG):
        self.config = config
        self.ai_model_version = config.ai_model_version
        self.health_history: List[float] = [95.0, 94.5, 94.0, 93.8, 93.5, 93.0]

    def evaluate(
        self,
        telemetry: CanonicalTelemetry,
        residuals: ResidualsData,
        active_scenario: Optional[ScenarioDefinition],
        fault_intensity: float,
        operating_hours: float
    ) -> Tuple[DummyAIDiagnostics, HealthState, TwinVisualizationState, List[MaintenanceAdvisory]]:
        timestamp_str = telemetry.timestamp
        sid = active_scenario.id if active_scenario else "NORMAL"
        fault_intensity = max(0.2, fault_intensity) if (active_scenario and sid != "NORMAL") else fault_intensity

        # Baseline nominal health indices
        mech_health = 96.0
        therm_health = 92.0
        lub_health = 95.0
        comb_health = 93.0

        # Natural slow baseline aging
        service_fraction = min(1.0, operating_hours / self.config.max_service_hours)
        aging_penalty = service_fraction * 8.0  # Up to 8% drop across nominal life
        mech_health -= aging_penalty * 0.4
        therm_health -= aging_penalty * 0.3
        lub_health -= aging_penalty * 0.5
        comb_health -= aging_penalty * 0.3

        # Base anomaly score from digital twin physical residuals
        base_anomaly = residuals.residual_score

        primary_fault = "NONE"
        fault_confidence = 0.0
        severity = "NOMINAL"
        degradation_status = "NOMINAL"
        failure_risk_pct = 0.4
        evidence: List[str] = []
        advisories: List[MaintenanceAdvisory] = []
        affected_cylinders: List[int] = []

        # 3D Twin states
        thermal_state = "NOMINAL"
        combustion_state = "NOMINAL"
        lubrication_state = "NOMINAL"
        vibration_state = "NOMINAL"

        # Evaluate based on active scenario and fault intensity
        if sid == "OVERHEATING" and fault_intensity > 0.05:
            therm_health = max(35.0, 92.0 - (55.0 * fault_intensity))
            lub_health = max(55.0, 95.0 - (30.0 * fault_intensity))
            primary_fault = "ENGINE_OVERHEATING"
            fault_confidence = round(75.0 + (23.0 * fault_intensity), 1)
            severity = "HIGH" if fault_intensity > 0.4 else "WARNING"
            degradation_status = "MODERATE" if fault_intensity > 0.5 else "SLIGHT"
            failure_risk_pct = round(12.0 + (68.0 * fault_intensity), 1)
            thermal_state = "CRITICAL" if fault_intensity > 0.6 else "HIGH" if fault_intensity > 0.3 else "ELEVATED"
            affected_cylinders = [0, 1, 2, 3]

            max_cht = max(telemetry.cht)
            max_egt = max(telemetry.egt)
            evidence = [
                f"Peak Cylinder Head Temperature at {max_cht:.1f}°C (> 210°C threshold)",
                f"Exhaust gas temperature elevated across all cylinders ({max_egt:.1f}°C)",
                f"Thermal subsystem health declined by {round(55.0 * fault_intensity)}%"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="THERMAL_EXCURSION",
                severity=severity,  # type: ignore
                reason=f"CHT {max_cht:.1f}°C exceeds safe continuous operational limit",
                recommended_action="Inspect engine cooling ducts and reduce throttle setting",
                confidence=fault_confidence,
                related_fault_type="OVERHEATING"
            ))

        elif sid == "ABNORMAL_VIBRATION" and fault_intensity > 0.05:
            mech_health = max(40.0, 96.0 - (52.0 * fault_intensity))
            primary_fault = "ABNORMAL_VIBRATION"
            fault_confidence = round(70.0 + (25.0 * fault_intensity), 1)
            severity = "HIGH" if fault_intensity > 0.5 else "WARNING"
            degradation_status = "MODERATE" if fault_intensity > 0.4 else "SLIGHT"
            failure_risk_pct = round(8.0 + (52.0 * fault_intensity), 1)
            vibration_state = "HIGH" if fault_intensity > 0.5 else "ELEVATED"

            evidence = [
                f"Engine vibration magnitude at {telemetry.vibration:.2f} mm/s (> 4.5 mm/s limit)",
                f"Harmonic frequency displacement detected on crankshaft axis",
                f"Mechanical health index degraded to {mech_health:.1f}%"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="VIBRATION_WARNING",
                severity=severity,  # type: ignore
                reason=f"Vibration level {telemetry.vibration:.2f} mm/s exceeds cruise threshold",
                recommended_action="Check propeller balancing and engine mount dampeners",
                confidence=fault_confidence,
                related_fault_type="ABNORMAL_VIBRATION"
            ))

        elif sid == "LUBRICATION_ISSUE" and fault_intensity > 0.05:
            lub_health = max(20.0, 95.0 - (72.0 * fault_intensity))
            mech_health = max(50.0, 96.0 - (40.0 * fault_intensity))
            primary_fault = "LUBRICATION_ISSUE"
            fault_confidence = round(80.0 + (18.0 * fault_intensity), 1)
            severity = "CRITICAL" if fault_intensity > 0.5 else "HIGH"
            degradation_status = "SEVERE" if fault_intensity > 0.5 else "MODERATE"
            failure_risk_pct = round(25.0 + (70.0 * fault_intensity), 1)
            lubrication_state = "CRITICAL" if fault_intensity > 0.5 else "DEGRADED"

            evidence = [
                f"Oil pressure dropped to {telemetry.oil_pressure:.2f} bar (< 2.5 bar minimum)",
                f"Oil sump temperature elevated to {telemetry.oil_temperature:.1f}°C",
                f"Critical lubrication subsystem breakdown"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="OIL_PRESSURE_CRITICAL",
                severity=severity,  # type: ignore
                reason=f"Oil pressure {telemetry.oil_pressure:.2f} bar below minimum safe pressure",
                recommended_action="Prepare for immediate landing / engine power reduction",
                confidence=fault_confidence,
                related_fault_type="LUBRICATION_ISSUE"
            ))

        elif sid == "INJECTOR_ABNORMALITY" and fault_intensity > 0.05:
            comb_health = max(38.0, 93.0 - (50.0 * fault_intensity))
            therm_health = max(65.0, 92.0 - (25.0 * fault_intensity))
            primary_fault = "INJECTOR_ABNORMALITY"
            fault_confidence = round(82.0 + (15.0 * fault_intensity), 1)
            severity = "HIGH" if fault_intensity > 0.4 else "WARNING"
            degradation_status = "MODERATE" if fault_intensity > 0.4 else "SLIGHT"
            failure_risk_pct = round(15.0 + (55.0 * fault_intensity), 1)
            combustion_state = "ABNORMAL"
            affected_cylinders = [2]  # Cylinder 3 (0-indexed 2)

            egt_delta = telemetry.egt[2] - residuals.expected.get("egt_c3", 685.0)
            evidence = [
                f"Cylinder 3 EGT anomaly ({telemetry.egt[2]:.1f}°C, delta {egt_delta:+.1f}°C)",
                f"Injector fuel flow delivery gradient variance > 18%",
                f"Combustion subsystem health dropped to {comb_health:.1f}%"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="INJECTOR_TRIM_ALERT",
                severity=severity,  # type: ignore
                reason="Fuel trim on Cylinder 3 diverged from FADEC expected curve",
                recommended_action="Inspect injector nozzle and fuel rail pressure line",
                confidence=fault_confidence,
                related_fault_type="INJECTOR_ABNORMALITY"
            ))

        elif sid == "MISFIRE" and fault_intensity > 0.05:
            comb_health = max(30.0, 93.0 - (60.0 * fault_intensity))
            mech_health = max(60.0, 96.0 - (32.0 * fault_intensity))
            primary_fault = "MISFIRE"
            fault_confidence = round(85.0 + (12.0 * fault_intensity), 1)
            severity = "HIGH" if fault_intensity > 0.4 else "WARNING"
            degradation_status = "MODERATE"
            failure_risk_pct = round(20.0 + (50.0 * fault_intensity), 1)
            combustion_state = "MISFIRE"
            affected_cylinders = [1]  # Cylinder 2 (0-indexed 1)

            evidence = [
                f"Combustion misfire detected on Cylinder 2 (EGT {telemetry.egt[1]:.1f}°C)",
                f"RPM cyclic disturbance magnitude elevated by {round(4.2 * fault_intensity, 1)} mm/s",
                f"Combustion efficiency compromised"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="IGNITION_MISFIRE",
                severity=severity,  # type: ignore
                reason="Repeated misfire events recorded in Cylinder 2 combustion chamber",
                recommended_action="Inspect spark plug gap and ignition harness",
                confidence=fault_confidence,
                related_fault_type="MISFIRE"
            ))

        elif sid == "SENSOR_DRIFT" and fault_intensity > 0.05:
            primary_fault = "SENSOR_DRIFT"
            fault_confidence = round(78.0 + (16.0 * fault_intensity), 1)
            severity = "WARNING"
            evidence = [
                f"Cylinder 1 EGT sensor drift (+{round(75.0 * fault_intensity)}°C residual)",
                "Physical thermal and mechanical subsystems remain within nominal bounds",
                "Sensor drift isolated by cross-cylinder correlation analysis"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="SENSOR_CALIBRATION",
                severity="WARNING",
                reason="Thermocouple calibration on Cylinder 1 exhibits monotonic drift",
                recommended_action="Perform thermocouple calibration check upon next turnaround",
                confidence=fault_confidence,
                related_fault_type="SENSOR_DRIFT"
            ))

        elif sid == "SENSOR_FAILURE" and fault_intensity > 0.05:
            primary_fault = "SENSOR_FAILURE"
            fault_confidence = 96.0
            severity = "HIGH"
            evidence = [
                "Complete loss of signal on Cylinder 1 EGT sensor",
                "FADEC switching to estimated thermal model for Cylinder 1",
                "Hardware sensor replacement required"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="SENSOR_FAULT",
                severity="HIGH",
                reason="Open circuit detected on EGT Channel 1",
                recommended_action="Replace Cylinder 1 EGT probe",
                confidence=96.0,
                related_fault_type="SENSOR_FAILURE"
            ))

        elif sid == "PROPELLER_OVERSPEED" and fault_intensity > 0.05:
            mech_health = max(35.0, 96.0 - (58.0 * fault_intensity))
            primary_fault = "PROPELLER_OVERSPEED"
            fault_confidence = 94.0
            severity = "HIGH"
            vibration_state = "HIGH"
            evidence = [
                f"Pusher propeller overspeed at {telemetry.rpm:.0f} RPM",
                "Aft hub pitch actuator telemetry mismatch",
                "Blade harmonic flutter detected"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="PROP_OVERSPEED_WARNING",
                severity="HIGH",
                reason="Propeller governor overspin at aft hub",
                recommended_action="Reduce throttle and inspect propeller pitch governor",
                confidence=94.0,
                related_fault_type="PROPELLER_OVERSPEED"
            ))

        elif sid == "MOTOR_STRESS_VIBRATION" and fault_intensity > 0.05:
            mech_health = max(30.0, 96.0 - (62.0 * fault_intensity))
            lub_health = max(35.0, 95.0 - (55.0 * fault_intensity))
            primary_fault = "MOTOR_STRESS_VIBRATION"
            fault_confidence = 92.0
            severity = "HIGH"
            vibration_state = "HIGH"
            thermal_state = "HIGH" if fault_intensity > 0.4 else "ELEVATED"
            evidence = [
                f"Internal engine motor core friction elevated (Vib {telemetry.vibration:.2f} mm/s)",
                f"Crankcase bearing temperature surge ({telemetry.oil_temperature:.1f}°C)",
                f"Oil pressure droop ({telemetry.oil_pressure:.2f} bar)"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="MOTOR_BEARING_STRESS",
                severity="HIGH",
                reason="Motor core friction & vibration excursion in middle engine compartment",
                recommended_action="Inspect engine main bearings and oil circulation pump",
                confidence=92.0,
                related_fault_type="MOTOR_STRESS_VIBRATION"
            ))

        elif sid == "WING_STRUCTURAL_STRESS" and fault_intensity > 0.05:
            mech_health = max(45.0, 96.0 - (48.0 * fault_intensity))
            primary_fault = "WING_STRUCTURAL_STRESS"
            fault_confidence = 90.0
            severity = "HIGH"
            vibration_state = "ELEVATED"
            evidence = [
                "Left and right wing spar load cell strain exceeds 85% limit",
                f"Airframe aero buffeting vibration at {telemetry.vibration:.2f} mm/s",
                "Aeroelastic flutter margin compromised"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="WING_LOAD_LIMIT",
                severity="HIGH",
                reason="Wing structural overload across main wingtips and spars",
                recommended_action="Descend and reduce airspeed to maneuver envelope",
                confidence=90.0,
                related_fault_type="WING_STRUCTURAL_STRESS"
            ))

        elif sid == "MISSILE_HARDPOINT_FAULT" and fault_intensity > 0.05:
            primary_fault = "MISSILE_HARDPOINT_FAULT"
            fault_confidence = 88.0
            severity = "WARNING"
            evidence = [
                "Underwing ordnance pylon #1 & #2 electrical link lost",
                "Weapons rail release actuator solenoid fault",
                "Missile umbilical bus timeout"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="WEAPONS_PYLON_ALERT",
                severity="WARNING",
                reason="Missile hardpoint electrical link fault at bottom of wings",
                recommended_action="Perform pylon bus re-poll and safe weapons circuit",
                confidence=88.0,
                related_fault_type="MISSILE_HARDPOINT_FAULT"
            ))

        elif sid == "AVIONICS_RADAR_FAILURE" and fault_intensity > 0.05:
            primary_fault = "AVIONICS_RADAR_FAILURE"
            fault_confidence = 95.0
            severity = "HIGH"
            evidence = [
                "Front head radome radar transceiver signal loss",
                "Nose pitot-static heating element trip",
                "Forward electro-optical sensor pod offline"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="AVIONICS_RADOME_FAULT",
                severity="HIGH",
                reason="Front head nose radome & sensor suite failure",
                recommended_action="Switch to backup GPS/INS navigation and return to base",
                confidence=95.0,
                related_fault_type="AVIONICS_RADAR_FAILURE"
            ))

        elif sid == "HIGH_ALTITUDE_ICING" and fault_intensity > 0.05:
            mech_health = max(40.0, 96.0 - (50.0 * fault_intensity))
            lub_health = max(45.0, 95.0 - (45.0 * fault_intensity))
            primary_fault = "HIGH_ALTITUDE_ICING"
            fault_confidence = 93.0
            severity = "HIGH"
            vibration_state = "ELEVATED"
            evidence = [
                "Severe sub-zero atmospheric freeze (-45°C ambient)",
                "Ice accretion detected on wings leading edge and propeller blades",
                f"Oil viscosity thickening with low sump temp ({telemetry.oil_temperature:.1f}°C)",
                "Pitot probe anti-icing heater at maximum electrical draw"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="ATMOSPHERIC_ICING_ALERT",
                severity="HIGH",
                reason="High-altitude sub-zero icing on wings, propeller, nose & engine oil cooler",
                recommended_action="Activate wing de-icing boots & descend to warmer altitude layer",
                confidence=93.0,
                related_fault_type="HIGH_ALTITUDE_ICING"
            ))

        elif (sid == "PROPELLER_ICING" or sid == "PROP_ICING") and fault_intensity > 0.05:
            mech_health = max(45.0, 96.0 - (42.0 * fault_intensity))
            primary_fault = "PROPELLER_ICING"
            fault_confidence = 96.0
            severity = "HIGH"
            vibration_state = "ELEVATED"
            evidence = [
                "Aft pusher propeller blade leading-edge ice accretion detected",
                "Pusher propeller aerodynamic thrust efficiency reduced by 34%",
                "Propeller de-ice heating element boot failure at aft hub",
                "High-frequency blade rotational aerodynamic imbalance"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="PROP_ICING_ALERT",
                severity="HIGH",
                reason="Propeller blade ice accretion at aft pusher hub",
                recommended_action="Activate propeller electro-thermal de-ice boots and descend to warmer altitude",
                confidence=96.0,
                related_fault_type="PROPELLER_ICING"
            ))

        elif sid == "FULL_AIRFRAME_ALERT" and fault_intensity > 0.05:
            therm_health = max(15.0, 92.0 - (75.0 * fault_intensity))
            mech_health = max(15.0, 96.0 - (75.0 * fault_intensity))
            lub_health = max(15.0, 95.0 - (80.0 * fault_intensity))
            comb_health = max(15.0, 93.0 - (75.0 * fault_intensity))
            primary_fault = "FULL_AIRFRAME_CRITICAL_FAILURE"
            fault_confidence = 99.0
            severity = "CRITICAL"
            degradation_status = "SEVERE"
            failure_risk_pct = 98.0
            thermal_state = "CRITICAL"
            vibration_state = "HIGH"
            lubrication_state = "CRITICAL"
            combustion_state = "ABNORMAL"
            affected_cylinders = [0, 1, 2, 3]

            evidence = [
                "FULL AIRFRAME EMERGENCY: Multi-subsystem critical envelope breach",
                f"Airframe vibration severe at {telemetry.vibration:.2f} mm/s",
                f"Engine overspeed at {telemetry.rpm:.0f} RPM with thermal runaway (CHT > 240°C)",
                f"Hydraulic oil pressure collapse ({telemetry.oil_pressure:.2f} bar)"
            ]
            advisories.append(MaintenanceAdvisory(
                timestamp=timestamp_str,
                mission_id=telemetry.mission_id,
                advisory_type="FULL_AIRFRAME_CRITICAL",
                severity="CRITICAL",
                reason="Critical multi-system catastrophic excursion across wings, propeller, engine & tail",
                recommended_action="IMMEDIATE EMERGENCY LANDING / GLIDE PROTOCOL",
                confidence=99.0,
                related_fault_type="FULL_AIRFRAME_ALERT"
            ))



        # ── TAPAS DRDO (Rustom-II MALE UAV) Physical Envelope Validation ────
        tapas_critical_violations: List[str] = []
        tapas_warning_violations: List[str] = []

        # 1. CHT Limit (>215°C critical, >200°C warning)
        max_cht = max(telemetry.cht) if telemetry.cht else 0.0
        if max_cht > 215.0:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: CHT {max_cht:.1f}°C > 215°C critical ceiling")
            thermal_state = "CRITICAL"
            therm_health = min(therm_health, 25.0)
        elif max_cht > 200.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: CHT {max_cht:.1f}°C > 200°C continuous limit")
            thermal_state = "HIGH" if thermal_state == "NOMINAL" else thermal_state
            therm_health = min(therm_health, 60.0)

        # 2. EGT Limit (>780°C critical, >750°C warning)
        max_egt = max(telemetry.egt) if telemetry.egt else 0.0
        if max_egt > 780.0:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: EGT {max_egt:.1f}°C > 780°C critical threshold")
            thermal_state = "CRITICAL"
            therm_health = min(therm_health, 30.0)
        elif max_egt > 750.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: EGT {max_egt:.1f}°C > 750°C elevated exhaust")
            therm_health = min(therm_health, 65.0)

        # 3. Oil Pressure (<2.5 bar critical, <3.2 bar warning, >6.0 bar overpressure)
        if telemetry.oil_pressure < 2.5:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: Oil Pressure {telemetry.oil_pressure:.2f} bar < 2.5 bar critical minimum")
            lubrication_state = "CRITICAL"
            lub_health = min(lub_health, 20.0)
        elif telemetry.oil_pressure < 3.2:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: Oil Pressure {telemetry.oil_pressure:.2f} bar < 3.2 bar low warning")
            lubrication_state = "DEGRADED" if lubrication_state == "NOMINAL" else lubrication_state
            lub_health = min(lub_health, 55.0)
        elif telemetry.oil_pressure > 6.0:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: Oil Pressure {telemetry.oil_pressure:.2f} bar > 6.0 bar hydraulic overpressure")
            lubrication_state = "CRITICAL"

        # 4. Oil Temperature (>125°C critical, >115°C warning)
        if telemetry.oil_temperature > 125.0:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: Oil Temperature {telemetry.oil_temperature:.1f}°C > 125°C viscosity breakdown")
            lubrication_state = "CRITICAL"
            lub_health = min(lub_health, 25.0)
        elif telemetry.oil_temperature > 115.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: Oil Temperature {telemetry.oil_temperature:.1f}°C > 115°C high warning")
            lub_health = min(lub_health, 60.0)

        # 5. RPM (>5800 critical overspeed, >5500 warning, <1200 critical stall)
        if telemetry.rpm > 5800.0:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: Engine Overspeed {telemetry.rpm:.0f} RPM > 5800 RPM redline")
            mech_health = min(mech_health, 30.0)
            vibration_state = "HIGH"
            if primary_fault == "NONE":
                primary_fault = "PROPELLER_OVERSPEED"
        elif telemetry.rpm > 5500.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: Engine RPM {telemetry.rpm:.0f} RPM > 5500 RPM max continuous power")
            mech_health = min(mech_health, 70.0)
        elif telemetry.rpm < 1200.0 and telemetry.rpm > 100.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: Engine RPM {telemetry.rpm:.0f} RPM < 1200 RPM sub-idle")

        # 6. Vibration (>7.5 mm/s critical, >5.0 mm/s warning)
        if telemetry.vibration > 7.5:
            tapas_critical_violations.append(f"TAPAS DRDO LIMIT EXCEEDED: Airframe Vibration {telemetry.vibration:.2f} mm/s > 7.5 mm/s structural redline")
            vibration_state = "HIGH"
            mech_health = min(mech_health, 25.0)
        elif telemetry.vibration > 5.0:
            tapas_warning_violations.append(f"TAPAS DRDO WARNING: Vibration {telemetry.vibration:.2f} mm/s > 5.0 mm/s high warning")
            vibration_state = "HIGH" if vibration_state == "NOMINAL" else vibration_state
            mech_health = min(mech_health, 60.0)

        # If any TAPAS DRDO critical violation occurs, escalate diagnostic severity
        if tapas_critical_violations:
            severity = "CRITICAL"
            if primary_fault == "NONE":
                if active_scenario and sid != "NORMAL":
                    primary_fault = active_scenario.id
                elif max_cht > 200.0 or max_egt > 750.0:
                    primary_fault = "ENGINE_OVERHEATING"
                elif telemetry.vibration > 5.0:
                    primary_fault = "ABNORMAL_VIBRATION"
                elif telemetry.oil_pressure < 3.2 or telemetry.oil_temperature > 115.0:
                    primary_fault = "LUBRICATION_ISSUE"
                elif telemetry.rpm > 5500.0:
                    primary_fault = "PROPELLER_OVERSPEED"
                else:
                    primary_fault = "TAPAS_DRDO_CRITICAL_EXCURSION"
            fault_confidence = max(fault_confidence, 99.0)
            degradation_status = "SEVERE"
            failure_risk_pct = max(failure_risk_pct, 88.0)
            for v in tapas_critical_violations:
                evidence.insert(0, v)
                advisories.insert(0, MaintenanceAdvisory(
                    timestamp=timestamp_str,
                    mission_id=telemetry.mission_id,
                    advisory_type="TAPAS_CRITICAL_ALERT",
                    severity="CRITICAL",
                    reason=v,
                    recommended_action="Emergency Engine Power Reduction / RTB Protocol",
                    confidence=99.0,
                    related_fault_type="TAPAS_ENVELOPE_EXCEEDED"
                ))
        elif tapas_warning_violations and severity in ("NOMINAL", "INFO"):
            severity = "WARNING"
            if primary_fault == "NONE":
                if active_scenario and sid != "NORMAL":
                    primary_fault = active_scenario.id
                elif max_cht > 200.0 or max_egt > 750.0:
                    primary_fault = "ENGINE_OVERHEATING"
                elif telemetry.vibration > 5.0:
                    primary_fault = "ABNORMAL_VIBRATION"
                elif telemetry.oil_pressure < 3.2 or telemetry.oil_temperature > 115.0:
                    primary_fault = "LUBRICATION_ISSUE"
                elif telemetry.rpm > 5500.0:
                    primary_fault = "PROPELLER_OVERSPEED"
                else:
                    primary_fault = "TAPAS_DRDO_WARNING"
            fault_confidence = max(fault_confidence, 85.0)
            degradation_status = "SLIGHT" if degradation_status == "NOMINAL" else degradation_status
            failure_risk_pct = max(failure_risk_pct, 45.0)
            for v in tapas_warning_violations:
                evidence.insert(0, v)
                advisories.append(MaintenanceAdvisory(
                    timestamp=timestamp_str,
                    mission_id=telemetry.mission_id,
                    advisory_type="TAPAS_WARNING_ALERT",
                    severity="WARNING",
                    reason=v,
                    recommended_action="Monitor engine telemetry and verify operating margins",
                    confidence=85.0,
                    related_fault_type="TAPAS_ENVELOPE_WARNING"
                ))

        # Overall health index calculation
        overall_health = (mech_health * 0.30) + (therm_health * 0.25) + (lub_health * 0.25) + (comb_health * 0.20)
        overall_health = round(max(10.0, min(100.0, overall_health)), 1)

        # Update degradation history trend
        if len(self.health_history) > 30:
            self.health_history.pop(0)
        self.health_history.append(overall_health)

        # Engine state mapping
        if overall_health >= 85.0:
            engine_state = "NOMINAL"
        elif overall_health >= 70.0:
            engine_state = "WARNING"
        elif overall_health >= 50.0:
            engine_state = "DEGRADED"
        else:
            engine_state = "CRITICAL"

        # Final anomaly score
        anomaly_score = max(base_anomaly, round(fault_intensity * 0.85, 2))
        anomaly_detected = anomaly_score > 0.15

        # Dynamic Demo RUL calculation (hours)
        # Healthy: ~1240 hrs. Drops with operating hours and active severe degradation.
        base_rul = max(50.0, self.config.max_service_hours - operating_hours)
        health_factor = (overall_health / 100.0) ** 1.8
        demo_rul = round(base_rul * health_factor, 0)
        rul_uncertainty = round(10.0 + (1.0 - health_factor) * 45.0, 1)

        diagnostics = DummyAIDiagnostics(
            anomaly_detected=anomaly_detected,
            anomaly_score=anomaly_score,
            primary_fault=primary_fault,
            fault_type=primary_fault if primary_fault != "NONE" else None,
            confidence=fault_confidence,
            severity=severity,  # type: ignore
            degradation_status=degradation_status,  # type: ignore
            degradation_estimate=round(1.0 - (overall_health / 100.0), 3),
            health_index=overall_health,
            health_status=engine_state,
            rul_value=demo_rul,
            rul=demo_rul,
            rul_unit="HOURS",
            rul_confidence=round(max(40.0, 92.0 - (1.0 - health_factor) * 40.0), 1),
            rul_uncertainty=rul_uncertainty,
            failure_risk_pct=failure_risk_pct,
            evidence=evidence if evidence else ["All monitored physical channels operate within nominal variance envelopes."],
            model_version=self.ai_model_version,
            last_updated=timestamp_str
        )

        health = HealthState(
            index=overall_health,
            engine_state=engine_state,
            subsystems=SubsystemHealth(
                mechanical=round(mech_health, 1),
                thermal=round(therm_health, 1),
                lubrication=round(lub_health, 1),
                combustion=round(comb_health, 1)
            ),
            degradation_trend=list(self.health_history),
            last_updated=timestamp_str
        )

        twin_state = TwinVisualizationState(
            engine_state=engine_state,
            health_index=overall_health,
            rpm=telemetry.rpm,
            thermal_state=thermal_state,  # type: ignore
            combustion_state=combustion_state,  # type: ignore
            lubrication_state=lubrication_state,  # type: ignore
            vibration_state=vibration_state,  # type: ignore
            active_fault=primary_fault if primary_fault != "NONE" else None,
            affected_cylinders=affected_cylinders,
            twin_sync_status="SYNCED",
            last_sync_timestamp=timestamp_str,
            model_version=self.config.model_version
        )

        return diagnostics, health, twin_state, advisories
