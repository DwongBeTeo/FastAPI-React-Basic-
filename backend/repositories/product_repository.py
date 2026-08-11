from sqlalchemy.orm import Session
from typing import Optional
import models

# repositories/product_repository.py
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
    """Chuẩn bị lưu sản phẩm mới vào DB"""
    db.add(product)
    db.flush() # Đẩy lệnh xuống DB để lấy ID, nhưng CHƯA chốt giao dịch
    return product

def update_product(db: Session, product: models.Product):
    """Báo cho DB biết có thay đổi"""
    db.flush()
    return product

def delete_product(db: Session, product: models.Product):
    """Chuẩn bị xóa sản phẩm khỏi DB"""
    db.delete(product)
    db.flush()