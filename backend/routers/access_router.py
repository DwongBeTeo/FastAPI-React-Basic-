# routers/access_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from database import get_db
from services import access_service
from schemas.data_access import UserDataAccessResponse, ProductDataResponse 

router = APIRouter(
    prefix="/access",
    tags=["Data Access (Dữ liệu thực tế)"]
)

@router.get("/me", response_model=List[UserDataAccessResponse])
def get_my_active_accesses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lấy danh sách các vé truy cập (Access Tickets) còn hiệu lực của user.
    Dùng để render UI danh sách sản phẩm khách hàng đã được cấp quyền.
    """
    return access_service.get_my_accesses(db, current_user.id)

@router.get("/{product_id}/data", response_model=List[ProductDataResponse])
def fetch_actual_data(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lấy dữ liệu thật của Product.
    Hệ thống sẽ tự động kiểm tra vé và chặn dữ liệu ngoài phạm vi ngày cho phép.
    """
    return access_service.get_product_data(db, current_user.id, product_id)