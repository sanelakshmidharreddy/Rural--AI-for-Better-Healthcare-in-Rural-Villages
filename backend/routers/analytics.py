"""
Analytics & Decision Support API Router for Nellai HealthGrid
"""
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.database import get_db
from backend.models import RuralHealthZone, InterventionRequest
from backend.schemas import InterventionRequestCreate, InterventionRequestUpdateStatus
from backend.services.scoring import calculate_gap_score
from backend.services.recommendations import get_zone_recommendation
from backend.services.prioritization import prioritize_resources

router = APIRouter()
logger = logging.getLogger(__name__)


def make_response(data: Any, meta_override: Dict[str, Any] = None) -> Dict[str, Any]:
    default_meta = {
        "dataMode": "Prototype Demonstration Mode",
        "dataPeriod": "Prototype scenario period (Calibrated 2024-2025 RHS/HMIS Benchmarks)",
        "dataLevel": "Tirunelveli District Pilot / PHC Catchment",
        "confidence": "High (88%)",
        "dataCompleteness": "93.3%",
        "sourceReference": "MoHFW RHS / HMIS / NFHS-5 District Indicators (Calibrated Baseline)",
        "isPrototypeData": True,
        "disclaimer": "Prototype Healthcare Gap Score for decision support. Not a clinical diagnosis system."
    }
    if meta_override:
        default_meta.update(meta_override)
    return {
        "success": True,
        "data": data,
        "meta": default_meta,
        "error": None
    }


def zone_to_dict(zone: RuralHealthZone) -> Dict[str, Any]:
    hist = {}
    if zone.historical_indicators_json:
        try:
            hist = json.loads(zone.historical_indicators_json)
        except Exception:
            hist = {}
    return {
        "id": zone.id,
        "name": zone.name,
        "block": zone.block,
        "district": zone.district,
        "population": zone.population,
        "facilityCount": zone.facility_count,
        "facilityTypes": zone.facility_types,
        "bedCount": zone.bed_count,
        "doctorAvailability": zone.doctor_availability,
        "nurseAvailability": zone.nurse_availability,
        "medicineAvailability": zone.medicine_availability,
        "infrastructureAvailability": zone.infrastructure_availability,
        "immunizationCoverage": zone.immunization_coverage,
        "maternalCareCoverage": zone.maternal_care_coverage,
        "serviceUtilization": zone.service_utilization,
        "nearestFacilityDistance": zone.nearest_facility_distance,
        "mobileUnitCoverage": zone.mobile_unit_coverage,
        "dataPeriod": zone.data_period,
        "dataConfidence": zone.data_confidence,
        "isPrototypeData": True if zone.is_prototype_data == "true" else False,
        "historicalIndicators": hist
    }


class ResourceAllocationRequest(BaseModel):
    mobileUnits: int = Field(default=2, ge=0)
    outreachTeams: int = Field(default=3, ge=0)
    medicineKits: int = Field(default=5, ge=0)
    telemedicineNodes: int = Field(default=2, ge=0)
    temporaryStaff: int = Field(default=2, ge=0)
    ambulances: int = Field(default=1, ge=0)


