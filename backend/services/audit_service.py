from sqlalchemy.orm import Session
from typing import Optional
from repositories import audit_repository

# services/audit_log.py
def get_audit_logs(
    db: Session, 
    skip: int = 0, 
    limit: int = 20,
    actor_id: Optional[int] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None
):
    total, data = audit_repository.get_audit_logs(
        db, skip, limit, actor_id, action, entity_type
    )
    
    return {
        "total": total,
        "data": data
    }