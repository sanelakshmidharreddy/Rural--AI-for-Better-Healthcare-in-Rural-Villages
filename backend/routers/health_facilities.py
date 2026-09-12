from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from backend.database import get_db
from backend.models import HealthFacility
from backend.schemas import (
    HealthFacilityCreate,
    HealthFacilityUpdate,
    HealthFacilityResponse,
    HealthFacilityListResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/facilities", response_model=HealthFacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility(
    facility: HealthFacilityCreate,
    db: Session = Depends(get_db)
):
    """Create a new health facility"""
    try:
        db_facility = HealthFacility(**facility.model_dump())
        db.add(db_facility)
        db.commit()
        db.refresh(db_facility)
        logger.info(f"Created health facility: {db_facility.name} (ID: {db_facility.id})")
        return db_facility
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating health facility: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create health facility"
        )


@router.get("/facilities", response_model=HealthFacilityListResponse)
async def list_facilities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    district: Optional[str] = None,
    taluk: Optional[str] = None,
    facility_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all health facilities with optional filters"""
    try:
        query = db.query(HealthFacility)
        
        if district:
            query = query.filter(HealthFacility.district == district)
        if taluk:
            query = query.filter(HealthFacility.taluk == taluk)
        if facility_type:
            query = query.filter(HealthFacility.facility_type == facility_type)
        
        total = query.count()
        facilities = query.offset(skip).limit(limit).all()
        
        return HealthFacilityListResponse(total=total, facilities=facilities)
    except Exception as e:
        logger.error(f"Error listing health facilities: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health facilities"
        )


@router.get("/facilities/{facility_id}", response_model=HealthFacilityResponse)
async def get_facility(
    facility_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific health facility by ID"""
    facility = db.query(HealthFacility).filter(HealthFacility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health facility with ID {facility_id} not found"
        )
    return facility


@router.put("/facilities/{facility_id}", response_model=HealthFacilityResponse)
async def update_facility(
    facility_id: int,
    facility_update: HealthFacilityUpdate,
    db: Session = Depends(get_db)
):
    """Update a health facility"""
    db_facility = db.query(HealthFacility).filter(HealthFacility.id == facility_id).first()
    if not db_facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health facility with ID {facility_id} not found"
        )
    
    try:
        update_data = facility_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_facility, field, value)
        
        db.commit()
        db.refresh(db_facility)
        logger.info(f"Updated health facility: {db_facility.name} (ID: {db_facility.id})")
        return db_facility
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating health facility: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update health facility"
        )


@router.delete("/facilities/{facility_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_facility(
    facility_id: int,
    db: Session = Depends(get_db)
):
    """Delete a health facility"""
    db_facility = db.query(HealthFacility).filter(HealthFacility.id == facility_id).first()
    if not db_facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health facility with ID {facility_id} not found"
        )
    
    try:
        db.delete(db_facility)
        db.commit()
        logger.info(f"Deleted health facility: {db_facility.name} (ID: {facility_id})")
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting health facility: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete health facility"
        )
