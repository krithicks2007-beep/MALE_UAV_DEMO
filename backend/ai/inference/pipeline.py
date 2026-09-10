"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Full Real-Time Diagnostic Inference Pipeline
"""

from typing import Dict, Any, Optional, Union, List
from ..data.schemas import (
    CanonicalTelemetry,
    TelemetryQuality,
    TwinResiduals,
    DiagnosticResult,
    HealthStatus
)
from ..data.preprocessing import TelemetryPreprocessor
from ..features.engineering import FeatureExtractor
from .predictor import ModelPredictor


class DiagnosticPipeline:
    """
    Executes the end-to-end AI/ML inference chain on incoming frames in real time.
    """

    def __init__(
        self,
        artifacts_dir: Optional[str] = None,
        model_version: str = "ai-v0.1",
        feature_version: str = "features-v0.1"
    ):
        self.model_version = model_version
        self.preprocessor = TelemetryPreprocessor()
        self.feature_extractor = FeatureExtractor(feature_version=feature_version)
        self.predictor = ModelPredictor(artifacts_dir=artifacts_dir, model_version=model_version)

    def process_frame(
        self,
        telemetry: Union[CanonicalTelemetry, Dict[str, Any]],
        residuals: Optional[Union[TwinResiduals, Dict[str, Any]]] = None,
        quality: Optional[Union[TelemetryQuality, Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> DiagnosticResult:
        """
        Processes single telemetry frame through full AI diagnostic stack.
        """
        # 1. Quality Sanitization & Validation
        clean_tel, quality_flags = self.preprocessor.sanitize_telemetry(telemetry, quality)

        # 2. Feature Extraction (Combines telemetry, residuals, temporal slopes)
        ai_feats = self.feature_extractor.extract_features(
            telemetry=clean_tel,
            residuals=residuals,
            quality=quality
        )
        feats = ai_feats.features

        # 3. Anomaly Detection
        anomaly_detected, anomaly_score, anomaly_evidence = self.predictor.anomaly_detector.predict(
            features=feats,
            quality_flags=quality_flags
        )

        # 4. Multi-Class Fault Classification (triggered on anomaly or sensor quality alert)
        has_anomaly_signal = anomaly_detected or (len(quality_flags) > 0)
        fault_type, fault_conf, fault_evidence = self.predictor.fault_classifier.predict(
            features=feats,
            quality_flags=quality_flags,
            anomaly_detected=has_anomaly_signal
        )

        # 5. Degradation Tracking
        degradation_est = self.predictor.degradation_estimator.estimate(
            features=feats,
            anomaly_score=anomaly_score
        )

        # 6. RUL & Uncertainty Forecasting
        rul_val, rul_unit, rul_unc = self.predictor.rul_estimator.predict(
            degradation_estimate=degradation_est,
            features=feats,
            anomaly_score=anomaly_score
        )

        # 7. Engine Health Index & Status Banding
        res_score = feats.get("residual_score", 0.0)
        health_index, health_status = self.predictor.health_estimator.assess_health(
            anomaly_score=anomaly_score,
            residual_score=res_score,
            degradation_estimate=degradation_est,
            fault_type=fault_type,
            fault_confidence=fault_conf
        )

        # 8. Consolidate Diagnostic Evidence
        all_evidence: List[str] = list(anomaly_evidence) + list(fault_evidence)
        # Deduplicate while preserving order
        unique_evidence = list(dict.fromkeys(all_evidence))

        return DiagnosticResult(
            timestamp=clean_tel.timestamp,
            mission_id=clean_tel.mission_id,
            frame_id=clean_tel.frame_id,
            anomaly_detected=anomaly_detected,
            anomaly_score=anomaly_score,
            fault_type=fault_type,
            fault_confidence=fault_conf,
            health_index=health_index,
            health_status=health_status,
            degradation_estimate=degradation_est,
            rul=rul_val,
            rul_unit=rul_unit,
            rul_uncertainty=rul_unc,
            evidence=unique_evidence,
            schema_version="0.1",
            model_version=self.model_version
        )
