# services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas, auth
from repositories import user_repository

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

def authenticate_user(db: Session, form_data):
    # 1. find user by username
    user = user_repository.get_user_by_username(db, username=form_data.username)
    
    # 2. check password
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username or password is incorrect",
        )
    
    # 3. create token
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}