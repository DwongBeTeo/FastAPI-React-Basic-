from sqlalchemy.orm import Session
import models
from datetime import date
from sqlalchemy import or_

# repositories/request_repository.py
def get_last_request_by_prefix(db: Session, prefix: str):
    return db.query(models.DataRequest).filter(
        models.DataRequest.reference_code.like(f"{prefix}%")
    ).order_by(models.DataRequest.id.desc()).first()

def get_pending_request_item(db: Session, user_id: int, product_id: int):
    return db.query(models.DataRequestItem).join(models.DataRequest).filter(
        models.DataRequest.user_id == user_id,
        models.DataRequest.status == "PENDING",
        models.DataRequestItem.product_id == product_id
    ).first()

def get_overlapping_approved_item(db: Session, user_id: int, product_id: int, from_date: date, to_date: date | None = None):
    query = db.query(models.DataRequestItem).join(models.DataRequest).filter(
        models.DataRequest.user_id == user_id,
        models.DataRequest.status == "APPROVED",
        models.DataRequestItem.product_id == product_id
    )
    # ĐIỀU KIỆN 1: Ngày bắt đầu của Database <= Ngày kết thúc của Request
    if to_date is not None:
        query = query.filter(models.DataRequestItem.from_date <= to_date)
    # ĐIỀU KIỆN 2: Ngày kết thúc của Database >= Ngày bắt đầu của Request
    query = query.filter(
        or_(
            models.DataRequestItem.to_date.is_(None), 
            models.DataRequestItem.to_date >= from_date
        )
    )
    return query.first()

def create_request_with_items(db: Session, request: models.DataRequest, items: list[models.DataRequestItem]):
    """Prepare to save the data request and its items to the database (No commit)."""
    db.add(request)
    db.flush() # Send to DB to retrieve request.id
    
    for item in items:
        item.request_id = request.id
        db.add(item)
        
    db.flush() # Send items to DB but do not finalize the transaction
    return request

def get_requests_by_user_id(db: Session, user_id: int):
    return db.query(models.DataRequest).filter(
        models.DataRequest.user_id == user_id
    ).order_by(models.DataRequest.id.desc()).all()

def get_all_requests(db: Session, status: str = None):
    query = db.query(models.DataRequest)
    if status:
        query = query.filter(models.DataRequest.status == status.upper())
    return query.order_by(models.DataRequest.id.desc()).all()

def get_request_by_id(db: Session, request_id: int):
    return db.query(models.DataRequest).filter(models.DataRequest.id == request_id).first()


# access_service
def get_request_item(db: Session, request_id: int, product_id: int):
    """Retrieve item details from the original request."""
    return db.query(models.DataRequestItem).filter(
        models.DataRequestItem.request_id == request_id,
        models.DataRequestItem.product_id == product_id
    ).first()