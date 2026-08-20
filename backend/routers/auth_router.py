from fastapi import APIRouter, Depends, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import schemas, auth, models
from database import get_db
from services import auth_service

# routers/auth_router.py
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user)

@router.post("/login", response_model=schemas.Token)
def login(
    request: Request,
    bg_tasks: BackgroundTasks, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # Lấy IP của client. fall back về 127 nếu o có
    client_ip = request.client.host if request.client else "127.0.0.1"

    return auth_service.authenticate_user(db, form_data, bg_tasks, client_ip)

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    API dùng để cấp lại Access Token mới.
    Frontend sẽ gọi ngầm API này khi Access Token bị hết hạn.
    """
    return auth_service.refresh_access_token(db, request.refresh_token)

@router.post("/logout")
def logout(request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    API Đăng xuất. 
    Backend sẽ đánh dấu Refresh Token này là đã bị thu hồi (revoked).
    """
    return auth_service.logout_user(db, request.refresh_token)

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user