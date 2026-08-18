from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
import datetime

# models/system.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    trace_id = Column(String, index=True, nullable=True)
    
    # THÊM index=True vào các trường hay dùng để lọc
    actor_id = Column(Integer, index=True, nullable=True) 
    action = Column(String, index=True, nullable=False)
    entity_type = Column(String, index=True, nullable=False)
    entity_id = Column(Integer, index=True, nullable=False)
    
    payload = Column(String, nullable=True)
    
    # THÊM index=True để tối ưu việc sắp xếp (ORDER BY created_at DESC)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)