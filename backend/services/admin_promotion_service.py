from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas
from repositories import promotion_repository
# services/admin_promotion_service.py
def create_promotion(db: Session, promo_in: schemas.PromotionCreate):
    try:
        # Check if code exists
        existing_promo = promotion_repository.get_promotion_by_code(db, promo_in.code)
        if existing_promo:
            raise HTTPException(status_code=400, detail="Promotion code already exists.")
        
        new_promo = models.Promotion(**promo_in.model_dump())
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