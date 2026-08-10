# services/product_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas
from typing import Optional

# Import repository
from repositories import product_repository

def create_product(db: Session, product: schemas.ProductCreate):
    # 1. Logic Auto generated code
    last_product = product_repository.get_last_product(db)
    
    if last_product and last_product.code and last_product.code.startswith("PRD-"):
        try:
            # Separate the digit after the minus sign and add 1.
            last_number = int(last_product.code.split("-")[1])
            new_number = last_number + 1
        except ValueError:
            new_number = 1
    else:
        # If don't have any products yet, start from 1.
        new_number = 1
        
    # Format the new code as a 4-digit number, padding with a leading zero if necessary.
    generated_code = f"PRD-{new_number:03d}"
    
    # 2. Create a dictionary from the data sent by the client and overwrite the 'code' field.
    product_data = product.model_dump()
    product_data["code"] = generated_code
    
    # Tạo object model và gọi Repo để lưu
    db_product = models.Product(**product_data) 
    return product_repository.create_product(db, db_product)


def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = None, 
    max_price: Optional[int] = None
):
    # Gọi trực tiếp Repo xử lý logic Query & Filter
    return product_repository.get_products(
        db=db, skip=skip, limit=limit, min_price=min_price, max_price=max_price
    )


def get_product_by_id(db: Session, product_id: int):
    product = product_repository.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def update_product(db: Session, product_id: int, product_update: schemas.ProductCreate):
    product = get_product_by_id(db, product_id) 
    
    update_data = product_update.model_dump(exclude_unset=True)
    if "code" in update_data:
        del update_data["code"] # Stop updating code column
        
    for key, value in update_data.items():
        setattr(product, key, value)
        
    return product_repository.update_product(db, product)


def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id)
    
    # Gọi Repo để xóa
    product_repository.delete_product(db, product)
    
    return {"message": "Delete successful!"}