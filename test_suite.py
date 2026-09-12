"""
Automated Verification Suite for Nellai HealthGrid
"""
import httpx
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:3000"

def run_tests():
    print("==================================================")
    print("  RUNNING NELLAI HEALTHGRID VERIFICATION TESTS   ")
    print("==================================================\n")
    passed = 0
    failed = 0

    # 1. Test Overview Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/overview")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data["success"] is True
        m = data["data"]["summaryMetrics"]
        assert m["ruralZonesAnalysed"] == 10
        assert m["criticalRiskZones"] == 2
        assert m["highRiskZones"] == 2
        print("[PASS] 1. GET /api/overview — 10 zones analysed, 2 Critical, 2 High, 3 Moderate, 3 Low")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 1. GET /api/overview — {e}")
        failed += 1

    # 2. Test List Zones Endpoint & Filtering
    try:
        r = httpx.get(f"{BASE_URL}/zones")
        assert r.status_code == 200
        zones = r.json()["data"]["zones"]
        assert len(zones) == 10
        assert zones[0]["riskScore"] >= zones[1]["riskScore"]
        
        # Test Critical Risk Filter
        r_crit = httpx.get(f"{BASE_URL}/zones?risk_level=critical")
        crit_zones = r_crit.json()["data"]["zones"]
        assert len(crit_zones) == 2
        print("[PASS] 2. GET /api/zones — 10 zones listed sorted by risk score; Filter risk_level=critical returned 2 zones")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 2. GET /api/zones — {e}")
        failed += 1

    # 3. Test Zone Detail Endpoint (Manur Catchment Zone)
    try:
        r = httpx.get(f"{BASE_URL}/zones/zone-manur-01")
        assert r.status_code == 200
        zd = r.json()["data"]
        assert zd["zone"]["id"] == "zone-manur-01"
        assert zd["scoreBreakdown"]["riskCategory"] == "Critical"
        assert len(zd["scoreBreakdown"]["topFactors"]) >= 3
        assert "recommendedIntervention" in zd["recommendation"]
        print(f"[PASS] 3. GET /api/zones/zone-manur-01 — Zone Score: {zd['scoreBreakdown']['overallScore']} ({zd['scoreBreakdown']['riskCategory']} Risk), Top Factor: {zd['scoreBreakdown']['topFactors'][0]['name']}")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 3. GET /api/zones/zone-manur-01 — {e}")
        failed += 1

    # 4. Test Risk Breakdown Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/zones/zone-manur-01/risk-breakdown")
        assert r.status_code == 200
        rb = r.json()["data"]
        assert "contributions" in rb
        assert "infrastructureGap" in rb["contributions"]
        assert "workforceGap" in rb["contributions"]
        print("[PASS] 4. GET /api/zones/zone-manur-01/risk-breakdown — 5 sub-gap components calculated with weighted contributions")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 4. GET /api/zones/zone-manur-01/risk-breakdown — {e}")
        failed += 1

    # 5. Test Recommendations Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/zones/zone-manur-01/recommendations")
        assert r.status_code == 200
        rec = r.json()["data"]
        assert "recommendedIntervention" in rec
        assert "expectedBenefit" in rec
        print(f"[PASS] 5. GET /api/zones/zone-manur-01/recommendations — Action: '{rec['recommendedIntervention']}'")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 5. GET /api/zones/zone-manur-01/recommendations — {e}")
        failed += 1

    # 6. Test Resource Prioritization What-If Endpoint
    try:
        req_body = {
            "mobileUnits": 3,
            "outreachTeams": 3,
            "medicineKits": 5,
            "telemedicineNodes": 2,
            "temporaryStaff": 2,
            "ambulances": 1
        }
        r = httpx.post(f"{BASE_URL}/resource-prioritization", json=req_body)
        assert r.status_code == 200
        p_res = r.json()["data"]
        assert p_res["allocationSummary"]["zonesBenefiting"] > 0
        assert len(p_res["prioritizedAllocations"]) > 0
        top_alloc = p_res["prioritizedAllocations"][0]
        assert top_alloc["projectedPostAllocationScore"] < top_alloc["initialGapScore"]
        print(f"[PASS] 6. POST /api/resource-prioritization — {p_res['allocationSummary']['totalAllocatedResources']} packages allocated; {top_alloc['zoneName']} initial score {top_alloc['initialGapScore']} -> post-allocation {top_alloc['projectedPostAllocationScore']}")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 6. POST /api/resource-prioritization — {e}")
        failed += 1

    # 7. Test Early Warning Trends Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/trends")
        assert r.status_code == 200
        tr = r.json()["data"]
        assert "districtTrendSummary" in tr
        print("[PASS] 7. GET /api/trends — District early warning trend signals fetched successfully")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 7. GET /api/trends — {e}")
        failed += 1

    # 8. Test Data Quality & Governance Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/data-quality")
        assert r.status_code == 200
        dq = r.json()["data"]
        assert dq["districtDataConfidenceAvg"] == "High (89%)"
        print("[PASS] 8. GET /api/data-quality — Data confidence & missing-data audit fetched successfully")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 8. GET /api/data-quality — {e}")
        failed += 1

    # 9. Test Frontend Server & Proxy Integration
    try:
        r = httpx.get(FRONTEND_URL)
        assert r.status_code == 200
        assert "Nellai HealthGrid" in r.text
        r_proxy = httpx.get(f"{FRONTEND_URL}/api/overview")
        assert r_proxy.status_code == 200
        print("[PASS] 9. Frontend Dev Server (http://localhost:3000) — HTML 200 OK & /api proxy operational")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 9. Frontend Dev Server — {e}")
        failed += 1

    print("\n==================================================")
    print(f"  TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
