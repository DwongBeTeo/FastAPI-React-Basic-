# routers/ request_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from database import get_db
from services import request_service

router = APIRouter(
    prefix="/requests",
    tags=["User Data Requests"]
)

@router.post("/", response_model=schemas.DataRequestResponse)
def submit_data_request(
    request_data: schemas.DataRequestCreate, 
    db: Session = Depends(get_db),
    # must have role "USER". if not will blocked
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    API nhận dữ liệu từ bước cuối cùng của Wizard (Review & Submit).
    """
    return request_service.create_request(db, request_data, current_user.id)

@router.get("/me", response_model=List[schemas.DataRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    API đổ dữ liệu cho trang My Requests của user.
    """
    return request_service.get_my_requests(db, current_user.id)