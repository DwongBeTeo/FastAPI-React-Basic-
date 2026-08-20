from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
import models, schemas, auth
from config import settings
from repositories import user_repository, token_repository
from utils.audit_logger import write_audit_log
from datetime import datetime, timedelta
from services.rate_limit import check_login_rate_limit,record_failed_login,reset_failed_login

# services/auth_service.py
def register_user(db: Session, user: schemas.UserCreate):
    try:
        # 1. Check if email already exists
        db_user = user_repository.get_user_by_email(db, email=user.email)
        
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # 2. Hash password
        hashed_pwd = auth.get_password_hash(user.password)
        
        # 3. Create instance model
        new_user = models.User(
            username=user.username, 
            email=user.email,
            hashed_password=hashed_pwd, 
            role=user.role
        )    
        
        # 4. call repository (Session)
        created_user = user_repository.create_user(db, new_user)

        # TRANSACTION BOUNDARY
        db.commit()
        db.refresh(created_user)
        return created_user

    except HTTPException:
        raise 
    except Exception as e:
        # If error, rollback All
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error when register: {str(e)}"
        )

def authenticate_user(db: Session, form_data, bg_tasks: BackgroundTasks, client_ip: str):
    username = form_data.username
    # username = user_repository.get_user_by_email(db, email=form_data.username);
    # 0. KIỂM TRA RATE LIMIT ĐẦU TIÊN
    # Nếu bị khóa, hàm này sẽ ném lỗi 429 và ngắt request ngay tại đây
    check_login_rate_limit(client_ip, username)

    # 1. find user by username
    user = user_repository.get_user_by_email(db, email=form_data.username)
    
    # 2. check password
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        # NẾU SAI: Ghi nhận 1 lần thất bại vào Redis
        record_failed_login(client_ip, username)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )
    try:
        # 3. create token (Access Token)
        access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})

        # 4. Tạo và lưu Refresh Token vào Database
        raw_refresh_token = auth.create_refresh_token()
        token_hash = auth.get_token_hash(raw_refresh_token)
        
        # Hạn sử dụng lấy từ cấu hình ( 7 ngày)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Gọi repository để lưu xuống DB (repository chỉ flush, chưa commit)
        token_repository.create_refresh_token(db, user.id, token_hash, expires_at)
        db.commit()

        # 5. Ghi Audit Log chạy ngầm (Chỉ gọi sau khi commit thành công)
        bg_tasks.add_task(
            write_audit_log,
            db=db,
            actor_id=user.id,
            action="LOGIN",
            entity_type="USER",
            entity_id=user.id,
            payload={
                "username": form_data.username, 
                "password": form_data.password,
                "role": user.role,
                "access_token": access_token
            }
        )
        
        # Trả về thêm refresh_token cho Frontend
        return {
            "access_token": access_token, 
            "refresh_token": raw_refresh_token, 
            "token_type": "bearer"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

# New functions
def refresh_access_token(db: Session, refresh_token: str):
    """Hàm xử lý cấp lại token mới"""
    token_hash = auth.get_token_hash(refresh_token)
    db_token = token_repository.get_valid_refresh_token(db, token_hash)

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The refresh token is invalid or has expired.",
        )
    
    user = db.query(models.User).filter(models.User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User không tồn tại hoặc đã bị khóa")

    try:
        # Create new Access token
        new_access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})

        # Xoay vòng Token (Token Rotation): Thu hồi token cũ, cấp token mới
        token_repository.revoke_refresh_token(db, token_hash)
        
        new_raw_refresh_token = auth.create_refresh_token()
        new_token_hash = auth.get_token_hash(new_raw_refresh_token)
        new_expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        token_repository.create_refresh_token(db, user.id, new_token_hash, new_expires_at)
        db.commit()

        return {
            "access_token": new_access_token, 
            "refresh_token": new_raw_refresh_token, 
            "token_type": "bearer"
        }
    except Exception as e:
        db.rollback() # Rollback toàn bộ nếu thu hồi hoặc tạo token mới bị lỗi
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not refresh token: {str(e)}"
        )

def logout_user(db: Session, refresh_token: str):
    """Hàm xử lý đăng xuất"""
    try:
        token_hash = auth.get_token_hash(refresh_token)
        
        # Đánh dấu token này bị thu hồi (revoked_at = Now)
        token_repository.revoke_refresh_token(db, token_hash)
        db.commit()
        
        return {"message": "LogOut successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )