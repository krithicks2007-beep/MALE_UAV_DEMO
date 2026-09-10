"""
Interactive Terminal Demo for Module X4: AI/ML + Diagnostics Engine
Simulates live streaming telemetry with injected fault & degradation to show real-time AI responses.
"""

import time
import sys
import os

# Add repository root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai import DiagnosticsEngine
from ai.data.datasets import SyntheticFlightGenerator


def run_live_demo():
    print("=" * 75)
    print("   MALE UAV DIGITAL TWIN - MODULE X4 (AI/ML + DIAGNOSTICS) LIVE DEMO")
    print("=" * 75)
    print("[1] Initializing DiagnosticsEngine (loading pre-trained models into memory)...")
    engine = DiagnosticsEngine()
    generator = SyntheticFlightGenerator(seed=2026)

    print("[2] Generating test mission with Injected Fault (Injector Abnormality at frame 15)...")
    mission = generator.generate_mission(
        mission_id="DEMO-MISSION-01",
        n_frames=35,
        fault_type="injector_abnormality",
        fault_start_frame=15,
        severity=1.0,
        degradation_trajectory=True
    )

    print("\n[3] Streaming live frames to X4 Engine (Press Ctrl+C to stop):\n")
    print(f"{'FRAME':<6} | {'RPM':<6} | {'EGT MEAN':<9} | {'ANOMALY':<8} | {'FAULT':<22} | {'HEALTH':<7} | {'RUL':<10}")
    print("-" * 80)

    for i, frame in enumerate(mission):
        tel = frame["telemetry"]
        res = frame["residuals"]
        qual = frame["quality"]

        # Run AI Inference
        diag = engine.process(telemetry=tel, residuals=res, quality=qual)

        egt_mean = sum(tel.egt) / len(tel.egt)
        fault_str = f"{diag.fault_type} ({int((diag.fault_confidence or 0)*100)}%)" if diag.fault_type else "None"
        anomaly_str = "YES" if diag.anomaly_detected else "NO"

        print(
            f"{tel.frame_id:<6} | "
            f"{tel.rpm:<6.0f} | "
            f"{egt_mean:<7.1f}C | "
            f"{anomaly_str:<8} | "
            f"{fault_str:<22} | "
            f"{diag.health_index:<5.1f}% | "
            f"{diag.rul:<4.1f}h (+/-{diag.rul_uncertainty}h)"
        )
        time.sleep(0.08)

    print("-" * 80)
    print("[SUCCESS] Real-time diagnostic stream demonstrated successfully!")
    print("=" * 75)


if __name__ == "__main__":
    run_live_demo()
