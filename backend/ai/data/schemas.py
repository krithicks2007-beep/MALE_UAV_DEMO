"""
MALE UAV Digital Twin - Module X4 (AI/ML + Diagnostics)
Data Schemas and Integration Contracts
Spec: MVP v0.1
"""

from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Dict, List, Optional, Any, Union


class FaultType(str, Enum):
    """Standardized Shared Fault Vocabulary across Digital Twin modules."""
    MISFIRE = "misfire"
    INJECTOR_ABNORMALITY = "injector_abnormality"
    LUBRICATION_ISSUE = "lubrication_issue"
    SENSOR_DRIFT = "sensor_drift"
    SENSOR_FAILURE = "sensor_failure"
    COMBUSTION_INSTABILITY = "combustion_instability"
    OVERHEATING = "overheating"
    ABNORMAL_VIBRATION = "abnormal_vibration"


class HealthStatus(str, Enum):
    """Engine Health Status classification bands."""
    HEALTHY = "healthy"      # 80 - 100
    DEGRADED = "degraded"    # 60 - 79
    WARNING = "warning"      # 30 - 59
    CRITICAL = "critical"    # 0 - 29


class QualityState(str, Enum):
    """Telemetry Quality states from X3 Gateway."""
    GOOD = "good"
    DEGRADED = "degraded"
    INVALID = "invalid"
    MISSING = "missing"


