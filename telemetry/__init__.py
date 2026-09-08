"""
MALE UAV Aero-Piston Engine Digital Twin
X3 - Telemetry & Gateway Module
Conforming to Common Data Schemas & Interface Contracts v0.1
"""

from telemetry.schema.telemetry import (
    CanonicalTelemetry,
    ChannelQuality,
    TelemetryQuality,
    ProcessedTelemetry,
)
from telemetry.gateway.gateway import (
    process_telemetry,
    process_telemetry_packet,
    process_telemetry_batch,
    process_telemetry_stream,
    normalize_map,
    frame_counter,
)
from telemetry.gateway.quality import (
    assess_channel_quality,
    detect_outlier,
    assess_telemetry_quality,
)
from telemetry.gateway.validation import (
    validate_telemetry,
    validate_telemetry_detailed,
)
from telemetry.gateway.normalization import (
    bar_to_kpa,
    psi_to_kpa,
    inhg_to_kpa,
    mbar_to_kpa,
    kpa_to_bar,
    normalize_pressure_to_kpa,
    normalize_temperature_to_celsius,
)
from telemetry.gateway.frame import FrameCounter
from telemetry.gateway.timestamp import get_current_timestamp, timestamp_to_iso
from telemetry.adapters.csv import (
    read_csv,
    convert_csv_row,
    stream_csv_telemetry,
)
from telemetry.generators.synthetic import (
    generate_telemetry,
    generate_telemetry_batch,
    generate_telemetry_stream,
)

__version__ = "0.1.0"

__all__ = [
    # Schemas
    "CanonicalTelemetry",
    "ChannelQuality",
    "TelemetryQuality",
    "ProcessedTelemetry",

    # Gateway Processors
    "process_telemetry",
    "process_telemetry_packet",
    "process_telemetry_batch",
    "process_telemetry_stream",
    "normalize_map",
    "frame_counter",

    # Quality & Validation
    "assess_channel_quality",
    "detect_outlier",
    "assess_telemetry_quality",
    "validate_telemetry",
    "validate_telemetry_detailed",

    # Normalization & Frame
    "bar_to_kpa",
    "psi_to_kpa",
    "inhg_to_kpa",
    "mbar_to_kpa",
    "kpa_to_bar",
    "normalize_pressure_to_kpa",
    "normalize_temperature_to_celsius",
    "FrameCounter",
    "get_current_timestamp",
    "timestamp_to_iso",

    # Adapters & Generators
    "read_csv",
    "convert_csv_row",
    "stream_csv_telemetry",
    "generate_telemetry",
    "generate_telemetry_batch",
    "generate_telemetry_stream",
]
