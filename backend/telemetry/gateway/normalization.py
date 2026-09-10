"""
Unit normalization utilities conforming to Common Data Schemas Section 6.
Enforces canonical units at the telemetry boundary:
- MAP: kPa
- Temperatures (CHT, EGT, Oil Temp): °C
- Pressures (Oil Pressure): bar
"""

def bar_to_kpa(value: float) -> float:
    """Convert pressure from bar to kPa."""
    return value * 100.0


def psi_to_kpa(value: float) -> float:
    """Convert pressure from psi to kPa."""
    return value * 6.894757


def inhg_to_kpa(value: float) -> float:
    """Convert pressure from inches of mercury (inHg) to kPa."""
    return value * 3.386389


def mbar_to_kpa(value: float) -> float:
    """Convert pressure from mbar / hPa to kPa."""
    return value * 0.1


def kpa_to_bar(value: float) -> float:
    """Convert pressure from kPa to bar."""
    return value / 100.0


def psi_to_bar(value: float) -> float:
    """Convert pressure from psi to bar."""
    return value * 0.06894757


def fahrenheit_to_celsius(value: float) -> float:
    """Convert temperature from Fahrenheit to Celsius."""
    return (value - 32.0) * 5.0 / 9.0


def kelvin_to_celsius(value: float) -> float:
    """Convert temperature from Kelvin to Celsius."""
    return value - 273.15


def normalize_pressure_to_kpa(value: float, unit: str = "kPa") -> float:
    """Normalize arbitrary pressure unit to canonical kPa."""
    u = unit.lower().strip()
    if u in ("kpa", "kilopascal"):
        return float(value)
    if u == "bar":
        return bar_to_kpa(value)
    if u in ("psi", "psia", "psig"):
        return psi_to_kpa(value)
    if u in ("inhg", "in_hg"):
        return inhg_to_kpa(value)
    if u in ("mbar", "hpa"):
        return mbar_to_kpa(value)
    raise ValueError(f"Unsupported pressure unit: {unit}")


def normalize_temperature_to_celsius(value: float, unit: str = "C") -> float:
    """Normalize arbitrary temperature unit to canonical °C."""
    u = unit.upper().strip()
    if u in ("C", "CELSIUS", "°C"):
        return float(value)
    if u in ("F", "FAHRENHEIT", "°F"):
        return fahrenheit_to_celsius(value)
    if u in ("K", "KELVIN"):
        return kelvin_to_celsius(value)
    raise ValueError(f"Unsupported temperature unit: {unit}")
