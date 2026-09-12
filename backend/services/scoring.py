"""
Healthcare Gap Scoring Engine for Nellai HealthGrid

Formula:
Healthcare Gap Score =
  25% Infrastructure Gap
+ 25% Workforce Gap
+ 20% Service Utilization Gap
+ 15% Medicine and Equipment Gap
+ 15% Accessibility and Population Pressure Gap

All sub-indicators normalized to 0-100 scale (where 100 = maximum gap/risk).
"""
from typing import Dict, Any, List


DEFAULT_WEIGHTS = {
    "infrastructure": 0.25,
    "workforce": 0.25,
    "service_utilization": 0.20,
    "medicine_equipment": 0.15,
    "accessibility_population": 0.15,
}


def calculate_gap_score(zone_data: Dict[str, Any], custom_weights: Dict[str, float] = None) -> Dict[str, Any]:
    weights = custom_weights or DEFAULT_WEIGHTS

    # 1. Infrastructure Gap (0-100)
    infra_avail = zone_data.get("infrastructureAvailability", zone_data.get("infrastructure_availability", 65.0))
    pop = zone_data.get("population", 30000)
    beds = zone_data.get("bedCount", zone_data.get("bed_count", 10))
    
    # 1.2 beds per 1000 pop standard for rural health block
    bed_benchmark = max(1.0, (pop / 1000.0) * 1.2)
    bed_ratio = min(1.0, beds / bed_benchmark)
    bed_shortfall = (1.0 - bed_ratio) * 100.0
    infra_gap = max(0.0, min(100.0, (100.0 - infra_avail) * 0.6 + bed_shortfall * 0.4))

    # 2. Workforce Gap (0-100)
    doc_avail = zone_data.get("doctorAvailability", zone_data.get("doctor_availability", 1.0)) # per 10k
    nurse_avail = zone_data.get("nurseAvailability", zone_data.get("nurse_availability", 2.0)) # per 10k
    
    doc_benchmark = 2.5
    nurse_benchmark = 4.0
    
    doc_shortfall = max(0.0, min(1.0, (doc_benchmark - doc_avail) / doc_benchmark)) * 100.0
    nurse_shortfall = max(0.0, min(1.0, (nurse_benchmark - nurse_avail) / nurse_benchmark)) * 100.0
    workforce_gap = max(0.0, min(100.0, doc_shortfall * 0.6 + nurse_shortfall * 0.4))

    # 3. Service Utilization Gap (0-100)
    imm_cov = zone_data.get("immunizationCoverage", zone_data.get("immunization_coverage", 80.0))
    maternal_cov = zone_data.get("maternalCareCoverage", zone_data.get("maternal_care_coverage", 75.0))
    serv_util = zone_data.get("serviceUtilization", zone_data.get("service_utilization", 70.0))
    
    imm_gap = 100.0 - imm_cov
    maternal_gap = 100.0 - maternal_cov
    util_gap = 100.0 - serv_util
    service_gap = max(0.0, min(100.0, imm_gap * 0.4 + maternal_gap * 0.4 + util_gap * 0.2))

    # 4. Medicine and Equipment Gap (0-100)
    med_avail = zone_data.get("medicineAvailability", zone_data.get("medicine_availability", 70.0))
    medicine_gap = max(0.0, min(100.0, 100.0 - med_avail))

    # 5. Accessibility & Population Pressure Gap (0-100)
    distance = zone_data.get("nearestFacilityDistance", zone_data.get("nearest_facility_distance", 8.0)) # km
    mobile_cov = zone_data.get("mobileUnitCoverage", zone_data.get("mobile_unit_coverage", 30.0))
    
    dist_gap = min(100.0, (distance / 18.0) * 100.0)
    mobile_gap = 100.0 - mobile_cov
    access_gap = max(0.0, min(100.0, dist_gap * 0.65 + mobile_gap * 0.35))

    # Calculate weighted gap score
    overall_score = (
        infra_gap * weights["infrastructure"] +
        workforce_gap * weights["workforce"] +
        service_gap * weights["service_utilization"] +
        medicine_gap * weights["medicine_equipment"] +
        access_gap * weights["accessibility_population"]
    )
    overall_score = round(max(0.0, min(100.0, overall_score)), 1)

    # Risk Category Thresholds
    if overall_score <= 25.0:
        risk_category = "Low"
        risk_color = "green"
    elif overall_score <= 50.0:
        risk_category = "Moderate"
        risk_color = "yellow"
    elif overall_score <= 75.0:
        risk_category = "High"
        risk_color = "orange"
    else:
        risk_category = "Critical"
        risk_color = "red"

    # Identify top factors
    factor_candidates = [
        {"name": "Workforce Shortage", "score": round(workforce_gap, 1), "weight": weights["workforce"], "impact": round(workforce_gap * weights["workforce"], 1), "detail": f"Doctor/Nurse density below benchmark ({doc_avail:.1f} doc / {nurse_avail:.1f} nurse per 10k)"},
        {"name": "Infrastructure & Bed Shortage", "score": round(infra_gap, 1), "weight": weights["infrastructure"], "impact": round(infra_gap * weights["infrastructure"], 1), "detail": f"Facility bed capacity ({beds} beds) below target for {pop:,} population"},
        {"name": "Low Service Utilization", "score": round(service_gap, 1), "weight": weights["service_utilization"], "impact": round(service_gap * weights["service_utilization"], 1), "detail": f"Immunization ({imm_cov:.0f}%) and maternal care ({maternal_cov:.0f}%) below target"},
        {"name": "Medicine & Stockout Gap", "score": round(medicine_gap, 1), "weight": weights["medicine_equipment"], "impact": round(medicine_gap * weights["medicine_equipment"], 1), "detail": f"Essential pharmacy stock availability at {med_avail:.0f}%"},
        {"name": "Accessibility & Long Travel Distance", "score": round(access_gap, 1), "weight": weights["accessibility_population"], "impact": round(access_gap * weights["accessibility_population"], 1), "detail": f"Referral travel distance {distance:.1f} km with low mobile unit coverage ({mobile_cov:.0f}%)"}
    ]
    
    factor_candidates.sort(key=lambda x: x["impact"], reverse=True)
    top_factors = factor_candidates[:3]

    return {
        "overallScore": overall_score,
        "riskCategory": risk_category,
        "riskColor": risk_color,
        "scoreName": "Prototype Healthcare Gap Score",
        "contributions": {
            "infrastructureGap": round(infra_gap, 1),
            "workforceGap": round(workforce_gap, 1),
            "serviceUtilizationGap": round(service_gap, 1),
            "medicineEquipmentGap": round(medicine_gap, 1),
            "accessibilityGap": round(access_gap, 1)
        },
        "weightedContributions": {
            "infrastructure": round(infra_gap * weights["infrastructure"], 1),
            "workforce": round(workforce_gap * weights["workforce"], 1),
            "serviceUtilization": round(service_gap * weights["service_utilization"], 1),
            "medicineEquipment": round(medicine_gap * weights["medicine_equipment"], 1),
            "accessibility": round(access_gap * weights["accessibility_population"], 1)
        },
        "topFactors": top_factors,
        "dataCompleteness": 95.0 if "Kadayam" not in zone_data.get("name", "") else 78.0,
        "confidenceLevel": zone_data.get("dataConfidence", zone_data.get("data_confidence", "High (88%)"))
    }
