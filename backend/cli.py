"""
CLI runner for Dummy Data Generator
Usage:
    python -m backend.cli [--state CRUISE] [--scenario OVERHEATING] [--interval 1.0]
"""
import time
import argparse
import sys
import json
from .generator import UAVDummyDataGenerator
from .config import GeneratorConfig


def main():
    parser = argparse.ArgumentParser(description="UAV Engine Dummy Data Generator CLI")
    parser.add_argument("--state", type=str, default="CRUISE", help="Initial operating state (IDLE, TAKEOFF, CLIMB, CRUISE, DESCENT, LANDING)")
    parser.add_argument("--scenario", type=str, default="NORMAL", help="Fault scenario (NORMAL, OVERHEATING, ABNORMAL_VIBRATION, LUBRICATION_ISSUE, INJECTOR_ABNORMALITY, SENSOR_DRIFT, SENSOR_FAILURE, MISFIRE)")
    parser.add_argument("--duration", type=float, default=60.0, help="Scenario duration in seconds")
    parser.add_argument("--interval", type=float, default=1.0, help="Update interval in seconds")
    parser.add_argument("--frames", type=int, default=10, help="Number of frames to generate (0 for infinite)")
    args = parser.parse_args()

    config = GeneratorConfig(update_interval_sec=args.interval)
    generator = UAVDummyDataGenerator(config)
    generator.set_operating_state(args.state)

    if args.scenario != "NORMAL":
        print(f"[*] Injecting scenario: {args.scenario} ({args.duration}s)")
        generator.start_scenario(args.scenario, args.duration)

    print("=" * 90)
    print(f" MALE UAV ENGINE DUMMY DATA STREAM • STATE: {args.state} • SCENARIO: {args.scenario}")
    print("=" * 90)
    print(f"{'FRAME':>6} | {'RPM':>6} | {'MAP':>5} | {'EGT (AVG)':>9} | {'CHT (AVG)':>9} | {'OIL P':>5} | {'VIB':>5} | {'HLTH':>5} | {'FAULT':>18} | {'RUL':>7}")
    print("-" * 90)

    count = 0
    try:
        while True:
            frame = generator.generate_frame(dt=args.interval)
            t = frame.telemetry
            avg_egt = sum(t.egt) / len(t.egt)
            avg_cht = sum(t.cht) / len(t.cht)
            fault = frame.diagnostics.primary_fault

            print(f"{t.frame_id:6d} | {t.rpm:6.1f} | {t.map:5.2f} | {avg_egt:8.1f}°C | {avg_cht:8.1f}°C | {t.oil_pressure:4.1f}b | {t.vibration:4.1f} | {frame.health.index:4.1f}% | {fault:>18} | {frame.diagnostics.rul_value:5.0f}h")

            count += 1
            if args.frames > 0 and count >= args.frames:
                break
            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\n[!] Generator stopped by user.")


if __name__ == "__main__":
    main()
