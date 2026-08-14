# routers/admin/admin_request.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas, auth
from database import get_db
from services import request_service

router = APIRouter(
    tags=["Admin Data Requests"]
)

@router.get("/", response_model= schemas.PaginatedRequestResponse)
def get_all_requests(
    status: Optional[str] = Query(None, description="Lọc theo PENDING, APPROVED, REJECTED"),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    # Only ADMIN use this dependence
    current_admin: models.User = Depends(auth.get_current_admin)
):
    return request_service.get_all_requests(db, status, skip, limit)

@router.put("/{request_id}/approve", response_model=schemas.DataRequestResponse)
def approve_request(
    request_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Duyệt request và tự động sinh UserDataAccess"""
    return request_service.process_request(db, request_id, current_admin.id, action="APPROVE")

@router.put("/{request_id}/reject", response_model=schemas.DataRequestResponse)
def reject_request(
    request_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Từ chối request"""
    return request_service.process_request(db, request_id, current_admin.id, action="REJECT")