@dataclass
class ChannelQuality:
    """Individual sensor channel quality descriptor."""
    valid: bool = True
    state: str = QualityState.GOOD.value
    reason: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ChannelQuality":
        return cls(
            valid=bool(data.get("valid", True)),
            state=str(data.get("state", QualityState.GOOD.value)),
            reason=data.get("reason"),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TelemetryQuality:
    """Telemetry Quality descriptor emitted by X3 Gateway."""
    timestamp: float
    mission_id: str
    frame_id: int
    schema_version: str = "0.1"
    overall_quality: str = QualityState.GOOD.value
    channel_quality: Dict[str, ChannelQuality] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TelemetryQuality":
        channels = {}
        raw_channels = data.get("channel_quality", {})
        for ch_name, ch_val in raw_channels.items():
            if isinstance(ch_val, dict):
                channels[ch_name] = ChannelQuality.from_dict(ch_val)
            elif isinstance(ch_val, ChannelQuality):
                channels[ch_name] = ch_val
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            schema_version=str(data.get("schema_version", "0.1")),
            overall_quality=str(data.get("overall_quality", QualityState.GOOD.value)),
            channel_quality=channels,
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        res["channel_quality"] = {k: v.to_dict() if hasattr(v, "to_dict") else v for k, v in self.channel_quality.items()}
        return res


@dataclass
class CanonicalTelemetry:
    """
    Canonical Telemetry data contract emitted by X3 Telemetry Gateway.
    All fields follow strictly defined engineering units:
    - rpm: rev/min
    - map: kPa
    - cht: list of °C (per-cylinder)
    - egt: list of °C (per-cylinder)
    - oil_pressure: bar
    - oil_temperature: °C
    - fuel_flow: L/h or kg/h
    - vibration: g (RMS)
    - battery_voltage: V
    - alternator_current: A
    - injection_timing: °BTDC
    """
    timestamp: float
    mission_id: str
    frame_id: int
    rpm: float
    map: float
    cht: List[float]
    egt: List[float]
    oil_pressure: float
    oil_temperature: float
    fuel_flow: float = 0.0
    vibration: float = 0.0
    battery_voltage: float = 14.0
    alternator_current: float = 15.0
    injection_timing: float = 10.0
    schema_version: str = "0.1"
    source: str = "telemetry_gateway"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CanonicalTelemetry":
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            rpm=float(data.get("rpm", 0.0)),
            map=float(data.get("map", 0.0)),
            cht=[float(x) for x in data.get("cht", [0.0, 0.0, 0.0, 0.0])],
            egt=[float(x) for x in data.get("egt", [0.0, 0.0, 0.0, 0.0])],
            oil_pressure=float(data.get("oil_pressure", 0.0)),
            oil_temperature=float(data.get("oil_temperature", 0.0)),
            fuel_flow=float(data.get("fuel_flow", 0.0)),
            vibration=float(data.get("vibration", 0.0)),
            battery_voltage=float(data.get("battery_voltage", 14.0)),
            alternator_current=float(data.get("alternator_current", 15.0)),
            injection_timing=float(data.get("injection_timing", 10.0)),
            schema_version=str(data.get("schema_version", "0.1")),
            source=str(data.get("source", "telemetry_gateway")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TwinResiduals:
    """
    Digital Twin Residuals: Residual = Actual - Expected.
    Emitted by Digital Twin Core.
    """
    timestamp: float
    mission_id: str
    frame_id: int
    residuals: Dict[str, float] = field(default_factory=dict)
    residual_score: float = 0.0
    schema_version: str = "0.1"
    model_version: str = "dt-v0.1"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TwinResiduals":
        res_dict = {str(k): float(v) for k, v in data.get("residuals", {}).items()}
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            residuals=res_dict,
            residual_score=float(data.get("residual_score", 0.0)),
            schema_version=str(data.get("schema_version", "0.1")),
            model_version=str(data.get("model_version", "dt-v0.1")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TwinState:
    """Expected physical state emitted by Digital Twin Core."""
    timestamp: float
    mission_id: str
    frame_id: int
    expected_state: Dict[str, Any] = field(default_factory=dict)
    schema_version: str = "0.1"
    model_version: str = "dt-v0.1"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TwinState":
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            expected_state=dict(data.get("expected_state", {})),
            schema_version=str(data.get("schema_version", "0.1")),
            model_version=str(data.get("model_version", "dt-v0.1")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AIFeatures:
    """Shared AI feature representation."""
    timestamp: float
    mission_id: str
    frame_id: int
    features: Dict[str, float] = field(default_factory=dict)
    schema_version: str = "0.1"
    feature_version: str = "features-v0.1"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AIFeatures":
        feats = {str(k): float(v) for k, v in data.get("features", {}).items()}
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            features=feats,
            schema_version=str(data.get("schema_version", "0.1")),
            feature_version=str(data.get("feature_version", "features-v0.1")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DiagnosticResult:
    """
    Primary Output Contract emitted by X4 (AI/ML + Diagnostics).
    Consumed by Backend API, WebSocket, and Operator Dashboard.
    """
    timestamp: float
    mission_id: str
    frame_id: int
    anomaly_detected: bool
    anomaly_score: float
    health_index: float
    health_status: str
    degradation_estimate: float
    fault_type: Optional[str] = None
    fault_confidence: Optional[float] = None
    rul: Optional[float] = None
    rul_unit: Optional[str] = "operating_hours"
    rul_uncertainty: Optional[float] = None
    evidence: List[str] = field(default_factory=list)
    schema_version: str = "0.1"
    model_version: str = "ai-v0.1"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DiagnosticResult":
        fault_conf = data.get("fault_confidence")
        rul_val = data.get("rul")
        rul_unc = data.get("rul_uncertainty")
        return cls(
            timestamp=float(data.get("timestamp", 0.0)),
            mission_id=str(data.get("mission_id", "")),
            frame_id=int(data.get("frame_id", 0)),
            anomaly_detected=bool(data.get("anomaly_detected", False)),
            anomaly_score=float(data.get("anomaly_score", 0.0)),
            health_index=float(data.get("health_index", 100.0)),
            health_status=str(data.get("health_status", HealthStatus.HEALTHY.value)),
            degradation_estimate=float(data.get("degradation_estimate", 0.0)),
            fault_type=data.get("fault_type"),
            fault_confidence=float(fault_conf) if fault_conf is not None else None,
            rul=float(rul_val) if rul_val is not None else None,
            rul_unit=data.get("rul_unit", "operating_hours"),
            rul_uncertainty=float(rul_unc) if rul_unc is not None else None,
            evidence=[str(x) for x in data.get("evidence", [])],
            schema_version=str(data.get("schema_version", "0.1")),
            model_version=str(data.get("model_version", "ai-v0.1")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
