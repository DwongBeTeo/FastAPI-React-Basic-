from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import schemas
from database import get_db
from services import product_service
from typing import Optional


# routers/product.py
router = APIRouter(
    prefix="/products",
    tags=["User Products"]
)

@router.get("/", response_model=list[schemas.ProductResponse])
def read_available_products(
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = Query(None, description="min_price"),
    max_price: Optional[int] = Query(None, description="max_price"),
    db: Session = Depends(get_db)
):
    return product_service.get_products(db, skip, limit, min_price, max_price)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product_detail(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product_by_id(db, product_id)