@router.get("/overview")
async def get_district_overview(db: Session = Depends(get_db)):
    """GET /api/overview - Tirunelveli District summary metrics & risk distribution"""
    zones = db.query(RuralHealthZone).all()
    zone_dicts = [zone_to_dict(z) for z in zones]

    total_zones = len(zone_dicts)
    total_population = sum(z["population"] for z in zone_dicts)
    total_facilities = sum(z["facilityCount"] for z in zone_dicts)
    total_beds = sum(z["bedCount"] for z in zone_dicts)

    risk_counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    staff_gap_facilities = 0
    medicine_gap_facilities = 0
    mobile_units_active = 6

    scored_zones = []
    for zd in zone_dicts:
        score_res = calculate_gap_score(zd)
        cat = score_res["riskCategory"]
        risk_counts[cat] = risk_counts.get(cat, 0) + 1
        
        if zd["doctorAvailability"] < 1.0 or zd["nurseAvailability"] < 1.8:
            staff_gap_facilities += zd["facilityCount"]
        if zd["medicineAvailability"] < 65.0:
            medicine_gap_facilities += zd["facilityCount"]

        rec_res = get_zone_recommendation(zd, score_res)
        scored_zones.append({
            "id": zd["id"],
            "name": zd["name"],
            "block": zd["block"],
            "population": zd["population"],
            "riskScore": score_res["overallScore"],
            "riskCategory": cat,
            "riskColor": score_res["riskColor"],
            "mainGap": score_res["topFactors"][0]["name"] if score_res["topFactors"] else "General Infrastructure Gap",
            "recommendedIntervention": rec_res["recommendedIntervention"],
            "dataConfidence": zd["dataConfidence"]
        })

    scored_zones.sort(key=lambda x: x["riskScore"], reverse=True)

    overview_data = {
        "districtName": "Tirunelveli District",
        "subtitle": "AI-Powered Rural Healthcare Gap Detection and Resource Prioritization",
        "summaryMetrics": {
            "ruralZonesAnalysed": total_zones,
            "criticalRiskZones": risk_counts["Critical"],
            "highRiskZones": risk_counts["High"],
            "moderateRiskZones": risk_counts["Moderate"],
            "lowRiskZones": risk_counts["Low"],
            "totalPopulation": total_population,
            "totalHealthcareFacilities": total_facilities,
            "totalBeds": total_beds,
            "facilitiesWithStaffGaps": staff_gap_facilities,
            "facilitiesWithMedicineGaps": medicine_gap_facilities,
            "activeMobileUnits": mobile_units_active
        },
        "riskDistribution": [
            {"category": "Critical", "count": risk_counts["Critical"], "color": "#DC2626", "range": "76-100"},
            {"category": "High", "count": risk_counts["High"], "color": "#EA580C", "range": "51-75"},
            {"category": "Moderate", "count": risk_counts["Moderate"], "color": "#F59E0B", "range": "26-50"},
            {"category": "Low", "count": risk_counts["Low"], "color": "#10B981", "range": "0-25"}
        ],
        "topPriorityZones": scored_zones[:5],
        "districtMainGaps": [
            {"gapName": "Doctor & Nurse Workforce Shortage", "affectedZones": 4, "severity": "High"},
            {"gapName": "Essential Medicine Stock Depletion", "affectedZones": 3, "severity": "High"},
            {"gapName": "Referral Travel Distance Barriers (>15km)", "affectedZones": 3, "severity": "Critical"}
        ],
        "districtTrends": {
            "overallImmunization": "Stable (78% district avg)",
            "maternalCare": "Declining in Manur & Nanguneri",
            "essentialMedicineStock": "Critical stockout in 2 rural blocks"
        }
    }
    return make_response(overview_data)


@router.get("/zones")
async def list_zones(
    risk_level: Optional[str] = Query(None, description="Filter by Low, Moderate, High, Critical"),
    block: Optional[str] = Query(None, description="Filter by block name"),
    main_gap: Optional[str] = Query(None, description="Filter by main gap type"),
    db: Session = Depends(get_db)
):
    """GET /api/zones - List all health zones with risk scores and filters"""
    zones = db.query(RuralHealthZone).all()
    results = []

    for z in zones:
        zd = zone_to_dict(z)
        score_res = calculate_gap_score(zd)
        rec_res = get_zone_recommendation(zd, score_res)
        
        main_factor = score_res["topFactors"][0]["name"] if score_res["topFactors"] else "Infrastructure Gap"

        # Apply filters
        if risk_level and score_res["riskCategory"].lower() != risk_level.lower():
            continue
        if block and zd["block"].lower() != block.lower():
            continue
        if main_gap and main_gap.lower() not in main_factor.lower():
            continue

        results.append({
            "id": zd["id"],
            "name": zd["name"],
            "block": zd["block"],
            "district": zd["district"],
            "population": zd["population"],
            "facilityCount": zd["facilityCount"],
            "facilityTypes": zd["facilityTypes"],
            "bedCount": zd["bedCount"],
            "riskScore": score_res["overallScore"],
            "riskCategory": score_res["riskCategory"],
            "riskColor": score_res["riskColor"],
            "mainGap": main_factor,
            "recommendedIntervention": rec_res["recommendedIntervention"],
            "nearestFacilityDistance": zd["nearestFacilityDistance"],
            "dataConfidence": zd["dataConfidence"],
            "doctorAvailability": zd["doctorAvailability"],
            "medicineAvailability": zd["medicineAvailability"]
        })

    # Sort descending by risk score
    results.sort(key=lambda x: x["riskScore"], reverse=True)
    return make_response({"total": len(results), "zones": results})


