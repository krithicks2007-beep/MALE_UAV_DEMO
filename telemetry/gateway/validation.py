from typing import Tuple
from telemetry.schema.telemetry import CanonicalTelemetry


def validate_telemetry(data: CanonicalTelemetry) -> bool:
    """
    Check whether telemetry is structurally and numerically usable.
    Returns True if valid, otherwise False.
    """
    is_valid, _ = validate_telemetry_detailed(data)
    return is_valid


def validate_telemetry_detailed(data: CanonicalTelemetry) -> Tuple[bool, str]:
    """
    Check whether telemetry is structurally and numerically usable.
    Returns (is_valid, error_reason).
    """
    # RPM cannot be negative
    if data.rpm is not None and data.rpm < 0:
        return False, f"RPM cannot be negative: {data.rpm}"

    # MAP cannot be negative
    if data.map < 0:
        return False, f"MAP cannot be negative: {data.map}"

    # Oil pressure cannot be negative
    if data.oil_pressure < 0:
        return False, f"Oil pressure cannot be negative: {data.oil_pressure}"

    # Oil temperature cannot be below absolute zero
    if data.oil_temperature < -273.15:
        return False, f"Oil temperature below absolute zero: {data.oil_temperature}"

    # Battery voltage cannot be negative
    if data.battery_voltage < 0:
        return False, f"Battery voltage cannot be negative: {data.battery_voltage}"

    # Alternator current cannot be negative
    if data.alternator_current < 0:
        return False, f"Alternator current cannot be negative: {data.alternator_current}"

    # Fuel flow cannot be negative
    if data.fuel_flow < 0:
        return False, f"Fuel flow cannot be negative: {data.fuel_flow}"

    # Vibration cannot be negative
    if data.vibration < 0:
        return False, f"Vibration cannot be negative: {data.vibration}"

    # CHT and EGT must contain values
    if not data.cht or len(data.cht) == 0:
        return False, "CHT array is empty"

    if not data.egt or len(data.egt) == 0:
        return False, "EGT array is empty"

    for i, t in enumerate(data.cht):
        if t < -273.15:
            return False, f"CHT cylinder {i+1} below absolute zero: {t}"

    for i, t in enumerate(data.egt):
        if t < -273.15:
            return False, f"EGT cylinder {i+1} below absolute zero: {t}"

    return True, ""
