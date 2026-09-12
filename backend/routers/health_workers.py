from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from backend.database import get_db
from backend.models import HealthWorker, HealthFacility
from backend.schemas import (
    HealthWorkerCreate,
    HealthWorkerUpdate,
    HealthWorkerResponse,
    HealthWorkerListResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/workers", response_model=HealthWorkerResponse, status_code=status.HTTP_201_CREATED)
async def create_worker(
    worker: HealthWorkerCreate,
    db: Session = Depends(get_db)
):
    """Create a new health worker"""
    # Verify facility exists
    facility = db.query(HealthFacility).filter(HealthFacility.id == worker.facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health facility with ID {worker.facility_id} not found"
        )
    
    try:
        db_worker = HealthWorker(**worker.model_dump())
        db.add(db_worker)
        db.commit()
        db.refresh(db_worker)
        logger.info(f"Created health worker: {db_worker.name} (ID: {db_worker.id})")
        return db_worker
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating health worker: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create health worker"
        )


@router.get("/workers", response_model=HealthWorkerListResponse)
async def list_workers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    facility_id: Optional[int] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all health workers with optional filters"""
    try:
        query = db.query(HealthWorker)
        
        if facility_id:
            query = query.filter(HealthWorker.facility_id == facility_id)
        if role:
            query = query.filter(HealthWorker.role == role)
        
        total = query.count()
        workers = query.offset(skip).limit(limit).all()
        
        return HealthWorkerListResponse(total=total, workers=workers)
    except Exception as e:
        logger.error(f"Error listing health workers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health workers"
        )


@router.get("/workers/{worker_id}", response_model=HealthWorkerResponse)
async def get_worker(
    worker_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific health worker by ID"""
    worker = db.query(HealthWorker).filter(HealthWorker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health worker with ID {worker_id} not found"
        )
    return worker


@router.put("/workers/{worker_id}", response_model=HealthWorkerResponse)
async def update_worker(
    worker_id: int,
    worker_update: HealthWorkerUpdate,
    db: Session = Depends(get_db)
):
    """Update a health worker"""
    db_worker = db.query(HealthWorker).filter(HealthWorker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health worker with ID {worker_id} not found"
        )
    
    # If facility_id is being updated, verify it exists
    if worker_update.facility_id:
        facility = db.query(HealthFacility).filter(HealthFacility.id == worker_update.facility_id).first()
        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Health facility with ID {worker_update.facility_id} not found"
            )
    
    try:
        update_data = worker_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_worker, field, value)
        
        db.commit()
        db.refresh(db_worker)
        logger.info(f"Updated health worker: {db_worker.name} (ID: {db_worker.id})")
        return db_worker
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating health worker: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update health worker"
        )


@router.delete("/workers/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db)
):
    """Delete a health worker"""
    db_worker = db.query(HealthWorker).filter(HealthWorker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Health worker with ID {worker_id} not found"
        )
    
    try:
        db.delete(db_worker)
        db.commit()
        logger.info(f"Deleted health worker: {db_worker.name} (ID: {worker_id})")
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting health worker: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete health worker"
        )