@router.get("/zones/{zone_id}")
async def get_zone_detail(zone_id: str, db: Session = Depends(get_db)):
    """GET /api/zones/:id - Complete metrics & historical trend indicators for a specific zone"""
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Health zone with ID '{zone_id}' not found")
    
    zd = zone_to_dict(zone)
    score_res = calculate_gap_score(zd)
    rec_res = get_zone_recommendation(zd, score_res)

    detail_data = {
        "zone": zd,
        "scoreBreakdown": score_res,
        "recommendation": rec_res
    }
    return make_response(detail_data)


@router.get("/zones/{zone_id}/risk-breakdown")
async def get_zone_risk_breakdown(zone_id: str, db: Session = Depends(get_db)):
    """GET /api/zones/:id/risk-breakdown - 'Why this score?' factor contributions"""
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Health zone with ID '{zone_id}' not found")
    
    zd = zone_to_dict(zone)
    score_res = calculate_gap_score(zd)

    return make_response({
        "zoneId": zone.id,
        "zoneName": zone.name,
        "block": zone.block,
        "overallScore": score_res["overallScore"],
        "riskCategory": score_res["riskCategory"],
        "riskColor": score_res["riskColor"],
        "contributions": score_res["contributions"],
        "weightedContributions": score_res["weightedContributions"],
        "topFactors": score_res["topFactors"],
        "formula": "25% Infra + 25% Workforce + 20% Service + 15% Medicine + 15% Accessibility",
        "dataCompleteness": score_res["dataCompleteness"],
        "confidenceLevel": score_res["confidenceLevel"]
    })


@router.get("/zones/{zone_id}/recommendations")
async def get_zone_recommendations(zone_id: str, db: Session = Depends(get_db)):
    """GET /api/zones/:id/recommendations - Recommended intervention & expected benefit"""
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Health zone with ID '{zone_id}' not found")
    
    zd = zone_to_dict(zone)
    score_res = calculate_gap_score(zd)
    rec_res = get_zone_recommendation(zd, score_res)

    return make_response(rec_res)


@router.post("/resource-prioritization")
async def post_resource_prioritization(
    req: ResourceAllocationRequest,
    db: Session = Depends(get_db)
):
    """POST /api/resource-prioritization - Rank zones and run what-if resource allocation scenario"""
    zones = db.query(RuralHealthZone).all()
    zone_dicts = [zone_to_dict(z) for z in zones]

    resource_input = {
        "mobile_units": req.mobileUnits,
        "outreach_teams": req.outreachTeams,
        "medicine_kits": req.medicineKits,
        "telemedicine_nodes": req.telemedicineNodes,
        "temporary_staff": req.temporaryStaff,
        "ambulances": req.ambulances
    }

    prioritization_result = prioritize_resources(zone_dicts, resource_input)
    return make_response(prioritization_result)


@router.get("/trends")
async def get_district_trends(db: Session = Depends(get_db)):
    """GET /api/trends - Early warning trend indicators across health zones"""
    zones = db.query(RuralHealthZone).all()
    trends_summary = []

    for z in zones:
        zd = zone_to_dict(z)
        hist = zd.get("historicalIndicators", {})
        trends_summary.append({
            "zoneId": z.id,
            "zoneName": z.name,
            "block": z.block,
            "immunizationTrend": hist.get("immunizationTrend", "Stable"),
            "maternalCareTrend": hist.get("maternalCareTrend", "Stable"),
            "medicineStockTrend": hist.get("medicineStockTrend", "Stable"),
            "outpatientTrend": hist.get("outpatientTrend", "Stable"),
            "staffingTrend": hist.get("staffingTrend", "Stable"),
            "referralWorkloadTrend": hist.get("referralWorkloadTrend", "Stable"),
            "earlyWarningSignal": "Declining Service Signal" if hist.get("immunizationTrend") == "Declining" else "Normal Operating Signal"
        })

    return make_response({"districtTrendSummary": trends_summary})


