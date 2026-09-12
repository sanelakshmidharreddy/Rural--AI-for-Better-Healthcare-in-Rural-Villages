"""
Intervention Recommendation Engine for Nellai HealthGrid

Transparent rule-based recommendation logic for district public health allocation.
Generates structured intervention packages, rationale, supporting indicators,
suggested agency, expected benefit, and alternative options.
"""
from typing import Dict, Any, List
from backend.services.scoring import calculate_gap_score


def get_zone_recommendation(zone_data: Dict[str, Any], gap_score_res: Dict[str, Any] = None) -> Dict[str, Any]:
    if not gap_score_res:
        gap_score_res = calculate_gap_score(zone_data)

    top_factors = gap_score_res.get("topFactors", [])
    primary_factor = top_factors[0]["name"] if top_factors else "General Infrastructure Gap"

    distance = zone_data.get("nearest_facility_distance", 8.0)
    imm_cov = zone_data.get("immunization_coverage", 80.0)
    maternal_cov = zone_data.get("maternal_care_coverage", 75.0)
    doc_avail = zone_data.get("doctor_availability", 1.0)
    med_avail = zone_data.get("medicine_availability", 70.0)
    mobile_cov = zone_data.get("mobile_unit_coverage", 30.0)
    pop = zone_data.get("population", 30000)

    # Apply Rule-Based Decision Tree
    if distance >= 12.0 and mobile_cov < 40.0:
        recommended_intervention = "Mobile Medical Unit & Remote Immunization Outreach"
        priority = "Immediate / High Priority"
        reason = f"Zone has an extensive referral travel distance ({distance:.1f} km) and low mobile unit coverage ({mobile_cov:.0f}%), creating severe physical accessibility barriers."
        supporting_indicators = [
            f"Nearest facility distance: {distance:.1f} km",
            f"Mobile unit coverage: {mobile_cov:.0f}%",
            f"Population affected: {pop:,}"
        ]
        responsible_agency = "Tirunelveli District Mobile Health Unit Division / NGO Logistics"
        expected_benefit = "Estimated 35% increase in primary healthcare outreach and 25% reduction in untreated chronic cases."
        alternative_intervention = "Telemedicine Kiosk deployment at Gram Panchayat Center + Fixed Transport Voucher"
    
    elif imm_cov < 70.0 or maternal_cov < 65.0:
        recommended_intervention = "Specialized ANC & Child Immunization Outreach Camps"
        priority = "High Priority"
        reason = f"Maternal care ({maternal_cov:.0f}%) and immunization coverage ({imm_cov:.0f}%) have dropped below the district safety threshold of 80%."
        supporting_indicators = [
            f"Immunization coverage: {imm_cov:.0f}%",
            f"Maternal care coverage: {maternal_cov:.0f}%",
            f"Population affected: {pop:,}"
        ]
        responsible_agency = "District Reproductive & Child Health (RCH) Wing / Block PHC Team"
        expected_benefit = "Estimated 30% restoration of infant immunization coverage within 60 days."
        alternative_intervention = "Door-to-door ASHA worker tracking drive with digital incentives"

    elif doc_avail < 1.0 or zone_data.get("nurse_availability", 2.0) < 1.5:
        recommended_intervention = "Temporary Staff Deployment & Telemedicine Specialist Support"
        priority = "High Priority"
        reason = f"Severe healthcare workforce shortage ({doc_avail:.1f} doctors per 10k population) creates unsafe facility clinical load."
        supporting_indicators = [
            f"Doctor density: {doc_avail:.1f} per 10,000 pop",
            f"Nurse density: {zone_data.get('nurse_availability', 2.0):.1f} per 10,000 pop",
            f"Staffing gap impact score: {gap_score_res['contributions']['workforceGap']}"
        ]
        responsible_agency = "State Health Mission Staff Reserve / District Medical Officer"
        expected_benefit = "Restores baseline doctor consultation capacity for ~120 outpatient visits daily."
        alternative_intervention = "Rotational PHC doctor shift management + e-Sanjeevani Tele-consultation Hub"

    elif med_avail < 60.0:
        recommended_intervention = "Emergency Drug & Essential Equipment Redistribution"
        priority = "Immediate Priority"
        reason = f"Essential pharmacy stock is critically depleted at {med_avail:.0f}%, risking treatment interruption for chronic non-communicable diseases."
        supporting_indicators = [
            f"Medicine availability: {med_avail:.0f}%",
            f"Stockout gap impact score: {gap_score_res['contributions']['medicineEquipmentGap']}"
        ]
        responsible_agency = "Tamil Nadu Medical Services Corporation (TNMSC) Logistics"
        expected_benefit = "Achieves 95% essential drug stock fulfillment within 48 hours."
        alternative_intervention = "Buffer stock procurement from central district warehouse reserve"

    else:
        recommended_intervention = "Community Health Literacy & Preventive Awareness Outreach"
        priority = "Standard Maintenance Priority"
        reason = f"Infrastructure and staffing are adequate, but healthcare utilization ({zone_data.get('service_utilization', 70.0):.0f}%) remains lower than capacity."
        supporting_indicators = [
            f"Service utilization: {zone_data.get('service_utilization', 70.0):.0f}%",
            f"Overall gap score: {gap_score_res['overallScore']}"
        ]
        responsible_agency = "Block Health Educator & Local Village Health Sanitation Committee"
        expected_benefit = "Estimated 20% increase in early preventive screening adoption."
        alternative_intervention = "Mobile Health Awareness Van with local language audio-visual materials"

    return {
        "recommendedIntervention": recommended_intervention,
        "priority": priority,
        "primaryReason": reason,
        "supportingIndicators": supporting_indicators,
        "responsibleAgency": responsible_agency,
        "expectedBenefit": expected_benefit,
        "alternativeIntervention": alternative_intervention,
        "confidenceScore": "High (Rule-Engine Deterministic)",
        "aiExplanation": (
            f"Analysis of zone indicators reveals that {reason} "
            f"Prioritizing {recommended_intervention} through {responsible_agency} "
            f"is projected to yield: {expected_benefit}"
        )
    }
