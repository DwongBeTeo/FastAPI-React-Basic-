# repositories/access_repository.py
from sqlalchemy.orm import Session
import models
from datetime import datetime

def get_active_user_access(db: Session, user_id: int, product_id: int):
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.product_id == product_id,
        models.UserDataAccess.is_active == True
    ).first()

def add_user_access(db: Session, access: models.UserDataAccess):
    """Chỉ add vào phiên làm việc, commit ở Service để đảm bảo đồng bộ (Atomicity)"""
    db.add(access)

# access_service
def get_active_accesses_by_user(db: Session, user_id: int, current_time: datetime):
    """Lấy danh sách các quyền truy cập hiện đang còn hiệu lực của User"""
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.is_active == True,
        models.UserDataAccess.expires_at >= current_time
    ).all()

def get_valid_access_by_user_and_product(db: Session, user_id: int, product_id: int, current_time: datetime):
    """Lấy một quyền truy cập hợp lệ cụ thể"""
    return db.query(models.UserDataAccess).filter(
        models.UserDataAccess.user_id == user_id,
        models.UserDataAccess.product_id == product_id,
        models.UserDataAccess.is_active == True,
        models.UserDataAccess.expires_at >= current_time
    ).first()