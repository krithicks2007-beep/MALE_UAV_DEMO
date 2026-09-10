"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Unified Diagnostics Entrypoint & Service API
Spec: MVP v0.1 | Exposes one clean interface: DiagnosticsEngine.process()
"""

from typing import Dict, Any, Optional, Union
from ..data.schemas import CanonicalTelemetry, TelemetryQuality, TwinResiduals, DiagnosticResult
from .pipeline import DiagnosticPipeline


class DiagnosticsEngine:
    """
    Primary runtime service class for Module X4.
    External modules (Backend, Test Runners, Replay Engine) interact solely through this class.
    """

    def __init__(
        self,
        artifacts_dir: Optional[str] = None,
        model_version: str = "ai-v0.1"
    ):
        self.pipeline = DiagnosticPipeline(
            artifacts_dir=artifacts_dir,
            model_version=model_version
        )

    def process(
        self,
        telemetry: Union[CanonicalTelemetry, Dict[str, Any]],
        residuals: Optional[Union[TwinResiduals, Dict[str, Any]]] = None,
        quality: Optional[Union[TelemetryQuality, Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> DiagnosticResult:
        """
        Executes full real-time intelligence workflow on a single frame.

        Parameters:
            telemetry: CanonicalTelemetry object or dictionary matching contract
            residuals: Digital Twin residuals object or dictionary
            quality: Telemetry quality flags from X3 Gateway
            context: Optional scenario/mission metadata

        Returns:
            DiagnosticResult: Fully populated, validated diagnostic result.
        """
        return self.pipeline.process_frame(
            telemetry=telemetry,
            residuals=residuals,
            quality=quality,
            context=context
        )

    def process_dict(
        self,
        telemetry: Dict[str, Any],
        residuals: Optional[Dict[str, Any]] = None,
        quality: Optional[Dict[str, Any]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Convenience method returning a pure JSON-serializable dictionary.
        """
        result = self.process(telemetry, residuals, quality, context)
        return result.to_dict()
