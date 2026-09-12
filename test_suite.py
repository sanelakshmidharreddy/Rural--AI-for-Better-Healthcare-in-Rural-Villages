"""
Automated Verification Suite for Nellai HealthGrid MVP
Tests all existing and enhanced endpoints, data models, validation rules, 
district directory, simulator disclaimers, and intervention request workflows.
"""
import httpx
import json
import sys
import os

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
        print("[PASS] 1. GET /api/overview — 10 zones analysed, 2 Critical, 2 High")
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
        print("[PASS] 2. GET /api/zones — 10 zones sorted descending; risk_level=critical returned 2 zones")
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
        print(f"[PASS] 3. GET /api/zones/zone-manur-01 — Zone Score: {zd['scoreBreakdown']['overallScore']} ({zd['scoreBreakdown']['riskCategory']} Risk)")
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
        print("[PASS] 4. GET /api/zones/zone-manur-01/risk-breakdown — 5 sub-gap components calculated")
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

    # 6. Test Resource Prioritization What-If Endpoint & Disclaimers
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
        assert "simulationDisclaimer" in p_res["allocationSummary"]
        assert "Simulation only" in p_res["allocationSummary"]["simulationDisclaimer"]
        
        top_alloc = p_res["prioritizedAllocations"][0]
        assert top_alloc["projectedPostAllocationScore"] < top_alloc["initialGapScore"]
        assert top_alloc["projectedPostAllocationScore"] >= 15.0, "Score floor should prevent unrealistic zero score"
        print(f"[PASS] 6. POST /api/resource-prioritization — Disclaimer present, score {top_alloc['initialGapScore']} -> {top_alloc['projectedPostAllocationScore']}")
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
        print("[PASS] 7. GET /api/trends — District trend signals fetched successfully")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 7. GET /api/trends — {e}")
        failed += 1

    # 8. Test Data Quality & Corrected Metadata Labels
    try:
        r = httpx.get(f"{BASE_URL}/data-quality")
        assert r.status_code == 200
        dq = r.json()["data"]
        assert "Prototype scenario" in dq["dataPeriod"] or "Prototype scenario" in dq["lastUpdated"]
        assert "Q3 2026" not in dq["lastUpdated"], "Misleading Q3 2026 label must be replaced"
        assert dq["districtDataConfidenceAvg"] == "High (89%)"
        print("[PASS] 8. GET /api/data-quality — Truthful data period label confirmed")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 8. GET /api/data-quality — {e}")
        failed += 1

    # 9. Test Tamil Nadu 38 Districts Directory Endpoint
    try:
        r = httpx.get(f"{BASE_URL}/districts")
        assert r.status_code == 200
        res = r.json()["data"]
        assert res["totalDistricts"] == 38, f"Expected 38 districts, got {res['totalDistricts']}"
        assert res["activePilotDistricts"] == 1
        districts = res["districts"]
        
        # Tirunelveli must have active pilot
        tnv = next(d for d in districts if d["id"] == "tirunelveli")
        assert tnv["hasActivePilot"] is True
        assert tnv["openDashboardAvailable"] is True
        assert "Rural healthcare pilot available" in tnv["pilotStatus"]
        
        # Other districts must show planned
        madurai = next(d for d in districts if d["id"] == "madurai")
        assert madurai["hasActivePilot"] is False
        assert "Coming soon" in madurai["dataAvailabilityStatus"]
        assert "Data integration planned" in madurai["pilotStatus"]
        print("[PASS] 9. GET /api/districts — All 38 Tamil Nadu districts listed; Tirunelveli active, others coming soon")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 9. GET /api/districts — {e}")
        failed += 1

    # 10. Test District By ID Endpoint
    try:
        r_tnv = httpx.get(f"{BASE_URL}/districts/tirunelveli")
        assert r_tnv.status_code == 200
        assert r_tnv.json()["data"]["district"]["hasActivePilot"] is True
        
        r_other = httpx.get(f"{BASE_URL}/districts/coimbatore")
        assert r_other.status_code == 200
        assert r_other.json()["data"]["district"]["hasActivePilot"] is False
        print("[PASS] 10. GET /api/districts/:id — Tirunelveli and Coimbatore detail routes verified")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 10. GET /api/districts/:id — {e}")
        failed += 1

    # 11. Test Intervention Request Validation: Invalid Quantity Rejected
    try:
        invalid_qty_payload = {
            "zoneId": "zone-manur-01",
            "interventionType": "Mobile Medical Unit",
            "resourceType": "Mobile Medical Unit",
            "quantity": 0, # Invalid <= 0
            "requestedDate": "2026-09-20",
            "priority": "High",
            "justification": "Urgent gap in Manur block",
            "requestingOrganization": "District Health Society",
            "contactPerson": "Dr. Test Officer"
        }
        r = httpx.post(f"{BASE_URL}/intervention-requests", json=invalid_qty_payload)
        assert r.status_code in [400, 422], f"Expected 400 or 422 for quantity=0, got {r.status_code}"
        print("[PASS] 11. POST /api/intervention-requests — Invalid quantity (0) rejected as expected")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 11. POST /api/intervention-requests (Invalid quantity) — {e}")
        failed += 1

    # 12. Test Intervention Request Validation: Missing Justification Rejected
    try:
        missing_just_payload = {
            "zoneId": "zone-manur-01",
            "interventionType": "Mobile Medical Unit",
            "resourceType": "Mobile Medical Unit",
            "quantity": 2,
            "requestedDate": "2026-09-20",
            "priority": "High",
            "justification": "   ", # Empty justification
            "requestingOrganization": "District Health Society",
            "contactPerson": "Dr. Test Officer"
        }
        r = httpx.post(f"{BASE_URL}/intervention-requests", json=missing_just_payload)
        assert r.status_code in [400, 422], f"Expected 400 or 422 for empty justification, got {r.status_code}"
        print("[PASS] 12. POST /api/intervention-requests — Missing justification rejected as expected")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 12. POST /api/intervention-requests (Missing justification) — {e}")
        failed += 1

    # 13. Test Intervention Request Valid Submission & ID Generation
    created_request_id = None
    try:
        valid_payload = {
            "zoneId": "zone-manur-01",
            "zoneName": "Manur Catchment Zone",
            "block": "Manur",
            "district": "Tirunelveli",
            "interventionType": "Mobile Medical Unit & Remote Immunization Outreach",
            "resourceType": "Mobile Medical Unit",
            "quantity": 2,
            "requestedDate": "2026-09-25",
            "priority": "Immediate",
            "justification": "Manur catchment has severe referral distance barriers (25.5 km) and doctor density at 0.2/10k.",
            "notes": "Coordinate with Gram Panchayat President for clinic site.",
            "requestingOrganization": "Tirunelveli District Mobile Health Unit Division",
            "contactPerson": "Dr. S. Ramanathan, BMO",
            "contactPhone": "+91 94430 12345",
            "contactEmail": "bmo.manur@tnhealth.gov.in"
        }
        r = httpx.post(f"{BASE_URL}/intervention-requests", json=valid_payload)
        assert r.status_code in [200, 201], f"Expected 200/201, got {r.status_code}"
        res_data = r.json()["data"]
        req = res_data["request"]
        created_request_id = req["id"]
        assert "NHG-2026-" in created_request_id, f"Invalid ID format: {created_request_id}"
        assert req["status"] == "Submitted for review"
        assert "This prototype records an intervention request" in res_data["notice"]
        print(f"[PASS] 13. POST /api/intervention-requests — Valid request recorded: {created_request_id} (Status: {req['status']})")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 13. POST /api/intervention-requests (Valid submission) — {e}")
        failed += 1

    # 14. Test List Intervention Requests & Fetch Single Request
    try:
        r_list = httpx.get(f"{BASE_URL}/intervention-requests")
        assert r_list.status_code == 200
        req_list = r_list.json()["data"]["requests"]
        assert len(req_list) >= 1
        assert any(x["id"] == created_request_id for x in req_list)
        
        # Test Get Single Request
        r_single = httpx.get(f"{BASE_URL}/intervention-requests/{created_request_id}")
        assert r_single.status_code == 200
        single_req = r_single.json()["data"]["request"]
        assert single_req["id"] == created_request_id
        assert single_req["zoneId"] == "zone-manur-01"
        print(f"[PASS] 14. GET /api/intervention-requests — {len(req_list)} requests listed; retrieved {created_request_id}")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 14. GET /api/intervention-requests — {e}")
        failed += 1

    # 15. Test Update Request Status (PATCH)
    try:
        patch_payload = {
            "status": "Under review",
            "notes": "Assigned to Deputy Director of Health Services for field verification."
        }
        r_patch = httpx.patch(f"{BASE_URL}/intervention-requests/{created_request_id}/status", json=patch_payload)
        assert r_patch.status_code == 200
        updated_req = r_patch.json()["data"]["request"]
        assert updated_req["status"] == "Under review"
        print(f"[PASS] 15. PATCH /api/intervention-requests/:id/status — Updated {created_request_id} status to '{updated_req['status']}'")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 15. PATCH /api/intervention-requests/:id/status — {e}")
        failed += 1

    # 16. Test Frontend Server & HTML Integration
    try:
        r = httpx.get(FRONTEND_URL)
        assert r.status_code == 200
        assert "Nellai HealthGrid" in r.text
        r_proxy = httpx.get(f"{FRONTEND_URL}/api/overview")
        assert r_proxy.status_code == 200
        print("[PASS] 16. Frontend Dev Server (http://localhost:3000) — HTML 200 OK & /api proxy operational")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 16. Frontend Dev Server — {e}")
        failed += 1

    # 17. Verify Documentation & Metadata Files
    try:
        assert os.path.exists("data_sources.md"), "data_sources.md missing"
        assert os.path.exists("data_dictionary.md"), "data_dictionary.md missing"
        assert os.path.exists("data_limitations.md"), "data_limitations.md missing"
        assert os.path.exists("data/metadata.json"), "data/metadata.json missing"
        print("[PASS] 17. Governance Documents — data_sources.md, data_dictionary.md, data_limitations.md, data/metadata.json verified")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 17. Governance Documents — {e}")
        failed += 1

    print("\n==================================================")
    print(f"  TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
