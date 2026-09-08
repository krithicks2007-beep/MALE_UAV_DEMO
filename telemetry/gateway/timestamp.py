import time
from datetime import datetime, timezone


def get_current_timestamp() -> float:
    """Return the current UTC time as a Unix epoch timestamp (seconds)."""
    return time.time()


def timestamp_to_iso(ts: float) -> str:
    """Convert Unix timestamp to ISO 8601 UTC string."""
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
