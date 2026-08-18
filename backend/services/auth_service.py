from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
import models, schemas, auth
from repositories import user_repository
from utils.audit_logger import write_audit_log

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

def authenticate_user(db: Session, form_data, bg_tasks: BackgroundTasks):
    # 1. find user by username
    user = user_repository.get_user_by_email(db, email=form_data.username)
    
    # 2. check password
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
        )
    
    # 3. create token
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})

    # Ghi Audit Log chạy ngầm. Payload chứa cả password sẽ tự động bị biến thành "***"
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
    return {"access_token": access_token, "token_type": "bearer"}