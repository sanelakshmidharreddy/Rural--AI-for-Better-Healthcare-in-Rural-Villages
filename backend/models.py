from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from backend.database import Base


class FacilityType(str, enum.Enum):
    """Types of health facilities"""
    PRIMARY_HEALTH_CENTER = "primary_health_center"
    COMMUNITY_HEALTH_CENTER = "community_health_center"
    SUB_CENTER = "sub_center"
    DISTRICT_HOSPITAL = "district_hospital"
    TALUK_HOSPITAL = "taluk_hospital"


class WorkerRole(str, enum.Enum):
    """Roles of health workers"""
    DOCTOR = "doctor"
    NURSE = "nurse"
    ASHA_WORKER = "asha_worker"
    ANM = "anm"
    PHARMACIST = "pharmacist"
    LAB_TECHNICIAN = "lab_technician"


class HealthFacility(Base):
    """Health facility model"""
    __tablename__ = "health_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    facility_type = Column(Enum(FacilityType), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=False, index=True)
    village = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    contact_number = Column(String(20), nullable=True)
    bed_capacity = Column(Integer, default=0)
    operational_status = Column(String(50), default="operational")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workers = relationship("HealthWorker", back_populates="facility", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<HealthFacility(id={self.id}, name='{self.name}', type='{self.facility_type}')>"


class HealthWorker(Base):
    """Health worker model"""
    __tablename__ = "health_workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    role = Column(Enum(WorkerRole), nullable=False)
    facility_id = Column(Integer, ForeignKey("health_facilities.id"), nullable=False)
    contact_number = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    qualification = Column(String(255), nullable=True)
    years_of_experience = Column(Integer, default=0)
    employment_status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    facility = relationship("HealthFacility", back_populates="workers")

    def __repr__(self):
        return f"<HealthWorker(id={self.id}, name='{self.name}', role='{self.role}')>"


class RuralHealthZone(Base):
    """Rural Health Zone / PHC Catchment Area Model for Tirunelveli"""
    __tablename__ = "rural_health_zones"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    block = Column(String(100), nullable=False, index=True)
    district = Column(String(100), default="Tirunelveli", nullable=False)
    population = Column(Integer, nullable=False)
    facility_count = Column(Integer, default=1)
    facility_types = Column(String(255), nullable=False)
    bed_count = Column(Integer, default=0)
    doctor_availability = Column(Float, default=1.0) # doctors per 10k pop
    nurse_availability = Column(Float, default=2.0)  # nurses per 10k pop
    medicine_availability = Column(Float, default=70.0) # stock %
    infrastructure_availability = Column(Float, default=65.0) # infra index %
    immunization_coverage = Column(Float, default=80.0) # %
    maternal_care_coverage = Column(Float, default=75.0) # %
    service_utilization = Column(Float, default=70.0) # %
    nearest_facility_distance = Column(Float, default=8.0) # km
    mobile_unit_coverage = Column(Float, default=30.0) # %
    data_period = Column(String(50), default="Q3 2026")
    data_confidence = Column(String(50), default="High (88%)")
    is_prototype_data = Column(String(10), default="true")
    
    # Store JSON strings for historical indicators & recommendations
    historical_indicators_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<RuralHealthZone(id='{self.id}', name='{self.name}', block='{self.block}')>"


class InterventionRequest(Base):
    """Intervention Request Submission Model"""
    __tablename__ = "intervention_requests"

    id = Column(String(50), primary_key=True, index=True) # e.g. NHG-2026-0001
    zone_id = Column(String(50), nullable=False)
    zone_name = Column(String(255), nullable=False)
    block = Column(String(100), nullable=False)
    intervention_type = Column(String(255), nullable=False)
    resource_type = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    requested_date = Column(String(50), nullable=False)
    priority = Column(String(50), default="High Priority")
    justification = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    requesting_org = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    contact_email = Column(String(255), nullable=False)
    status = Column(String(50), default="Submitted") # Draft, Submitted, Under review, Approved, Scheduled, Completed, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<InterventionRequest(id='{self.id}', zone='{self.zone_name}', status='{self.status}')>"


