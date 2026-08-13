from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, auth, schemas
from database import get_db
from schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from services import admin_promotion_service

# routers/admin/admin_promotion
router = APIRouter(
    tags=["Admin Promotions"]
)

@router.post("/", response_model=PromotionResponse)
def create_promotion(
    promo_in: PromotionCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Tạo mới một mã giảm giá."""
    return admin_promotion_service.create_promotion(db, promo_in)

@router.get("/", response_model=List[PromotionResponse])
def get_all_promotions(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Lấy danh sách toàn bộ mã giảm giá đang có trong hệ thống."""
    return admin_promotion_service.get_promotions(db)

@router.get("/{promo_id}", response_model=PromotionResponse)
def get_promotion(
    promo_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Xem chi tiết một mã giảm giá cụ thể."""
    return admin_promotion_service.get_promotion_by_id(db, promo_id)

@router.put("/{promo_id}", response_model=PromotionResponse)
def update_promotion(
    promo_id: int,
    promo_in: PromotionUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Cập nhật thông tin mã giảm giá (VD: Đổi trạng thái, đổi ngày hết hạn, đổi giá trị giảm)."""
    return admin_promotion_service.update_promotion(db, promo_id, promo_in)

@router.delete("/{promo_id}")
def delete_promotion(
    promo_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Xóa mã giảm giá khỏi hệ thống."""
    return admin_promotion_service.delete_promotion(db, promo_id)