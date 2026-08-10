# services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas, auth
from repositories import user_repository

def register_user(db: Session, user: schemas.UserCreate):
    # 1. Gọi repository để check if email already exists
    db_user = user_repository.get_user_by_email(db, email=user.email)
    
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2.  hash password
    hashed_pwd = auth.get_password_hash(user.password)
    
    # 3. create instance model
    new_user = models.User(
        username=user.username, 
        email=user.email,
        hashed_password=hashed_pwd, 
        role=user.role
    )    
    # 4. Gọi repository để lưu vào DB
    return user_repository.create_user(db, new_user)

def authenticate_user(db: Session, form_data):
    # 1. Gọi repository để tìm user theo username
    user = user_repository.get_user_by_username(db, username=form_data.username)
    
    # 2. Xử lý nghiệp vụ kiểm tra password
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username or password is incorrect",
        )
    
    # 3. Xử lý nghiệp vụ tạo token
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}