"""
UAV Engine Dummy Data Generator Package
"""
from .config import GeneratorConfig, DEFAULT_CONFIG
from .models import (
    CanonicalTelemetry,
    FlightContext,
    HealthState,
    TwinVisualizationState,
    ResidualsData,
    DummyAIDiagnostics,
    ChannelQuality,
    ScenarioDefinition,
    ScenarioEvent,
    MaintenanceAdvisory,
    LiveStreamFrame
)
from .generator import UAVDummyDataGenerator

__all__ = [
    "GeneratorConfig",
    "DEFAULT_CONFIG",
    "CanonicalTelemetry",
    "FlightContext",
    "HealthState",
    "TwinVisualizationState",
    "ResidualsData",
    "DummyAIDiagnostics",
    "ChannelQuality",
    "ScenarioDefinition",
    "ScenarioEvent",
    "MaintenanceAdvisory",
    "LiveStreamFrame",
    "UAVDummyDataGenerator"
]
