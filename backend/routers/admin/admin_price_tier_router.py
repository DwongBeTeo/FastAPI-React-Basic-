from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, auth, schemas
from database import get_db
from schemas.product_price_tier import ProductPriceTierCreate, ProductPriceTierUpdate, ProductPriceTierResponse
from services import admin_price_tier_service

# routers/admin_price_tier_router.py
router = APIRouter(
    tags=["Admin Pricing Configuration"]
)

@router.post("/", response_model=ProductPriceTierResponse)
def create_tier(
    tier_in: ProductPriceTierCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Create a new dynamic pricing tier for a product."""
    return admin_price_tier_service.create_price_tier(db, tier_in)

@router.get("/product/{product_id}", response_model=List[ProductPriceTierResponse])
def read_product_tiers(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """View all configured pricing tiers for a specific product."""
    return admin_price_tier_service.get_product_price_tiers(db, product_id)

@router.put("/{tier_id}", response_model=ProductPriceTierResponse)
def update_tier(
    tier_id: int,
    tier_in: ProductPriceTierUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Update an existing pricing tier."""
    return admin_price_tier_service.update_price_tier(db, tier_id, tier_in)

@router.delete("/{tier_id}")
def delete_tier(
    tier_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """Remove a pricing tier configuration."""
    return admin_price_tier_service.delete_price_tier(db, tier_id)