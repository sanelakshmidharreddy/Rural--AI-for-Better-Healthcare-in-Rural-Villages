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
from backend.services.scoring import calculate_gap_score
from backend.services.recommendations import get_zone_recommendation
from backend.services.prioritization import prioritize_resources


router = APIRouter()
logger = logging.getLogger(__name__)


def make_response(data: Any, meta_override: Dict[str, Any] = None) -> Dict[str, Any]:
    default_meta = {
        "dataPeriod": "Q3 2026",
        "dataLevel": "Tirunelveli District Pilot / PHC Catchment",
        "confidence": "High (88%)",
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
        "lastUpdated": "Q3 2026",
        "zoneDataQualityList": zone_quality
    })


# --- TAMIL NADU DISTRICTS ---

TAMIL_NADU_DISTRICTS = [
    {"id": "ariyalur", "name": "Ariyalur", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "chengalpattu", "name": "Chengalpattu", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "chennai", "name": "Chennai", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "coimbatore", "name": "Coimbatore", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "cuddalore", "name": "Cuddalore", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "dharmapuri", "name": "Dharmapuri", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "dindigul", "name": "Dindigul", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "erode", "name": "Erode", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "kallakurichi", "name": "Kallakurichi", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "kanchipuram", "name": "Kanchipuram", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "kanyakumari", "name": "Kanyakumari", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "karur", "name": "Karur", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "krishnagiri", "name": "Krishnagiri", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "madurai", "name": "Madurai", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "mayiladuthurai", "name": "Mayiladuthurai", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "nagapattinam", "name": "Nagapattinam", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "namakkal", "name": "Namakkal", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "nilgiris", "name": "Nilgiris", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "perambalur", "name": "Perambalur", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "pudukkottai", "name": "Pudukkottai", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "ramanathapuram", "name": "Ramanathapuram", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "ranipet", "name": "Ranipet", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "salem", "name": "Salem", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "sivaganga", "name": "Sivaganga", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tenkasi", "name": "Tenkasi", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "thanjavur", "name": "Thanjavur", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "theni", "name": "Theni", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "thoothukudi", "name": "Thoothukudi", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tiruchirappalli", "name": "Tiruchirappalli", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tirunelveli", "name": "Tirunelveli", "region": "Southern Tamil Nadu", "hasPilot": True, "status": "Rural healthcare pilot available"},
    {"id": "tirupathur", "name": "Tirupathur", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tiruppur", "name": "Tiruppur", "region": "Western Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tiruvallur", "name": "Tiruvallur", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tiruvannamalai", "name": "Tiruvannamalai", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "tiruvarur", "name": "Tiruvarur", "region": "Central Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "vellore", "name": "Vellore", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "viluppuram", "name": "Viluppuram", "region": "Northern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"},
    {"id": "virudhunagar", "name": "Virudhunagar", "region": "Southern Tamil Nadu", "hasPilot": False, "status": "Data integration planned"}
]


@router.get("/districts")
async def get_districts():
    """GET /api/districts - List all 38 Tamil Nadu districts with pilot availability status"""
    return make_response({
        "state": "Tamil Nadu",
        "totalDistricts": len(TAMIL_NADU_DISTRICTS),
        "activePilotDistrict": "Tirunelveli",
        "districts": TAMIL_NADU_DISTRICTS
    })


@router.get("/districts/{district_id}")
async def get_district_detail(district_id: str):
    """GET /api/districts/:id - Get specific Tamil Nadu district pilot status"""
    d = next((item for item in TAMIL_NADU_DISTRICTS if item["id"].lower() == district_id.lower()), None)
    if not d:
        raise HTTPException(status_code=404, detail=f"District '{district_id}' not found in Tamil Nadu registry")
    return make_response(d)


# --- INTERVENTION REQUEST WORKFLOW ---

class InterventionRequestCreate(BaseModel):
    zoneId: str = Field(..., min_length=1)
    zoneName: str = Field(..., min_length=1)
    block: str = Field(..., min_length=1)
    interventionType: str = Field(..., min_length=1)
    resourceType: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")
    requestedDate: str = Field(..., min_length=1)
    priority: str = Field(default="High Priority")
    justification: str = Field(..., min_length=5, description="Administrative justification is required")
    notes: Optional[str] = None
    requestingOrg: str = Field(..., min_length=2)
    contactPerson: str = Field(..., min_length=2)
    contactPhone: str = Field(..., min_length=5)
    contactEmail: str = Field(..., min_length=5)


class StatusUpdateReq(BaseModel):
    status: str = Field(..., min_length=2) # Draft, Submitted, Under review, Approved, Scheduled, Completed, Rejected


def request_to_dict(req: InterventionRequest) -> Dict[str, Any]:
    return {
        "id": req.id,
        "zoneId": req.zone_id,
        "zoneName": req.zone_name,
        "block": req.block,
        "interventionType": req.intervention_type,
        "resourceType": req.resource_type,
        "quantity": req.quantity,
        "requestedDate": req.requested_date,
        "priority": req.priority,
        "justification": req.justification,
        "notes": req.notes,
        "requestingOrg": req.requesting_org,
        "contactPerson": req.contact_person,
        "contactPhone": req.contact_phone,
        "contactEmail": req.contact_email,
        "status": req.status,
        "createdAt": req.created_at.isoformat() if req.created_at else None,
        "updatedAt": req.updated_at.isoformat() if req.updated_at else None,
        "disclaimer": "This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources."
    }


@router.post("/intervention-requests")
async def create_intervention_request(
    payload: InterventionRequestCreate,
    db: Session = Depends(get_db)
):
    """POST /api/intervention-requests - Save an authorized intervention request record"""
    # Verify target zone exists
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == payload.zoneId).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Target health zone '{payload.zoneId}' not found")

    count = db.query(InterventionRequest).count() + 1
    req_id = f"NHG-2026-{count:04d}"

    db_req = InterventionRequest(
        id=req_id,
        zone_id=payload.zoneId,
        zone_name=payload.zoneName,
        block=payload.block,
        intervention_type=payload.interventionType,
        resource_type=payload.resourceType,
        quantity=payload.quantity,
        requested_date=payload.requestedDate,
        priority=payload.priority,
        justification=payload.justification,
        notes=payload.notes,
        requesting_org=payload.requestingOrg,
        contact_person=payload.contactPerson,
        contact_phone=payload.contactPhone,
        contact_email=payload.contactEmail,
        status="Submitted"
    )

    db.add(db_req)
    db.commit()
    db.refresh(db_req)

    logger.info(f"Created intervention request: {db_req.id} for zone {db_req.zone_name}")
    return make_response(request_to_dict(db_req))


@router.get("/intervention-requests")
async def list_intervention_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """GET /api/intervention-requests - List all submitted intervention requests"""
    query = db.query(InterventionRequest)
    if status_filter:
        query = query.filter(InterventionRequest.status.ilike(status_filter))
    
    requests = query.order_by(InterventionRequest.created_at.desc()).all()
    results = [request_to_dict(r) for r in requests]
    return make_response({"total": len(results), "requests": results})


@router.get("/intervention-requests/{request_id}")
async def get_intervention_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """GET /api/intervention-requests/:id - Get specific intervention request record"""
    req = db.query(InterventionRequest).filter(InterventionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail=f"Intervention request '{request_id}' not found")
    return make_response(request_to_dict(req))


@router.patch("/intervention-requests/{request_id}/status")
async def update_intervention_request_status(
    request_id: str,
    payload: StatusUpdateReq,
    db: Session = Depends(get_db)
):
    """PATCH /api/intervention-requests/:id/status - Update intervention request status"""
    req = db.query(InterventionRequest).filter(InterventionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail=f"Intervention request '{request_id}' not found")
    
    allowed_statuses = ["Draft", "Submitted", "Under review", "Approved", "Scheduled", "Completed", "Rejected"]
    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}'. Allowed: {allowed_statuses}")

    req.status = payload.status
    db.commit()
    db.refresh(req)
    return make_response(request_to_dict(req))

