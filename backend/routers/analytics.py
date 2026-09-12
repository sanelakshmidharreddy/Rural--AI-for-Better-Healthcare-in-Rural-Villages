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
from backend.models import RuralHealthZone
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
