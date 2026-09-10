"""
Comprehensive verification test script for UAV Dummy Data Generator & Backend Flow.
"""
import time
import requests
import asyncio
import websockets
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws/telemetry"


def test_rest_endpoints():
    print("\n[+] 1. Testing REST Endpoints...")
    # Test Root
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200, f"Root failed: {r.status_code}"
    print("  [OK] GET / =>", r.json().get("status"))

    # Test Telemetry Latest
    r1 = requests.get(f"{BASE_URL}/api/telemetry/latest")
    assert r1.status_code == 200
    d1 = r1.json()
    time.sleep(1.2)
    r2 = requests.get(f"{BASE_URL}/api/telemetry/latest")
    d2 = r2.json()

    print(f"  [OK] Frame 1: id={d1['frame_id']} RPM={d1['rpm']} EGT={d1['egt']}")
    print(f"  [OK] Frame 2: id={d2['frame_id']} RPM={d2['rpm']} EGT={d2['egt']}")
    assert d2['frame_id'] > d1['frame_id'], "Frame ID did not increment monotonically!"
    assert d1['timestamp'] != d2['timestamp'], "Timestamp did not change!"

    # Test Residuals / Digital Twin
    r_res = requests.get(f"{BASE_URL}/api/residuals/latest")
    assert r_res.status_code == 200
    res_data = r_res.json()
    print(f"  [OK] Digital Twin Residuals: residual_score={res_data['residual_score']} error_pct={res_data['prediction_error_pct']}%")
    print(f"    Expected RPM={res_data['expected'].get('rpm')} vs Actual RPM={res_data['actual'].get('rpm')}")

    # Test Diagnostics & RUL
    r_diag = requests.get(f"{BASE_URL}/api/diagnostics/latest")
    assert r_diag.status_code == 200
    diag_data = r_diag.json()
    print(f"  [OK] AI Diagnostics: health_index={diag_data['health_index']}% RUL={diag_data['rul_value']} hrs fault={diag_data['primary_fault']}")


def test_scenario_injection():
    print("\n[+] 2. Testing Fault Scenario Injection (OVERHEATING)...")
    # Start Overheating
    r = requests.post(f"{BASE_URL}/api/scenarios/start", json={"scenario_id": "OVERHEATING", "duration_s": 15.0})
    assert r.status_code == 200
    print("  [OK] Overheating scenario started.")

    print("  Waiting 3 seconds for thermal ramp-up...")
    time.sleep(3.5)

    r_diag = requests.get(f"{BASE_URL}/api/diagnostics/latest")
    diag = r_diag.json()
    r_tel = requests.get(f"{BASE_URL}/api/telemetry/latest")
    tel = r_tel.json()
    r_adv = requests.get(f"{BASE_URL}/api/advisories")
    advs = r_adv.json()

    print(f"  [OK] During Overheating: Primary Fault={diag['primary_fault']}, Severity={diag['severity']}, Confidence={diag['confidence']}%")
    print(f"    Health Index={diag['health_index']}% (was ~93%), RUL={diag['rul_value']} hrs")
    print(f"    Peak CHT={max(tel['cht'])}°C, Peak EGT={max(tel['egt'])}°C")
    print(f"    Advisories generated: {len(advs)}")
    if advs:
        print(f"    -> Advisory: {advs[0]['reason']} | Action: {advs[0]['recommended_action']}")

    # Stop Scenario / Return to Normal
    r_stop = requests.post(f"{BASE_URL}/api/scenarios/stop")
    assert r_stop.status_code == 200
    print("  [OK] Scenario stopped. Returning to Normal...")


async def test_websocket_stream():
    print("\n[+] 3. Testing Live WebSocket Stream...")
    async with websockets.connect(WS_URL) as ws:
        for i in range(3):
            msg = await ws.recv()
            data = json.loads(msg)
            t = data["telemetry"]
            h = data["health"]
            d = data["diagnostics"]
            tw = data["twin_state"]
            print(f"  [OK] WS Frame {i+1}: Frame #{t['frame_id']} | RPM={t['rpm']} | MAP={t['map']}b | CHT(avg)={sum(t['cht'])/4:.1f}°C | Health={h['index']}% | RUL={d['rul_value']}h | Twin={tw['twin_sync_status']}")


def main():
    test_rest_endpoints()
    test_scenario_injection()
    asyncio.run(test_websocket_stream())
    print("\n" + "=" * 60)
    print(" ALL BACKEND, TELEMETRY & WEBSOCKET TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)


if __name__ == "__main__":
    main()