@router.get("/data-quality")
async def get_data_quality(db: Session = Depends(get_db)):
    """GET /api/data-quality - Data confidence, periods, and missing data indicators"""
    zones = db.query(RuralHealthZone).all()
    zone_quality = []

    for z in zones:
        zone_quality.append({
            "zoneId": z.id,
            "zoneName": z.name,
            "block": z.block,
            "dataPeriod": z.data_period,
            "dataConfidence": z.data_confidence,
            "dataCompletenessScore": 95.0 if "Kadayam" not in z.name else 78.0,
            "missingIndicators": [] if "Kadayam" not in z.name else ["Historical outpatient trend"],
            "isPrototypeData": True
        })

    return make_response({
        "districtDataConfidenceAvg": "High (89%)",
        "dataGranularity": "Block & Rural PHC Catchment Level",
        "lastUpdated": "Prototype scenario period",
        "dataPeriod": "Prototype scenario period (Calibrated 2024-2025 RHS/HMIS Benchmarks)",
        "dataMode": "Prototype Demonstration Mode",
        "zoneDataQualityList": zone_quality
    })


# =====================================================================
# 38 TAMIL NADU DISTRICTS ENDPOINTS
# =====================================================================

TAMIL_NADU_DISTRICTS = [
    {"id": "ariyalur", "name": "Ariyalur", "hq": "Ariyalur", "hasActivePilot": False},
    {"id": "chengalpattu", "name": "Chengalpattu", "hq": "Chengalpattu", "hasActivePilot": False},
    {"id": "chennai", "name": "Chennai", "hq": "Chennai", "hasActivePilot": False},
    {"id": "coimbatore", "name": "Coimbatore", "hq": "Coimbatore", "hasActivePilot": False},
    {"id": "cuddalore", "name": "Cuddalore", "hq": "Cuddalore", "hasActivePilot": False},
    {"id": "dharmapuri", "name": "Dharmapuri", "hq": "Dharmapuri", "hasActivePilot": False},
    {"id": "dindigul", "name": "Dindigul", "hq": "Dindigul", "hasActivePilot": False},
    {"id": "erode", "name": "Erode", "hq": "Erode", "hasActivePilot": False},
    {"id": "kallakurichi", "name": "Kallakurichi", "hq": "Kallakurichi", "hasActivePilot": False},
    {"id": "kanchipuram", "name": "Kanchipuram", "hq": "Kanchipuram", "hasActivePilot": False},
    {"id": "kanyakumari", "name": "Kanyakumari", "hq": "Nagercoil", "hasActivePilot": False},
    {"id": "karur", "name": "Karur", "hq": "Karur", "hasActivePilot": False},
    {"id": "krishnagiri", "name": "Krishnagiri", "hq": "Krishnagiri", "hasActivePilot": False},
    {"id": "madurai", "name": "Madurai", "hq": "Madurai", "hasActivePilot": False},
    {"id": "mayiladuthurai", "name": "Mayiladuthurai", "hq": "Mayiladuthurai", "hasActivePilot": False},
    {"id": "nagapattinam", "name": "Nagapattinam", "hq": "Nagapattinam", "hasActivePilot": False},
    {"id": "namakkal", "name": "Namakkal", "hq": "Namakkal", "hasActivePilot": False},
    {"id": "nilgiris", "name": "Nilgiris", "hq": "Udhagamandalam", "hasActivePilot": False},
    {"id": "perambalur", "name": "Perambalur", "hq": "Perambalur", "hasActivePilot": False},
    {"id": "pudukkottai", "name": "Pudukkottai", "hq": "Pudukkottai", "hasActivePilot": False},
    {"id": "ramanathapuram", "name": "Ramanathapuram", "hq": "Ramanathapuram", "hasActivePilot": False},
    {"id": "ranipet", "name": "Ranipet", "hq": "Ranipet", "hasActivePilot": False},
    {"id": "salem", "name": "Salem", "hq": "Salem", "hasActivePilot": False},
    {"id": "sivaganga", "name": "Sivaganga", "hq": "Sivaganga", "hasActivePilot": False},
    {"id": "tenkasi", "name": "Tenkasi", "hq": "Tenkasi", "hasActivePilot": False},
    {"id": "thanjavur", "name": "Thanjavur", "hq": "Thanjavur", "hasActivePilot": False},
    {"id": "theni", "name": "Theni", "hq": "Theni", "hasActivePilot": False},
    {"id": "thoothukudi", "name": "Thoothukudi", "hq": "Thoothukudi", "hasActivePilot": False},
    {"id": "tiruchirappalli", "name": "Tiruchirappalli", "hq": "Tiruchirappalli", "hasActivePilot": False},
    {"id": "tirunelveli", "name": "Tirunelveli", "hq": "Tirunelveli", "hasActivePilot": True},
    {"id": "tirupathur", "name": "Tirupathur", "hq": "Tirupathur", "hasActivePilot": False},
    {"id": "tiruppur", "name": "Tiruppur", "hq": "Tiruppur", "hasActivePilot": False},
    {"id": "tiruvallur", "name": "Tiruvallur", "hq": "Tiruvallur", "hasActivePilot": False},
    {"id": "tiruvannamalai", "name": "Tiruvannamalai", "hq": "Tiruvannamalai", "hasActivePilot": False},
    {"id": "tiruvarur", "name": "Tiruvarur", "hq": "Tiruvarur", "hasActivePilot": False},
    {"id": "vellore", "name": "Vellore", "hq": "Vellore", "hasActivePilot": False},
    {"id": "viluppuram", "name": "Viluppuram", "hq": "Viluppuram", "hasActivePilot": False},
    {"id": "virudhunagar", "name": "Virudhunagar", "hq": "Virudhunagar", "hasActivePilot": False}
]


