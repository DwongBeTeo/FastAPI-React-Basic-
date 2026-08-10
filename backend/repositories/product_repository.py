# repositories/product_repository.py
from sqlalchemy.orm import Session
from typing import Optional
import models

def get_last_product(db: Session):
    """Lấy sản phẩm cuối cùng được thêm vào để sinh mã tự động"""
    return db.query(models.Product).order_by(models.Product.id.desc()).first()

def get_product_by_id(db: Session, product_id: int):
    """Lấy chi tiết một sản phẩm theo ID"""
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = None, 
    max_price: Optional[int] = None
):
    """Lấy danh sách sản phẩm có kèm filter theo giá"""
    query = db.query(models.Product)
    
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
        
    return query.order_by(models.Product.id).offset(skip).limit(limit).all()

def create_product(db: Session, product: models.Product):
    """Lưu sản phẩm mới vào DB"""
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def update_product(db: Session, product: models.Product):
    """Lưu các thay đổi của sản phẩm hiện tại"""
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product: models.Product):
    """Xóa sản phẩm khỏi DB"""
    db.delete(product)
    db.commit()