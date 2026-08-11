# repositories/user_repository.py
from sqlalchemy.orm import Session
import models

def get_user_by_email(db: Session, email: str):
    """Lấy thông tin user bằng email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Lấy thông tin user bằng username"""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: models.User):
    """Chuẩn bị lưu user mới vào database (chưa commit)"""
    db.add(user)
    db.flush() #Get new ID after creat but not save
    return user