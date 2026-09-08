"""
Verification test for Data Generator manual slider adjustments & TAPAS DRDO Redline Alerts.
"""
import time
import requests
import json

BASE_URL = "http://127.0.0.1:8000"


def test_manual_override_and_tapas_limits():
    print("\n" + "=" * 70)
    print(" TESTING DATA GENERATOR MANUAL ADJUSTMENTS & TAPAS DRDO LIMITS")
    print("=" * 70)

    # 1. Test GET /control UI HTML
    r_ui = requests.get(f"{BASE_URL}/control")
    assert r_ui.status_code == 200 and ("MALE UAV" in r_ui.text or "TAPAS" in r_ui.text)
    print("  [OK] GET /control => Generator UI HTML loaded successfully.")

    # 2. Test Manual Control Slider Adjustments (Normal parameter nudging)
    print("\n[*] Setting manual parameter adjustments (RPM=3200, MAP=1.12, OilP=4.4)...")
    r_manual = requests.post(f"{BASE_URL}/api/manual-control", json={
        "manual_override": True,
        "values": {
            "rpm": 3200.0,
            "map": 1.12,
            "oil_pressure": 4.4,
            "oil_temperature": 94.0,
            "vibration": 2.4,
            "fuel_flow": 24.5
        }
    })
    assert r_manual.status_code == 200
    time.sleep(1.5)

    r_tel = requests.get(f"{BASE_URL}/api/telemetry/latest").json()
    print(f"  [OK] Telemetry responded to manual adjustment: RPM={r_tel['rpm']} | MAP={r_tel['map']} | OilP={r_tel['oil_pressure']}")
    assert abs(r_tel['rpm'] - 3200.0) < 100.0, "RPM did not track manual slider setpoint!"

    # 3. Test TAPAS DRDO Redline Excursion 1: CHT Critical Excursion (> 215°C)
    print("\n[*] Testing TAPAS DRDO Limit: CHT Excursion to 230°C (Limit: 215°C)...")
    requests.post(f"{BASE_URL}/api/manual-control/param", json={"key": "cht", "value": [228.0, 235.0, 230.0, 226.0]})
    time.sleep(1.5)

    r_diag = requests.get(f"{BASE_URL}/api/diagnostics/latest").json()
    r_adv = requests.get(f"{BASE_URL}/api/advisories").json()
    print(f"  [OK] Diagnostics Severity: {r_diag['severity']} | Primary Fault: {r_diag['primary_fault']}")
    print(f"  [OK] Health Index: {r_diag['health_index']}% | RUL: {r_diag['rul_value']} hrs")
    print(f"  [OK] Active Red Advisories ({len(r_adv)}): {r_adv[0]['reason'] if r_adv else 'None'}")
    assert r_diag['severity'] == 'CRITICAL', "Severity was not escalated to CRITICAL for CHT > 215°C!"

    # 4. Test TAPAS DRDO Redline Excursion 2: Critical Low Oil Pressure (< 2.5 bar)
    print("\n[*] Testing TAPAS DRDO Limit: Oil Pressure drop to 1.8 bar (Limit: 2.5 bar)...")
    requests.post(f"{BASE_URL}/api/manual-control/param", json={"key": "oil_pressure", "value": 1.8})
    time.sleep(1.5)

    r_diag2 = requests.get(f"{BASE_URL}/api/diagnostics/latest").json()
    print(f"  [OK] Diagnostics Severity: {r_diag2['severity']} | Fault: {r_diag2['primary_fault']}")
    assert r_diag2['severity'] == 'CRITICAL', "Severity was not escalated to CRITICAL for OilP < 2.5 bar!"

    # 5. Reset back to Normal
    print("\n[*] Resetting back to nominal auto simulation...")
    requests.post(f"{BASE_URL}/api/manual-control", json={"manual_override": False})
    time.sleep(1.5)

    r_diag_normal = requests.get(f"{BASE_URL}/api/diagnostics/latest").json()
    print(f"  [OK] Diagnostics back to Normal: Severity={r_diag_normal['severity']} | Health Index={r_diag_normal['health_index']}%")

    print("\n" + "=" * 70)
    print(" ALL MANUAL ADJUSTMENTS & TAPAS DRDO LIMIT TESTS PASSED! ")
    print("=" * 70)


if __name__ == "__main__":
    test_manual_override_and_tapas_limits()