@router.get("/districts")
async def get_all_districts():
    """GET /api/districts - List all 38 Tamil Nadu districts with pilot and data availability status"""
    districts_response = []
    for d in TAMIL_NADU_DISTRICTS:
        is_tnv = d["id"] == "tirunelveli"
        districts_response.append({
            "id": d["id"],
            "name": d["name"],
            "hq": d["hq"],
            "hasActivePilot": is_tnv,
            "pilotStatus": "Rural healthcare pilot available" if is_tnv else "Data integration planned",
            "dataAvailabilityStatus": "Pilot Data Available" if is_tnv else "Coming soon",
            "blocksCount": 10 if is_tnv else None,
            "openDashboardAvailable": is_tnv
        })
    return make_response({
        "totalDistricts": len(districts_response),
        "activePilotDistricts": 1,
        "districts": districts_response
    })


@router.get("/districts/{district_id}")
async def get_district_by_id(district_id: str, db: Session = Depends(get_db)):
    """GET /api/districts/:id - District detail and pilot status"""
    norm_id = district_id.lower()
    match = next((d for d in TAMIL_NADU_DISTRICTS if d["id"] == norm_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"District '{district_id}' not found in Tamil Nadu")

    is_tnv = match["id"] == "tirunelveli"
    if is_tnv:
        zones_count = db.query(RuralHealthZone).count()
        return make_response({
            "district": {
                "id": "tirunelveli",
                "name": "Tirunelveli",
                "hq": "Tirunelveli",
                "hasActivePilot": True,
                "pilotStatus": "Rural healthcare pilot available",
                "dataAvailabilityStatus": "Pilot Data Available",
                "ruralZonesAnalysed": zones_count,
                "pilotDescription": "Operational pilot featuring 10 rural health blocks, transparent 5-factor scoring, what-if resource simulator, and intervention request tracking."
            }
        })
    else:
        return make_response({
            "district": {
                "id": match["id"],
                "name": match["name"],
                "hq": match["hq"],
                "hasActivePilot": False,
                "pilotStatus": "Data integration planned",
                "dataAvailabilityStatus": "Coming soon",
                "pilotDescription": f"Healthcare gap analysis pipeline planned for {match['name']}. HMIS and RHS data ingestion scheduled in Phase 2."
            }
        })


# =====================================================================
# INTERVENTION REQUEST WORKFLOW ENDPOINTS
# =====================================================================

def req_to_dict(req: InterventionRequest) -> Dict[str, Any]:
    return {
        "id": req.id,
        "zoneId": req.zone_id,
        "zoneName": req.zone_name,
        "block": req.block,
        "district": req.district,
        "interventionType": req.intervention_type,
        "resourceType": req.resource_type,
        "quantity": req.quantity,
        "requestedDate": req.requested_date,
        "priority": req.priority,
        "justification": req.justification,
        "notes": req.notes,
        "requestingOrganization": req.requesting_organization,
        "contactPerson": req.contact_person,
        "contactPhone": req.contact_phone,
        "contactEmail": req.contact_email,
        "status": req.status,
        "createdAt": req.created_at.isoformat() if req.created_at else "",
        "updatedAt": req.updated_at.isoformat() if req.updated_at else ""
    }


@router.post("/intervention-requests", status_code=status.HTTP_201_CREATED)
async def create_intervention_request(
    payload: InterventionRequestCreate,
    db: Session = Depends(get_db)
):
    """
    POST /api/intervention-requests - Submit an intervention request for authorized review.
    Validates zone, non-empty justification, quantity > 0, and required contact info.
    """
    # 1. Validate zone exists
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == payload.zoneId).first()
    if not zone:
        raise HTTPException(status_code=400, detail=f"Health zone with ID '{payload.zoneId}' does not exist.")

    # 2. Additional safety validation
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")
    if not payload.justification.strip():
        raise HTTPException(status_code=400, detail="Justification cannot be empty.")
    if not payload.requestingOrganization.strip():
        raise HTTPException(status_code=400, detail="Requesting organization is required.")
    if not payload.contactPerson.strip():
        raise HTTPException(status_code=400, detail="Contact person is required.")

    # 3. Generate sequential Request ID (NHG-2026-####)
    current_count = db.query(InterventionRequest).count()
    request_id = f"NHG-2026-{current_count + 1:04d}"

    new_req = InterventionRequest(
        id=request_id,
        zone_id=zone.id,
        zone_name=zone.name,
        block=zone.block,
        district=zone.district,
        intervention_type=payload.interventionType,
        resource_type=payload.resourceType,
        quantity=payload.quantity,
        requested_date=payload.requestedDate,
        priority=payload.priority,
        justification=payload.justification.strip(),
        notes=payload.notes,
        requesting_organization=payload.requestingOrganization.strip(),
        contact_person=payload.contactPerson.strip(),
        contact_phone=payload.contactPhone,
        contact_email=payload.contactEmail,
        status="Submitted for review"
    )

    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    logger.info(f"Recorded intervention request {new_req.id} for zone {new_req.zone_name}")
    return make_response({
        "request": req_to_dict(new_req),
        "message": "Intervention request recorded successfully for authorized review.",
        "notice": "This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources."
    })


