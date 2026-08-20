from sqlalchemy.orm import Session
from datetime import datetime
import models

# repositories/token_repository.py
def create_refresh_token(db: Session, user_id: int, token_hash: str, expires_at: datetime):
    db_token = models.RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(db_token)
    db.flush() 
    db.refresh(db_token)
    return db_token

def get_valid_refresh_token(db: Session, token_hash: str):
    """Tìm token còn hạn và chưa bị thu hồi"""
    return db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash,
        models.RefreshToken.revoked_at == None,
        models.RefreshToken.expires_at > datetime.utcnow()
    ).first()

def revoke_refresh_token(db: Session, token_hash: str):
    """Đánh dấu token là đã bị thu hồi (Logout)"""
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash
    ).first()
    
    if db_token:
        db_token.revoked_at = datetime.utcnow()
        db.flush()