import ast
import csv
import os
from pathlib import Path
from typing import Any, Dict, Generator, Optional


def resolve_file_path(file_path: str) -> str:
    """Resolve file path against CWD or relative to package directory if not found."""
    p = Path(file_path)
    if p.exists():
        return str(p)

    # Check relative to this module directory
    module_dir = Path(__file__).parent
    cand = module_dir / file_path
    if cand.exists():
        return str(cand)

    # Check relative to adapters/data
    cand_data = module_dir / "data" / Path(file_path).name
    if cand_data.exists():
        return str(cand_data)

    return file_path


def read_csv(file_path: str) -> Generator[Dict[str, str], None, None]:
    """
    Read telemetry data from a CSV file.
    Returns each row as a string dictionary generator.
    """
    resolved = resolve_file_path(file_path)
    with open(resolved, "r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            yield dict(row)


def convert_csv_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert CSV string values into proper typed telemetry dictionary.
    """
    converted = row.copy()

    if "schema_version" not in converted or not converted["schema_version"]:
        converted["schema_version"] = "0.1"

    numeric_float_fields = [
        "timestamp",
        "rpm",
        "map",
        "oil_pressure",
        "oil_temperature",
        "fuel_flow",
        "vibration",
        "battery_voltage",
        "alternator_current",
        "injection_timing",
    ]

    for field in numeric_float_fields:
        if field in converted and converted[field] not in (None, "", "null", "None"):
            converted[field] = float(converted[field])
        elif field == "rpm":
            converted[field] = None

    if "frame_id" in converted and converted["frame_id"]:
        converted["frame_id"] = int(converted["frame_id"])

    # Parse list string fields (CHT and EGT)
    for list_field in ("cht", "egt"):
        if list_field in converted:
            val = converted[list_field]
            if isinstance(val, str):
                try:
                    converted[list_field] = [float(x) for x in ast.literal_eval(val)]
                except Exception:
                    # Fallback for comma separated strings
                    cleaned = val.strip("[]() ")
                    converted[list_field] = [float(x.strip()) for x in cleaned.split(",") if x.strip()]
            elif isinstance(val, (list, tuple)):
                converted[list_field] = [float(x) for x in val]

    return converted


def stream_csv_telemetry(file_path: str) -> Generator[Dict[str, Any], None, None]:
    """Stream converted telemetry dictionaries directly from CSV."""
    for raw_row in read_csv(file_path):
        yield convert_csv_row(raw_row)
