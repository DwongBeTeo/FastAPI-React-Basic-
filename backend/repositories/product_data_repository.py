# repositories/product_data_repository.py
from sqlalchemy.orm import Session
import models

def create_product_data(db: Session, data: models.ProductData):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

def get_all_product_data(db: Session, product_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.ProductData)
    
    if product_id:
        query = query.filter(models.ProductData.product_id == product_id)
        
    return query.order_by(models.ProductData.data_date.desc()).offset(skip).limit(limit).all()

def get_product_data_by_id(db: Session, data_id: int):
    return db.query(models.ProductData).filter(models.ProductData.id == data_id).first()

def update_product_data(db: Session, data: models.ProductData):
    db.commit()
    db.refresh(data)
    return data

def delete_product_data(db: Session, data: models.ProductData):
    db.delete(data)
    db.commit()

# access_service
def get_product_data_by_date_range(db: Session, product_id: int, start_date, end_date):
    """Lấy dữ liệu thật của sản phẩm theo khoảng thời gian"""
    return db.query(models.ProductData).filter(
        models.ProductData.product_id == product_id,
        models.ProductData.data_date >= start_date,
        models.ProductData.data_date <= end_date
    ).order_by(models.ProductData.data_date.desc()).all()