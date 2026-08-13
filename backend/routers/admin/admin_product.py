# routers/admin_product.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas, auth
from database import get_db
from services import product_service

router = APIRouter(
    tags=["Admin Products"]
)

@router.post("/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, product)

@router.get("/", response_model=schemas.PaginatedProductResponse)
def read_all_products(skip: int = 0, limit: int = 6, db: Session = Depends(get_db)):
    return product_service.get_products(db, skip, limit)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product_update: schemas.ProductCreate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, product_update)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.delete_product(db, product_id)