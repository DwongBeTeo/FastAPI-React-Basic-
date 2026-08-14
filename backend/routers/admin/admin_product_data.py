# routers/admin/admin_product_data.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models, auth, schemas
from database import get_db
from schemas.data_access import ProductDataCreate, ProductDataUpdate, ProductDataResponse
from services import admin_product_data_service

router = APIRouter(
    tags=["Admin Product Data"]
)

@router.post("/", response_model=ProductDataResponse)
def create_data(
    data_in: ProductDataCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Admin thêm dữ liệu thực tế cho một Sản phẩm (Báo cáo/Tồn kho...)"""
    return admin_product_data_service.create_product_data(db, data_in)

@router.get("/", response_model=schemas.PaginatedProductDataResponse)
def read_all_data(
    product_id: Optional[int] = Query(None, description="Lọc theo ID Sản phẩm"),
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Admin xem toàn bộ dữ liệu thực tế đang có trong hệ thống"""
    return admin_product_data_service.get_all_product_data(db, product_id, skip, limit)

@router.put("/{data_id}", response_model=ProductDataResponse)
def update_data(
    data_id: int, 
    data_in: ProductDataUpdate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Admin chỉnh sửa nội dung dữ liệu"""
    return admin_product_data_service.update_product_data(db, data_id, data_in)

@router.delete("/{data_id}")
def delete_data(
    data_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Admin xóa một dòng dữ liệu"""
    return admin_product_data_service.delete_product_data(db, data_id)