@router.get("/intervention-requests")
async def list_intervention_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    zone_id: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """GET /api/intervention-requests - List recorded intervention requests with optional filters"""
    query = db.query(InterventionRequest)
    if status_filter:
        query = query.filter(InterventionRequest.status.ilike(f"%{status_filter}%"))
    if zone_id:
        query = query.filter(InterventionRequest.zone_id == zone_id)
    if priority:
        query = query.filter(InterventionRequest.priority.ilike(f"%{priority}%"))

    requests = query.order_by(InterventionRequest.created_at.desc()).all()
    return make_response({
        "total": len(requests),
        "requests": [req_to_dict(r) for r in requests],
        "notice": "This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources."
    })


@router.get("/intervention-requests/{request_id}")
async def get_intervention_request(request_id: str, db: Session = Depends(get_db)):
    """GET /api/intervention-requests/:id - Retrieve details of single intervention request"""
    req = db.query(InterventionRequest).filter(InterventionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail=f"Intervention request '{request_id}' not found.")
    return make_response({
        "request": req_to_dict(req),
        "notice": "This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources."
    })


@router.patch("/intervention-requests/{request_id}/status")
async def update_intervention_request_status(
    request_id: str,
    payload: InterventionRequestUpdateStatus,
    db: Session = Depends(get_db)
):
    """PATCH /api/intervention-requests/:id/status - Update workflow review status of an intervention request"""
    req = db.query(InterventionRequest).filter(InterventionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail=f"Intervention request '{request_id}' not found.")

    valid_statuses = [
        "Draft", "Submitted", "Submitted for review", "Under review",
        "Approved", "Scheduled", "Completed", "Rejected"
    ]
    matched_status = next((s for s in valid_statuses if s.lower() == payload.status.lower()), None)
    if not matched_status:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(valid_statuses)}"
        )

    req.status = matched_status
    if payload.notes:
        existing_notes = req.notes or ""
        req.notes = f"{existing_notes}\n[Status Update: {matched_status}]: {payload.notes}".strip()

    db.commit()
    db.refresh(req)

    return make_response({
        "request": req_to_dict(req),
        "message": f"Status updated to '{matched_status}'.",
        "notice": "This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources."
    })
