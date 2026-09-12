from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from backend.models import FacilityType, WorkerRole


# Health Facility Schemas
class HealthFacilityBase(BaseModel):
    """Base schema for health facility"""
    name: str = Field(..., min_length=1, max_length=255)
    facility_type: FacilityType
    district: str = Field(..., min_length=1, max_length=100)
    taluk: str = Field(..., min_length=1, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    contact_number: Optional[str] = Field(None, max_length=20)
    bed_capacity: int = Field(default=0, ge=0)
    operational_status: str = Field(default="operational", max_length=50)


class HealthFacilityCreate(HealthFacilityBase):
    """Schema for creating health facility"""
    pass


class HealthFacilityUpdate(BaseModel):
    """Schema for updating health facility"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    facility_type: Optional[FacilityType] = None
    district: Optional[str] = Field(None, min_length=1, max_length=100)
    taluk: Optional[str] = Field(None, min_length=1, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    contact_number: Optional[str] = Field(None, max_length=20)
    bed_capacity: Optional[int] = Field(None, ge=0)
    operational_status: Optional[str] = Field(None, max_length=50)


class HealthFacilityResponse(HealthFacilityBase):
    """Schema for health facility response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Health Worker Schemas
class HealthWorkerBase(BaseModel):
    """Base schema for health worker"""
    name: str = Field(..., min_length=1, max_length=255)
    role: WorkerRole
    facility_id: int = Field(..., gt=0)
    contact_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    qualification: Optional[str] = Field(None, max_length=255)
    years_of_experience: int = Field(default=0, ge=0)
    employment_status: str = Field(default="active", max_length=50)


class HealthWorkerCreate(HealthWorkerBase):
    """Schema for creating health worker"""
    pass


class HealthWorkerUpdate(BaseModel):
    """Schema for updating health worker"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[WorkerRole] = None
    facility_id: Optional[int] = Field(None, gt=0)
    contact_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    qualification: Optional[str] = Field(None, max_length=255)
    years_of_experience: Optional[int] = Field(None, ge=0)
    employment_status: Optional[str] = Field(None, max_length=50)


class HealthWorkerResponse(HealthWorkerBase):
    """Schema for health worker response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# List response schemas
class HealthFacilityListResponse(BaseModel):
    """Schema for list of health facilities"""
    total: int
    facilities: List[HealthFacilityResponse]


class HealthWorkerListResponse(BaseModel):
    """Schema for list of health workers"""
    total: int
    workers: List[HealthWorkerResponse]
