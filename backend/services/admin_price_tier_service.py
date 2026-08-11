from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas

from repositories import product_repository, product_price_tier_repository

# services/admin_price_tier_service.py
def create_price_tier(db: Session, tier_in: schemas.ProductPriceTierCreate):
    try:
        # --- BUSINESS LOGIC VALIDATION ---
        if tier_in.max_months is not None and tier_in.min_months > tier_in.max_months:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum months cannot be greater than maximum months."
            )

        product = product_repository.get_product_by_id(db, tier_in.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Product ID {tier_in.product_id} not found."
            )

        # --- PREPARE MODEL ---
        new_tier = models.ProductPriceTier(**tier_in.model_dump())
        
        # --- CALL REPOSITORY ---
        created_tier = product_price_tier_repository.create_tier(db, new_tier)
        db.commit()
        db.refresh(created_tier)
        return created_tier

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error during price tier creation: {str(e)}"
        )


def get_product_price_tiers(db: Session, product_id: int):
    """Read-only operation, no transaction boundary needed."""
    product = product_repository.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    return product_price_tier_repository.get_tiers_by_product(db, product_id)


def update_price_tier(db: Session, tier_id: int, tier_in: schemas.ProductPriceTierUpdate):
    db_tier = product_price_tier_repository.get_tier_by_id(db, tier_id)
    if not db_tier:
        raise HTTPException(status_code=404, detail="Price tier configuration not found.")
        
    try:
        # Validate logic if updating min/max months
        new_min = tier_in.min_months if tier_in.min_months is not None else db_tier.min_months
        new_max = tier_in.max_months if tier_in.max_months is not None else db_tier.max_months
        
        if new_max is not None and new_min > new_max:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum months cannot be greater than maximum months."
            )

        # Apply updates
        update_dict = tier_in.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_tier, key, value)
            
        updated_tier = product_price_tier_repository.update_tier(db, db_tier)
        db.commit()
        db.refresh(updated_tier)
        return updated_tier

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while updating price tier: {str(e)}"
        )


def delete_price_tier(db: Session, tier_id: int):
    db_tier = product_price_tier_repository.get_tier_by_id(db, tier_id)
    if not db_tier:
        raise HTTPException(status_code=404, detail="Price tier configuration not found.")
        
    try:
        product_price_tier_repository.delete_tier(db, db_tier)
        db.commit()
        return {"message": "Price tier configuration deleted successfully."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while deleting price tier: {str(e)}"
        )