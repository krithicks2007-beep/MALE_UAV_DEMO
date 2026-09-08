"""
Master UAV Dummy Data Generator & Telemetry Pipeline
Integrates physics simulation, Telemetry Gateway normalization/validation/quality assessment,
digital twin state estimation, residual calculation, AI diagnostics, and scenario injection into a unified live stream.
"""
from typing import Optional, List, Dict, Any
from pathlib import Path
import sys

# Ensure project root is in sys.path so telemetry package is importable
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from .config import GeneratorConfig, DEFAULT_CONFIG
from .models import (
    LiveStreamFrame,
    CanonicalTelemetry,
    FlightContext,
    HealthState,
    TwinVisualizationState,
    ResidualsData,
    DummyAIDiagnostics,
    ChannelQuality,
    ScenarioDefinition,
    ScenarioEvent,
    MaintenanceAdvisory
)
from .engine_physics import EnginePhysicsSimulation
from .digital_twin_model import DigitalTwinModel
from .fault_injector import FaultInjector
from .quality_monitor import QualityMonitor
from .dummy_ai_diagnostics import DummyAIDiagnosticEngine

# Telemetry Gateway Integration
from telemetry.gateway.gateway import process_telemetry, process_telemetry_packet
from telemetry.gateway.quality import assess_telemetry_quality
from telemetry.gateway.validation import validate_telemetry_detailed


class UAVDummyDataGenerator:
    def __init__(self, config: GeneratorConfig = DEFAULT_CONFIG):
        self.config = config
        self.physics = EnginePhysicsSimulation(config)
        self.twin = DigitalTwinModel(config)
        self.fault_injector = FaultInjector()
        self.quality_monitor = QualityMonitor()
        self.ai_diagnostics = DummyAIDiagnosticEngine(config)

        self.latest_frame: Optional[LiveStreamFrame] = None
        # Generate initial frame
        self.generate_frame(dt=0.0)

    def set_operating_state(self, state_name: str):
        """Set engine operating state (e.g. IDLE, TAKEOFF, CLIMB, CRUISE, DESCENT, LANDING)."""
        self.physics.set_operating_state(state_name)

    def start_scenario(self, scenario_id: str, duration_s: float = 60.0) -> ScenarioDefinition:
        """Inject an engine fault or degradation scenario."""
        return self.fault_injector.start_scenario(scenario_id, duration_s)

    def stop_scenario(self) -> Optional[ScenarioEvent]:
        """Abort/stop current scenario and return to normal."""
        return self.fault_injector.stop_scenario()

    def generate_frame(self, dt: float = 1.0) -> LiveStreamFrame:
        """
        Advance the simulation and route through the Telemetry Gateway:
        Physics/Data Generator -> Telemetry Gateway (Normalize, Validate, Quality) -> Digital Twin -> Residuals -> AI Diagnostics -> Dashboard Stream
        """
        # 1. Advance fault injector state machine
        fault_offsets, latest_event, fault_intensity = self.fault_injector.step(dt)
        self.physics.set_fault_offsets(fault_offsets)

        # 2. Advance correlated physics simulation / manual control state
        raw_telemetry, flight_context = self.physics.step(dt)

        # 3. Route through Telemetry Gateway Pipeline
        raw_dict = raw_telemetry.model_dump()
        gateway_quality = None
        try:
            processed_packet = process_telemetry_packet(raw_dict, validate=False)
            gateway_quality = processed_packet.quality
        except Exception:
            gateway_quality = None

        telemetry = raw_telemetry

        # 4. Evaluate Digital Twin expected state & compute residuals (actual - expected)
        residuals_data = self.twin.evaluate_residuals(telemetry, flight_context.mission_phase)

        # 5. Evaluate AI diagnostics, health indices, 3D twin visualization, and advisories
        active_scenario = self.fault_injector.active_scenario
        diagnostics, health, twin_state, advisories = self.ai_diagnostics.evaluate(
            telemetry=telemetry,
            residuals=residuals_data,
            active_scenario=active_scenario,
            fault_intensity=fault_intensity,
            operating_hours=self.physics.operating_hours
        )

        # 6. Evaluate sensor channel quality using Telemetry Gateway Quality Engine
        quality = self.quality_monitor.evaluate_quality(
            telemetry=telemetry,
            active_scenario=active_scenario if active_scenario else ScenarioDefinition(
                id="NORMAL", scenario_id="SCEN-000", mission_id=telemetry.mission_id,
                scenario_type="normal", name="Normal", description="Nominal", severity="NONE"
            ),
            fault_intensity=fault_intensity,
            gateway_quality=gateway_quality
        )

        # 7. Compose unified streaming frame to send to dashboard
        frame = LiveStreamFrame(
            telemetry=telemetry,
            flight_context=flight_context,
            health=health,
            twin_state=twin_state,
            twin_analysis=residuals_data,
            diagnostics=diagnostics,
            quality=quality,
            active_scenario=active_scenario,
            latest_event=latest_event,
            advisories=advisories,
            system_status={
                "ecu": "ONLINE",
                "can_bus": "CONNECTED",
                "sensors": "NORMAL" if quality.overall_quality == "GOOD" else quality.overall_quality,
                "source": "TELEMETRY_GATEWAY"
            }
        )

        self.latest_frame = frame
        return frame

    def get_latest_frame(self) -> LiveStreamFrame:
        if self.latest_frame is None:
            return self.generate_frame(dt=0.0)
        return self.latest_frame
