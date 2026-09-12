"""
Local Seed Dataset for Nellai HealthGrid (Tirunelveli District Pilot)

Seeds 10 Tirunelveli Rural Health Zones / PHC Catchments with realistic,
clearly-labeled prototype healthcare indicators, workforce data, facility numbers,
historical trends, and confidence ratings across Critical, High, Moderate, and Low risk tiers.
"""
import json
import logging
from sqlalchemy.orm import Session
from backend.models import HealthFacility, HealthWorker, FacilityType, WorkerRole, RuralHealthZone

logger = logging.getLogger(__name__)

TIRUNELVELI_ZONES_SEED = [
    {
        "id": "zone-manur-01",
        "name": "Manur Catchment Zone",
        "block": "Manur",
        "district": "Tirunelveli",
        "population": 38500,
        "facility_count": 2,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 4,
        "doctor_availability": 0.2, # doctors per 10k
        "nurse_availability": 0.7, # nurses per 10k
        "medicine_availability": 30.0, # stock %
        "infrastructure_availability": 28.0,
        "immunization_coverage": 45.0,
        "maternal_care_coverage": 42.0,
        "service_utilization": 38.0,
        "nearest_facility_distance": 25.5, # km
        "mobile_unit_coverage": 10.0, # %
        "data_period": "Q3 2026",
        "data_confidence": "High (89%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Declining",
            "maternalCareTrend": "Declining",
            "medicineStockTrend": "Declining",
            "outpatientTrend": "Stable",
            "staffingTrend": "Declining",
            "referralWorkloadTrend": "Increasing"
        }
    },
    {
        "id": "zone-nanguneri-02",
        "name": "Nanguneri Rural Zone",
        "block": "Nanguneri",
        "district": "Tirunelveli",
        "population": 42000,
        "facility_count": 3,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 6,
        "doctor_availability": 0.3,
        "nurse_availability": 0.8,
        "medicine_availability": 28.0,
        "infrastructure_availability": 25.0,
        "immunization_coverage": 48.0,
        "maternal_care_coverage": 46.0,
        "service_utilization": 40.0,
        "nearest_facility_distance": 27.0,
        "mobile_unit_coverage": 12.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (91%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Declining",
            "maternalCareTrend": "Declining",
            "medicineStockTrend": "Declining",
            "outpatientTrend": "Declining",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Increasing"
        }
    },

    {
        "id": "zone-radhapuram-03",
        "name": "Radhapuram Coastal Catchment",
        "block": "Radhapuram",
        "district": "Tirunelveli",
        "population": 34200,
        "facility_count": 2,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 8,
        "doctor_availability": 0.8,
        "nurse_availability": 1.4,
        "medicine_availability": 50.0,
        "infrastructure_availability": 52.0,
        "immunization_coverage": 64.0,
        "maternal_care_coverage": 62.0,
        "service_utilization": 58.0,
        "nearest_facility_distance": 18.0,
        "mobile_unit_coverage": 25.0,
        "data_period": "Q3 2026",
        "data_confidence": "Medium (82%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Stable",
            "maternalCareTrend": "Improving",
            "medicineStockTrend": "Declining",
            "outpatientTrend": "Stable",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Increasing"
        }
    },
    {
        "id": "zone-pappakudi-04",
        "name": "Pappakudi Inland Zone",
        "block": "Pappakudi",
        "district": "Tirunelveli",
        "population": 28000,
        "facility_count": 2,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 6,
        "doctor_availability": 0.7,
        "nurse_availability": 1.3,
        "medicine_availability": 52.0,
        "infrastructure_availability": 50.0,
        "immunization_coverage": 60.0,
        "maternal_care_coverage": 58.0,
        "service_utilization": 55.0,
        "nearest_facility_distance": 16.5,
        "mobile_unit_coverage": 28.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (86%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Declining",
            "maternalCareTrend": "Stable",
            "medicineStockTrend": "Improving",
            "outpatientTrend": "Declining",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-kalakad-05",
        "name": "Kalakad Forest Border Zone",
        "block": "Kalakad",
        "district": "Tirunelveli",
        "population": 31500,
        "facility_count": 3,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 12,
        "doctor_availability": 1.2,
        "nurse_availability": 2.0,
        "medicine_availability": 65.0,
        "infrastructure_availability": 65.0,
        "immunization_coverage": 74.0,
        "maternal_care_coverage": 72.0,
        "service_utilization": 68.0,
        "nearest_facility_distance": 13.0,
        "mobile_unit_coverage": 35.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (88%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Stable",
            "maternalCareTrend": "Stable",
            "medicineStockTrend": "Stable",
            "outpatientTrend": "Improving",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-cheranmahadevi-06",
        "name": "Cheranmahadevi Catchment Zone",
        "block": "Cheranmahadevi",
        "district": "Tirunelveli",
        "population": 36000,
        "facility_count": 4,
        "facility_types": "Community Health Center, Primary Health Center",
        "bed_count": 24,
        "doctor_availability": 1.4,
        "nurse_availability": 2.5,
        "medicine_availability": 72.0,
        "infrastructure_availability": 70.0,
        "immunization_coverage": 80.0,
        "maternal_care_coverage": 78.0,
        "service_utilization": 75.0,
        "nearest_facility_distance": 10.0,
        "mobile_unit_coverage": 45.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (90%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Improving",
            "maternalCareTrend": "Improving",
            "medicineStockTrend": "Stable",
            "outpatientTrend": "Improving",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-kadayam-07",
        "name": "Kadayam Foothill Zone",
        "block": "Kadayam",
        "district": "Tirunelveli",
        "population": 29800,
        "facility_count": 2,
        "facility_types": "Primary Health Center, Sub Center",
        "bed_count": 10,
        "doctor_availability": 1.3,
        "nurse_availability": 2.1,
        "medicine_availability": 62.0,
        "infrastructure_availability": 68.0,
        "immunization_coverage": 72.0,
        "maternal_care_coverage": 70.0,
        "service_utilization": 65.0,
        "nearest_facility_distance": 12.0,
        "mobile_unit_coverage": 40.0,
        "data_period": "Q3 2026",
        "data_confidence": "Medium (78%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Stable",
            "maternalCareTrend": "Stable",
            "medicineStockTrend": "Declining",
            "outpatientTrend": "Insufficient data",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-ambasamudram-08",
        "name": "Ambasamudram PHC Catchment",
        "block": "Ambasamudram",
        "district": "Tirunelveli",
        "population": 45000,
        "facility_count": 5,
        "facility_types": "Taluk Hospital, Community Health Center, PHC",
        "bed_count": 45,
        "doctor_availability": 2.1,
        "nurse_availability": 3.8,
        "medicine_availability": 90.0,
        "infrastructure_availability": 88.0,
        "immunization_coverage": 94.0,
        "maternal_care_coverage": 92.0,
        "service_utilization": 90.0,
        "nearest_facility_distance": 4.0,
        "mobile_unit_coverage": 75.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (94%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Improving",
            "maternalCareTrend": "Improving",
            "medicineStockTrend": "Improving",
            "outpatientTrend": "Improving",
            "staffingTrend": "Improving",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-palayamkottai-09",
        "name": "Palayamkottai Peri-urban Zone",
        "block": "Palayamkottai",
        "district": "Tirunelveli",
        "population": 49000,
        "facility_count": 6,
        "facility_types": "District Hospital, CHC, PHC",
        "bed_count": 70,
        "doctor_availability": 2.5,
        "nurse_availability": 4.2,
        "medicine_availability": 95.0,
        "infrastructure_availability": 94.0,
        "immunization_coverage": 96.0,
        "maternal_care_coverage": 95.0,
        "service_utilization": 92.0,
        "nearest_facility_distance": 2.5,
        "mobile_unit_coverage": 80.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (96%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Improving",
            "maternalCareTrend": "Improving",
            "medicineStockTrend": "Improving",
            "outpatientTrend": "Improving",
            "staffingTrend": "Improving",
            "referralWorkloadTrend": "Stable"
        }
    },
    {
        "id": "zone-valliyur-10",
        "name": "Valliyur Central Zone",
        "block": "Valliyur",
        "district": "Tirunelveli",
        "population": 37400,
        "facility_count": 4,
        "facility_types": "Taluk Hospital, PHC, Sub Center",
        "bed_count": 35,
        "doctor_availability": 2.0,
        "nurse_availability": 3.5,
        "medicine_availability": 88.0,
        "infrastructure_availability": 86.0,
        "immunization_coverage": 92.0,
        "maternal_care_coverage": 90.0,
        "service_utilization": 88.0,
        "nearest_facility_distance": 5.0,
        "mobile_unit_coverage": 70.0,
        "data_period": "Q3 2026",
        "data_confidence": "High (92%)",
        "is_prototype_data": "true",
        "historical_indicators": {
            "immunizationTrend": "Improving",
            "maternalCareTrend": "Improving",
            "medicineStockTrend": "Stable",
            "outpatientTrend": "Improving",
            "staffingTrend": "Stable",
            "referralWorkloadTrend": "Stable"
        }
    }
]


def seed_prototype_dataset(db: Session):
    """Seed database with Tirunelveli Rural Health Zones and Facilities"""
    try:
        # Clear existing entries to re-seed cleanly with calibrated risk tiers
        db.query(RuralHealthZone).delete()
        db.query(HealthFacility).delete()
        db.commit()

        logger.info("Seeding database with calibrated Tirunelveli Rural Health Zones dataset...")
        for zone_item in TIRUNELVELI_ZONES_SEED:
            hist = zone_item.pop("historical_indicators")
            db_zone = RuralHealthZone(
                **zone_item,
                historical_indicators_json=json.dumps(hist)
            )
            db.add(db_zone)
            
            facility_type_enum = FacilityType.PRIMARY_HEALTH_CENTER
            if "Taluk" in db_zone.facility_types:
                facility_type_enum = FacilityType.TALUK_HOSPITAL
            elif "Community" in db_zone.facility_types:
                facility_type_enum = FacilityType.COMMUNITY_HEALTH_CENTER
            elif "District" in db_zone.facility_types:
                facility_type_enum = FacilityType.DISTRICT_HOSPITAL

            sample_facility = HealthFacility(
                name=f"{db_zone.name} Main PHC",
                facility_type=facility_type_enum,
                district="Tirunelveli",
                taluk=db_zone.block,
                village=f"{db_zone.block} Central",
                bed_capacity=db_zone.bed_count,
                operational_status="operational"
            )
            db.add(sample_facility)

        db.commit()
        logger.info("Database seeding completed successfully for 10 Tirunelveli health zones.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {str(e)}")
