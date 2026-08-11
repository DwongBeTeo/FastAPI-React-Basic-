from sqlalchemy.orm import Session
from sqlalchemy import or_
import models

# repositories/product_price_tier_repository.py
def get_tier_by_months(db: Session, product_id: int, months: int):
    """
    Retrieve the applicable price tier based on the total calculated months.
    Logic: min_months <= months AND (max_months >= months OR max_months IS NULL)
    """
    return db.query(models.ProductPriceTier).filter(
        models.ProductPriceTier.product_id == product_id,
        models.ProductPriceTier.min_months <= months,
        or_(
            models.ProductPriceTier.max_months >= months,
            models.ProductPriceTier.max_months == None
        )
    ).first()

def get_tiers_by_product(db: Session, product_id: int):
    """Retrieve all configured price tiers for a specific product."""
    return db.query(models.ProductPriceTier).filter(
        models.ProductPriceTier.product_id == product_id
    ).order_by(models.ProductPriceTier.min_months.asc()).all()

def get_tier_by_id(db: Session, tier_id: int):
    """Retrieve a specific price tier by its ID."""
    return db.query(models.ProductPriceTier).filter(
        models.ProductPriceTier.id == tier_id
    ).first()

def create_tier(db: Session, tier: models.ProductPriceTier):
    """Prepare to save a new price tier to the database (No commit)."""
    db.add(tier)
    db.flush()
    return tier

def update_tier(db: Session, tier: models.ProductPriceTier):
    """Notify the database of price tier changes (No commit)."""
    db.flush()
    return tier

def delete_tier(db: Session, tier: models.ProductPriceTier):
    """Prepare to delete a price tier from the database (No commit)."""
    db.delete(tier)
    db.flush()