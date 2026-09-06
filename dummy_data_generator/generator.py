"""
Master UAV Dummy Data Generator
Integrates physics simulation, digital twin state estimation, residual calculation,
AI diagnostics, quality monitoring, and scenario injection into a unified live stream.
"""
from typing import Optional, List, Dict, Any

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
        Advance the simulation by dt seconds and return a new LiveStreamFrame.
        Follows the canonical architecture:
        Simulation -> CanonicalTelemetry -> Digital Twin -> Residuals -> AI Diagnostics -> Stream
        """
        # 1. Advance fault injector state machine
        fault_offsets, latest_event, fault_intensity = self.fault_injector.step(dt)
        self.physics.set_fault_offsets(fault_offsets)

        # 2. Advance correlated physics simulation
        telemetry, flight_context = self.physics.step(dt)

        # 3. Evaluate Digital Twin expected state & compute residuals (actual - expected)
        residuals_data = self.twin.evaluate_residuals(telemetry, flight_context.mission_phase)

        # 4. Evaluate AI diagnostics, health indices, 3D twin visualization, and advisories
        active_scenario = self.fault_injector.active_scenario
        diagnostics, health, twin_state, advisories = self.ai_diagnostics.evaluate(
            telemetry=telemetry,
            residuals=residuals_data,
            active_scenario=active_scenario,
            fault_intensity=fault_intensity,
            operating_hours=self.physics.operating_hours
        )

        # 5. Evaluate sensor channel quality
        quality = self.quality_monitor.evaluate_quality(
            telemetry=telemetry,
            active_scenario=active_scenario if active_scenario else ScenarioDefinition(
                id="NORMAL", scenario_id="SCEN-000", mission_id=telemetry.mission_id,
                scenario_type="normal", name="Normal", description="Nominal", severity="NONE"
            ),
            fault_intensity=fault_intensity
        )

        # 6. Compose unified streaming frame
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
                "source": "SIMULATION"
            }
        )

        self.latest_frame = frame
        return frame

    def get_latest_frame(self) -> LiveStreamFrame:
        if self.latest_frame is None:
            return self.generate_frame(dt=0.0)
        return self.latest_frame
