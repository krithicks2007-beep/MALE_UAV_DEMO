from typing import Any, Dict, Generator, Iterable, List, Optional, Union
from telemetry.schema.telemetry import (
    CanonicalTelemetry,
    ProcessedTelemetry,
    TelemetryQuality,
)
from telemetry.gateway.validation import validate_telemetry, validate_telemetry_detailed
from telemetry.gateway.normalization import normalize_pressure_to_kpa, bar_to_kpa
from telemetry.gateway.quality import assess_telemetry_quality
from telemetry.gateway.timestamp import get_current_timestamp
from telemetry.gateway.frame import FrameCounter

frame_counter = FrameCounter()


def normalize_map(raw_map: float, unit: str = "kPa") -> float:
    """
    Convert MAP to the canonical unit: kPa.
    Supported units: kPa, bar, psi, inHg, mbar.
    """
    return normalize_pressure_to_kpa(raw_map, unit)


def process_telemetry(
    raw_data: Dict[str, Any],
    validate: bool = True,
    assess_quality: bool = True,
    return_packet: bool = False,
) -> Union[CanonicalTelemetry, ProcessedTelemetry]:
    """
    Convert raw telemetry dictionary into CanonicalTelemetry (or ProcessedTelemetry).

    :param raw_data: Dictionary containing raw sensor measurements
    :param validate: Run structural and numerical boundary validation
    :param assess_quality: Compute quality status across channels
    :param return_packet: If True, returns ProcessedTelemetry(telemetry, quality);
                          If False, returns CanonicalTelemetry for backward compatibility.
    :return: CanonicalTelemetry or ProcessedTelemetry
    """
    # Make a shallow copy so raw_data is not mutated
    normalized_data = raw_data.copy()

    # Set default schema version if missing
    if "schema_version" not in normalized_data:
        normalized_data["schema_version"] = "0.1"

    # Set default mission ID if missing
    if "mission_id" not in normalized_data:
        normalized_data["mission_id"] = "MISSION-001"

    # Set default source if missing
    if "source" not in normalized_data:
        normalized_data["source"] = "synthetic"

    # Add timestamp if missing
    if "timestamp" not in normalized_data or normalized_data["timestamp"] is None:
        normalized_data["timestamp"] = get_current_timestamp()

    # Add frame ID if missing
    if "frame_id" not in normalized_data or normalized_data["frame_id"] is None:
        normalized_data["frame_id"] = frame_counter.next_frame()

    # Normalize MAP to canonical unit (kPa)
    map_unit = normalized_data.pop("map_unit", "kPa")
    if "map" in normalized_data and normalized_data["map"] is not None:
        normalized_data["map"] = normalize_map(normalized_data["map"], map_unit)

    # Instantiate CanonicalTelemetry Pydantic model
    telemetry = CanonicalTelemetry(**normalized_data)

    # Validate telemetry
    if validate:
        is_valid, reason = validate_telemetry_detailed(telemetry)
        if not is_valid:
            raise ValueError(f"Invalid telemetry data: {reason}")

    # Assess quality
    quality = assess_telemetry_quality(telemetry) if assess_quality else TelemetryQuality()

    if return_packet:
        return ProcessedTelemetry(telemetry=telemetry, quality=quality)

    return telemetry


def process_telemetry_packet(raw_data: Dict[str, Any], validate: bool = True) -> ProcessedTelemetry:
    """Convenience helper to always return ProcessedTelemetry (telemetry + quality)."""
    return process_telemetry(raw_data, validate=validate, assess_quality=True, return_packet=True)


def process_telemetry_batch(
    batch: List[Dict[str, Any]],
    validate: bool = True,
    return_packet: bool = False,
) -> List[Union[CanonicalTelemetry, ProcessedTelemetry]]:
    """
    High-throughput batch processor for arrays of telemetry frames.
    """
    results = []
    for raw in batch:
        results.append(
            process_telemetry(
                raw,
                validate=validate,
                assess_quality=True,
                return_packet=return_packet
            )
        )
    return results


def process_telemetry_stream(
    stream: Iterable[Dict[str, Any]],
    validate: bool = True,
    return_packet: bool = False,
) -> Generator[Union[CanonicalTelemetry, ProcessedTelemetry], None, None]:
    """
    Generator processing telemetry in real-time streams with minimal memory overhead.
    """
    for raw in stream:
        yield process_telemetry(
            raw,
            validate=validate,
            assess_quality=True,
            return_packet=return_packet
        )
