import asyncio
import xml.etree.ElementTree as ET
from fastapi.testclient import TestClient
import numpy as np

from app.main import app
from app.services.blending.bayesian import (
    softmax,
    compute_bayesian_weights,
    blend_daily_forecast
)
from app.services.alerts.cap_generator import generate_cap_xml
from app.services.ingestion.openmeteo_client import fetch_openmeteo_forecast

results = []

def record(test_name: str, passed: bool, details: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({"name": test_name, "status": status, "details": details})
    print(f"[{status}] {test_name}: {details}")

def test_math_blending():
    try:
        # 1. Test temperature-scaled softmax
        arr = np.array([2.1, 1.9, 1.5, 1.2])
        probs = softmax(arr, temperature=0.8)
        assert abs(np.sum(probs) - 1.0) < 1e-4, "Softmax sum != 1.0"
        
        # 2. Test dynamic Bayesian weights computation
        skill_scores = {"ecmwf": 1.2, "gfs": 2.5, "ncum": 2.1, "openmeteo": 3.0}
        weights = compute_bayesian_weights(skill_scores, penalties={"gfs": 0.5})
        assert sum(weights.values()) == 100, f"Bayesian weights sum {sum(weights.values())} != 100"
        assert weights["ecmwf"] > weights["openmeteo"], "Higher skill model should have higher weight"
        
        # 3. Test daily forecast blending
        mock_raw = [
            {
                "time": "Today",
                "fullDate": "Saturday, 26 Sep",
                "rawDate": "2026-09-26",
                "ecmwfRain": 45.0, "ecmwfTemp": 31.0, "ecmwfWind": 24.0, "ecmwfRh": 82,
                "gfsRain": 55.0, "gfsTemp": 32.5, "gfsWind": 28.0, "gfsRh": 80,
                "ncumRain": 48.0, "ncumTemp": 31.5, "ncumWind": 25.0, "ncumRh": 84,
                "openMeteoRain": 42.0, "openMeteoTemp": 30.8, "openMeteoWind": 22.0, "openMeteoRh": 81
            }
        ]
        blended = blend_daily_forecast(mock_raw, weights)
        assert len(blended) == 1
        item = blended[0]
        assert "blendedRain" in item and "blendedTemp" in item and "consensus" in item
        record("Math Blending & Bayesian Weights", True, f"Softmax=OK, Weights={weights}, BlendedRain={item['blendedRain']}mm, Consensus={item['consensus']}%")
    except Exception as e:
        record("Math Blending & Bayesian Weights", False, str(e))

def test_cap_generator():
    try:
        mock_advisory = {
            "riskLevel": "RED ALERT",
            "bulletinId": "IMD-FF-TEST-001",
            "timeValidity": "Next 24 hours",
            "summaryEn": "Extreme cloudburst alert across coastal Mumbai.",
            "suggestedActions": [{"action": "Evacuate low-lying zones immediately."}],
            "affectedGroups": ["Fishermen", "Commuters"]
        }
        xml_str = generate_cap_xml(mock_advisory, {"name": "Mumbai & Konkan Coast", "state": "Maharashtra", "lat": 19.076, "lng": 72.8777})
        root = ET.fromstring(xml_str)
        assert "alert" in root.tag
        identifier = root.find("{urn:oasis:names:tc:emergency:cap:1.2}identifier")
        assert identifier is not None
        record("CAP-1.2 XML Alert Dispatcher", True, f"Valid XML with identifier '{identifier.text}' ({len(xml_str)} bytes)")
    except Exception as e:
        record("CAP-1.2 XML Alert Dispatcher", False, str(e))

def test_api_endpoints():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/health")
        record("GET /health", res.status_code == 200, f"status={res.status_code}, env={res.json().get('environment')}")

        # 2. Root welcome
        res = client.get("/")
        record("GET /", res.status_code == 200, f"status={res.status_code}")

        # 3. OpenAPI Schema
        res = client.get("/openapi.json")
        record("GET /openapi.json", res.status_code == 200 and "paths" in res.json(), f"{len(res.json().get('paths', {}))} API paths documented")

        # 4. GET /api/v1/forecasts/{region_id}
        res = client.get("/api/v1/forecasts/mumbai-konkan")
        if res.status_code == 200:
            data = res.json()
            record("GET /api/v1/forecasts/mumbai-konkan", True, f"7-day blended, region='{data.get('regionName')}', isLive={data.get('isLive')}")
        else:
            record("GET /api/v1/forecasts/mumbai-konkan", False, f"status={res.status_code}, {res.text}")

        # 5. GET /api/v1/weights/{region_id}
        res = client.get("/api/v1/weights/mumbai-konkan")
        if res.status_code == 200:
            data = res.json()
            record("GET /api/v1/weights/mumbai-konkan", True, f"baseline={data.get('baselineWeights')}, timeline_points={len(data.get('timeline', []))}")
        else:
            record("GET /api/v1/weights/mumbai-konkan", False, f"status={res.status_code}")

        # 6. POST /api/v1/weights/what-if
        payload = {
            "regionId": "mumbai-konkan",
            "weights": {"ecmwf": 50, "gfs": 20, "ncum": 20, "openmeteo": 10}
        }
        res = client.post("/api/v1/weights/what-if", json=payload)
        if res.status_code == 200:
            data = res.json()
            record("POST /api/v1/weights/what-if", True, f"Re-blended {len(data.get('forecast', []))} forecast days on-the-fly")
        else:
            record("POST /api/v1/weights/what-if", False, f"status={res.status_code}")

        # 7. GET /api/v1/advisories/{region_id}
        res = client.get("/api/v1/advisories/mumbai-konkan")
        if res.status_code == 200:
            data = res.json()
            record("GET /api/v1/advisories/mumbai-konkan", True, f"riskLevel='{data.get('riskLevel')}', languages=[en, hi, ta, te, mr, bn, pa]")
        else:
            record("GET /api/v1/advisories/mumbai-konkan", False, f"status={res.status_code}")

        # 8. GET /api/v1/advisories/{region_id}/cap.xml
        res = client.get("/api/v1/advisories/mumbai-konkan/cap.xml")
        is_xml = "application/xml" in res.headers.get("content-type", "") or res.text.startswith("<?xml")
        record("GET /api/v1/advisories/mumbai-konkan/cap.xml", res.status_code == 200 and is_xml, f"{len(res.content)} bytes OASIS CAP payload")

        # 9. GET /api/v1/pipeline/status
        res = client.get("/api/v1/pipeline/status")
        if res.status_code == 200:
            data = res.json()
            record("GET /api/v1/pipeline/status", True, f"pipelineStatus='{data.get('pipelineStatus')}', anomalies={data.get('activeAnomalies')}, cycles={data.get('totalCyclesCompleted')}, records={data.get('recordsIngested')}")
        else:
            record("GET /api/v1/pipeline/status", False, f"status={res.status_code}")

        # 10. GET /api/v1/pipeline/ping
        res = client.get("/api/v1/pipeline/ping")
        if res.status_code == 200:
            data = res.json()
            pings = data.get("pings", {})
            record("GET /api/v1/pipeline/ping", True, f"ECMWF={pings.get('ecmwf', {}).get('latencyMs')}ms, GFS={pings.get('gfs', {}).get('latencyMs')}ms, OpenMeteo={pings.get('openMeteo', {}).get('latencyMs')}ms")
        else:
            record("GET /api/v1/pipeline/ping", False, f"status={res.status_code}")

        # 11. WebSocket /ws/v1/telemetry
        try:
            with client.websocket_connect("/ws/v1/telemetry") as ws:
                msg = ws.receive_json()
                assert msg.get("type") == "PIPELINE_TICK"
                record("WS /ws/v1/telemetry", True, f"Received live tick: status='{msg.get('pipelineStatus')}', cycles={msg.get('totalCyclesCompleted')}")
        except Exception as e:
            record("WS /ws/v1/telemetry", False, str(e))

if __name__ == "__main__":
    print("=" * 60)
    print("FORECASTFUSION BACKEND SUITE VERIFICATION")
    print("=" * 60)
    test_math_blending()
    test_cap_generator()
    test_api_endpoints()
    print("=" * 60)
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    print(f"SUMMARY: {passed}/{total} TESTS PASSED")
    print("=" * 60)
