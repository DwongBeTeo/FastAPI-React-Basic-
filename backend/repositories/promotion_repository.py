from sqlalchemy.orm import Session
import models
#repositories/promotion_repository.py
def get_promotion_by_code(db: Session, code: str):
    """Retrieve a promotion by its unique code."""
    return db.query(models.Promotion).filter(models.Promotion.code == code).first()

def get_promotion_by_id(db: Session, promo_id: int):
    return db.query(models.Promotion).filter(models.Promotion.id == promo_id).first()

def get_all_promotions(db: Session):
    return db.query(models.Promotion).order_by(models.Promotion.id.desc()).all()

def create_promotion(db: Session, promotion: models.Promotion):
    db.add(promotion)
    db.flush()
    return promotion

def update_promotion(db: Session, promotion: models.Promotion):
    db.flush()
    return promotion

def delete_promotion(db: Session, promotion: models.Promotion):
    db.delete(promotion)
    db.flush()