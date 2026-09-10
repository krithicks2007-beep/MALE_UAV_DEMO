import random
import time
from typing import Any, Dict, Generator, List, Optional


def generate_telemetry(
    frame_id: int,
    mission_id: str = "MISSION-001",
    seed: Optional[int] = None,
    timestamp: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Generate one realistic engine telemetry sample conforming to CanonicalTelemetry.
    """
    if seed is not None:
        random.seed(seed)

    # Generate realistic RPM (idle ~1800, cruise ~4500, max ~5500)
    rpm = random.uniform(1800.0, 5500.0)

    # MAP roughly follows engine load/RPM (35 to 75 kPa)
    load_factor = (rpm - 1800.0) / (5500.0 - 1800.0)
    map_value = 35.0 + load_factor * 40.0

    # Cylinder temperatures increase with engine load
    cht_base = 90.0 + load_factor * 50.0
    egt_base = 650.0 + load_factor * 180.0

    cht = [
        round(cht_base + random.uniform(-3.0, 3.0), 2)
        for _ in range(4)
    ]

    egt = [
        round(egt_base + random.uniform(-8.0, 8.0), 2)
        for _ in range(4)
    ]

    # Oil parameters
    oil_pressure = round(2.5 + (rpm / 5500.0) * 2.0 + random.uniform(-0.1, 0.1), 2)
    oil_temperature = round(75.0 + (rpm / 5500.0) * 25.0 + random.uniform(-0.5, 0.5), 2)

    # Fuel flow and vibration
    fuel_flow = round(8.0 + (rpm / 5500.0) * 15.0 + random.uniform(-0.2, 0.2), 2)
    vibration = round(random.uniform(0.2, 0.5), 3)

    # Electrical system (24V nominal)
    battery_voltage = round(random.uniform(23.8, 24.4), 2)
    alternator_current = round(5.0 + (rpm / 5500.0) * 5.0 + random.uniform(-0.3, 0.3), 2)

    injection_timing = 24.5

    return {
        "schema_version": "0.1",
        "timestamp": timestamp if timestamp is not None else time.time(),
        "mission_id": mission_id,
        "frame_id": frame_id,
        "source": "synthetic",

        "rpm": round(rpm, 1),
        "map": round(map_value, 2),
        "cht": cht,
        "egt": egt,

        "oil_pressure": oil_pressure,
        "oil_temperature": oil_temperature,
        "fuel_flow": fuel_flow,
        "vibration": vibration,

        "battery_voltage": battery_voltage,
        "alternator_current": alternator_current,
        "injection_timing": injection_timing,
    }


def generate_telemetry_batch(
    count: int,
    start_frame_id: int = 1,
    mission_id: str = "MISSION-001",
    time_step_sec: float = 0.1,
) -> List[Dict[str, Any]]:
    """
    Generate a sequential batch of synthetic telemetry samples.
    """
    base_time = time.time()
    batch = []
    for i in range(count):
        batch.append(
            generate_telemetry(
                frame_id=start_frame_id + i,
                mission_id=mission_id,
                timestamp=base_time + (i * time_step_sec),
            )
        )
    return batch


def generate_telemetry_stream(
    start_frame_id: int = 1,
    mission_id: str = "MISSION-001",
    rate_hz: float = 10.0,
    max_frames: Optional[int] = None,
) -> Generator[Dict[str, Any], None, None]:
    """
    Continuous real-time generator yielding telemetry at the specified frequency.
    """
    interval = 1.0 / rate_hz if rate_hz > 0 else 0.0
    frame_id = start_frame_id
    generated = 0

    while max_frames is None or generated < max_frames:
        start_ts = time.perf_counter()
        yield generate_telemetry(frame_id=frame_id, mission_id=mission_id)
        frame_id += 1
        generated += 1

        if interval > 0:
            elapsed = time.perf_counter() - start_ts
            sleep_time = interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
