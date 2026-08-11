from sqlalchemy.orm import Session
import models

# repositories/product_data_repository.py
def create_product_data(db: Session, data: models.ProductData):
    """Prepare to save new product data to the database (No commit)."""
    db.add(data)
    db.flush()
    return data

def get_all_product_data(db: Session, product_id: int = None, skip: int = 0, limit: int = 100):
    """Retrieve a list of product data with optional filtering by product ID."""
    query = db.query(models.ProductData)
    
    if product_id:
        query = query.filter(models.ProductData.product_id == product_id)
        
    return query.order_by(models.ProductData.data_date.desc()).offset(skip).limit(limit).all()

def get_product_data_by_id(db: Session, data_id: int):
    """Retrieve specific product data by its ID."""
    return db.query(models.ProductData).filter(models.ProductData.id == data_id).first()

def update_product_data(db: Session, data: models.ProductData):
    """Notify the database of changes (No commit)."""
    db.flush()
    return data

def delete_product_data(db: Session, data: models.ProductData):
    """Prepare to delete product data from the database (No commit)."""
    db.delete(data)
    db.flush()

def get_product_data_by_date_range(db: Session, product_id: int, start_date, end_date):
    """Retrieve actual product data within a specific date range."""
    return db.query(models.ProductData).filter(
        models.ProductData.product_id == product_id,
        models.ProductData.data_date >= start_date,
        models.ProductData.data_date <= end_date
    ).order_by(models.ProductData.data_date.desc()).all()