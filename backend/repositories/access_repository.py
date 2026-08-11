# repositories/access_repository.py
from sqlalchemy.orm import Session
import models
from datetime import datetime

def get_active_user_access(db: Session, user_id: int, product_id: int):
    """Check if a specific active access ticket exists."""
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.product_id == product_id,
        models.UserDataAccess.is_active == True
    ).first()

def add_user_access(db: Session, access: models.UserDataAccess):
    """Add new access ticket to the session (Commit is handled in Service)."""
    db.add(access)
    db.flush()
    return access

def get_active_accesses_by_user(db: Session, user_id: int, current_time: datetime):
    """Retrieve a list of active and unexpired access tickets for a user."""
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.is_active == True,
        models.UserDataAccess.expires_at >= current_time
    ).all()

def get_valid_access_by_user_and_product(db: Session, user_id: int, product_id: int, current_time: datetime):
    """Retrieve a specific valid and unexpired access ticket for gatekeeping."""
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.product_id == product_id,
        models.UserDataAccess.is_active == True,
        models.UserDataAccess.expires_at >= current_time
    ).first()