from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas
from repositories import promotion_repository
import string
import random

# services/admin_promotion_service.py
# 1. HELPER FUNCTIONS
def _generate_random_code(length: int = 8) -> str:
    """Sinh một chuỗi ngẫu nhiên gồm chữ in hoa và số"""
    chars = string.ascii_uppercase + string.digits
    random_str = ''.join(random.choice(chars) for _ in range(length))
    return f"PROMO-{random_str}"

def _get_or_create_unique_code(db: Session, provided_code: str | None) -> str:
    """
    Nếu Admin nhập mã: Kiểm tra xem có bị trùng không.
    Nếu Admin để trống: Tự động sinh mã mới và đảm bảo không trùng lặp trong DB.
    """
    if provided_code:
        # Trường hợp Admin tự nhập mã
        existing_promo = promotion_repository.get_promotion_by_code(db, provided_code)
        if existing_promo:
            raise HTTPException(status_code=400, detail=f"Promotion code '{provided_code}' already exists.")
        return provided_code

    # Trường hợp Admin để trống -> Hệ thống tự sinh mã
    while True:
        new_code = _generate_random_code()
        # Query DB kiểm tra xem mã vừa sinh có bị trùng không
        if not promotion_repository.get_promotion_by_code(db, new_code):
            return new_code

# 2. MAIN FUNCTION
def create_promotion(db: Session, promo_in: schemas.PromotionCreate):
    try:
        # 1. Xử lý mã Code bằng hàm Helper
        final_code = _get_or_create_unique_code(db, promo_in.code)
        
        # 2. Chuẩn bị dữ liệu Model
        promo_data = promo_in.model_dump()
        promo_data["code"] = final_code  # Ghi đè lại mã code (dù tự nhập hay tự sinh)
        
        new_promo = models.Promotion(**promo_data)
        
        # 3. Gọi Repository để lưu vào Database
        created_promo = promotion_repository.create_promotion(db, new_promo)
        db.commit()
        db.refresh(created_promo)
        return created_promo

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error during promotion creation: {str(e)}"
        )
def get_promotions(db: Session):
    """Lấy danh sách tất cả mã giảm giá (Read-only, không cần Transaction)"""
    return promotion_repository.get_all_promotions(db)

def get_promotion_by_id(db: Session, promo_id: int):
    """Lấy chi tiết 1 mã giảm giá cụ thể"""
    promo = promotion_repository.get_promotion_by_id(db, promo_id)
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found.")
    return promo

def update_promotion(db: Session, promo_id: int, promo_in: schemas.PromotionUpdate):
    """Cập nhật thông tin mã giảm giá"""
    db_promo = promotion_repository.get_promotion_by_id(db, promo_id)
    if not db_promo:
        raise HTTPException(status_code=404, detail="Promotion not found.")

    try:
        # Cập nhật các trường có thay đổi (bỏ qua những trường không gửi lên)
        update_data = promo_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_promo, key, value)
            
        updated_promo = promotion_repository.update_promotion(db, db_promo)
        db.commit()
        db.refresh(updated_promo)
        return updated_promo

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while updating promotion: {str(e)}"
        )

def delete_promotion(db: Session, promo_id: int):
    """Xóa mã giảm giá"""
    db_promo = promotion_repository.get_promotion_by_id(db, promo_id)
    if not db_promo:
        raise HTTPException(status_code=404, detail="Promotion not found.")

    try:
        promotion_repository.delete_promotion(db, db_promo)
        db.commit()
        return {"message": "Promotion deleted successfully."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while deleting promotion: {str(e)}"
        )