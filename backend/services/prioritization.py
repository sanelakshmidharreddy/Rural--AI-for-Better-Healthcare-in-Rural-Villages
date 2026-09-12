"""
Resource Prioritization & What-If Scenario Engine for Nellai HealthGrid

Multi-criteria optimization matching limited public health resources to highest-risk
zones in Tirunelveli district.
"""
from typing import Dict, Any, List
from backend.services.scoring import calculate_gap_score
from backend.services.recommendations import get_zone_recommendation


def prioritize_resources(
    zones: List[Dict[str, Any]],
    resources: Dict[str, int]
) -> Dict[str, Any]:
    """
    Ranks zones and assigns resources dynamically based on Gap Score, Population, 
    and Resource-Gap Compatibility.
    """
    # Clone resource pool counters
    available = {
        "mobile_units": resources.get("mobile_units", 0),
        "outreach_teams": resources.get("outreach_teams", 0),
        "medicine_kits": resources.get("medicine_kits", 0),
        "telemedicine_nodes": resources.get("telemedicine_nodes", 0),
        "temporary_staff": resources.get("temporary_staff", 0),
        "ambulances": resources.get("ambulances", 0),
    }

    scored_zones = []
    for z in zones:
        score_res = calculate_gap_score(z)
        rec_res = get_zone_recommendation(z, score_res)
        scored_zones.append({
            "zone": z,
            "gap_result": score_res,
            "rec_result": rec_res
        })

    # Sort zones by gap score descending (highest risk first)
    scored_zones.sort(key=lambda item: item["gap_result"]["overallScore"], reverse=True)

    allocations = []
    total_assigned = 0

    for item in scored_zones:
        z = item["zone"]
        score_res = item["gap_result"]
        rec_res = item["rec_result"]
        overall = score_res["overallScore"]
        
        assigned_resources_for_zone = []
        projected_score_delta = 0.0

        # Check resource matches
        # 1. Mobile Medical Units
        if available["mobile_units"] > 0 and (z.get("nearest_facility_distance", 0) >= 10.0 or score_res["contributions"]["accessibilityGap"] >= 50):
            assigned_resources_for_zone.append("Mobile Medical Unit")
            available["mobile_units"] -= 1
            projected_score_delta += 18.5

        # 2. Outreach Teams
        if available["outreach_teams"] > 0 and (z.get("immunization_coverage", 100) < 75 or z.get("maternal_care_coverage", 100) < 75):
            assigned_resources_for_zone.append("Maternal & Immunization Outreach Team")
            available["outreach_teams"] -= 1
            projected_score_delta += 15.0

        # 3. Medicine Kits
        if available["medicine_kits"] > 0 and z.get("medicine_availability", 100) < 70:
            assigned_resources_for_zone.append("Essential Medicine Redistribution Kit")
            available["medicine_kits"] -= 1
            projected_score_delta += 14.0

        # 4. Telemedicine Support
        if available["telemedicine_nodes"] > 0 and (z.get("doctor_availability", 2.0) < 1.2 or score_res["contributions"]["workforceGap"] >= 40):
            assigned_resources_for_zone.append("Telemedicine Consultation Terminal")
            available["telemedicine_nodes"] -= 1
            projected_score_delta += 12.5

        # 5. Temporary Staff
        if available["temporary_staff"] > 0 and z.get("doctor_availability", 2.0) < 1.0:
            assigned_resources_for_zone.append("Temporary Doctor / ANM Staff Support")
            available["temporary_staff"] -= 1
            projected_score_delta += 16.0

        # 6. Referral Ambulances
        if available["ambulances"] > 0 and z.get("nearest_facility_distance", 0) >= 15.0:
            assigned_resources_for_zone.append("108 Referral Ambulance Unit")
            available["ambulances"] -= 1
            projected_score_delta += 10.0

        # If no targeted match but resource pool available and zone is high risk, give top general resource
        if not assigned_resources_for_zone and overall >= 50:
            for res_key, res_label in [
                ("mobile_units", "Mobile Medical Unit"),
                ("outreach_teams", "Outreach Team"),
                ("medicine_kits", "Medicine Kit"),
                ("temporary_staff", "Temporary Staff Support")
            ]:
                if available[res_key] > 0:
                    assigned_resources_for_zone.append(res_label)
                    available[res_key] -= 1
                    projected_score_delta += 10.0
                    break

        if assigned_resources_for_zone:
            total_assigned += len(assigned_resources_for_zone)
            # Realistic floor: residual infrastructure and travel friction prevents risk score dropping below 15.0
            realistic_min_score = 15.0
            post_score = round(max(realistic_min_score, overall - projected_score_delta), 1)
            # Ensure projectedPostAllocationScore is strictly less than initialGapScore
            if post_score >= overall:
                post_score = max(0.0, round(overall - 1.0, 1))
            actual_reduction = round(overall - post_score, 1)

            allocations.append({
                "zoneId": z["id"],
                "zoneName": z["name"],
                "assignedZone": z["name"],
                "block": z["block"],
                "population": z["population"],
                "initialGapScore": overall,
                "riskCategory": score_res["riskCategory"],
                "selectedResource": assigned_resources_for_zone[0],
                "assignedResources": assigned_resources_for_zone,
                "quantityAllocated": len(assigned_resources_for_zone),
                "projectedPostAllocationScore": post_score,
                "estimatedPostAllocationScore": post_score,
                "projectedScoreReduction": actual_reduction,
                "estimatedScoreReduction": actual_reduction,
                "allocationPriorityRank": len(allocations) + 1,
                "reason": rec_res["primaryReason"],
                "reasonForAssignment": rec_res["primaryReason"],
                "expectedBenefit": rec_res["expectedBenefit"],
                "simulationDisclaimer": "Simulation only — not an actual deployment decision."
            })

    return {
        "allocationSummary": {
            "totalAllocatedResources": total_assigned,
            "remainingUnassignedResources": available,
            "zonesBenefiting": len(allocations),
            "districtRiskReductionPct": round(min(45.0, (total_assigned * 3.8)), 1),
            "simulationDisclaimer": "Simulation only — not an actual deployment decision."
        },
        "prioritizedAllocations": allocations
    }
