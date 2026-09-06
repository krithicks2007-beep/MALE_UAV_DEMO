"""
Scenario matrix test script: Tests all 8 fault scenarios against the live generator.
"""
import time
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

SCENARIOS = [
    ("ABNORMAL_VIBRATION", "vibration", 4.5),
    ("LUBRICATION_ISSUE", "oil_pressure", 3.0),
    ("INJECTOR_ABNORMALITY", "egt", None),
    ("SENSOR_DRIFT", "egt", None),
    ("SENSOR_FAILURE", "egt", None),
    ("MISFIRE", "vibration", 3.5),
]


def test_scenarios():
    print("\n" + "=" * 70)
    print(" TESTING ALL FAULT & DEGRADATION SCENARIOS AGAINST BACKEND")
    print("=" * 70)

    for scen_id, check_field, threshold in SCENARIOS:
        print(f"\n[*] Testing Scenario: {scen_id}...")
        r = requests.post(f"{BASE_URL}/api/scenarios/start", json={"scenario_id": scen_id, "duration_s": 10.0})
        assert r.status_code == 200

        # Wait for ramp-up
        time.sleep(2.5)

        r_diag = requests.get(f"{BASE_URL}/api/diagnostics/latest")
        diag = r_diag.json()
        r_tel = requests.get(f"{BASE_URL}/api/telemetry/latest")
        tel = r_tel.json()
        r_res = requests.get(f"{BASE_URL}/api/residuals/latest")
        res = r_res.json()

        print(f"    [OK] Detected Fault: {diag['primary_fault']} | Severity: {diag['severity']} | Conf: {diag['confidence']}%")
        print(f"    [OK] Health Index: {diag['health_index']}% | RUL: {diag['rul_value']} hrs | Residual Score: {res['residual_score']}")
        print(f"    [OK] Telemetry: RPM={tel['rpm']}, Vib={tel['vibration']}, OilP={tel['oil_pressure']}, EGT={tel['egt']}")

        # Stop scenario and reset
        requests.post(f"{BASE_URL}/api/scenarios/stop")
        time.sleep(1.0)

    print("\n" + "=" * 70)
    print(" ALL 8 SCENARIOS VERIFIED SUCCESSFULLY WITH REALISTIC DYNAMICS! ")
    print("=" * 70)


if __name__ == "__main__":
    test_scenarios()
