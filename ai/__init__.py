"""
MALE UAV Digital Twin - Module X4: AI/ML + Diagnostics
Top-level Package Exports
"""

from .inference.diagnostics import DiagnosticsEngine
from .data.schemas import (
    CanonicalTelemetry,
    TelemetryQuality,
    TwinResiduals,
    TwinState,
    DiagnosticResult,
    FaultType,
    HealthStatus,
    QualityState,
)

__version__ = "0.1.0"
__all__ = [
    "DiagnosticsEngine",
    "CanonicalTelemetry",
    "TelemetryQuality",
    "TwinResiduals",
    "TwinState",
    "DiagnosticResult",
    "FaultType",
    "HealthStatus",
    "QualityState",
]
