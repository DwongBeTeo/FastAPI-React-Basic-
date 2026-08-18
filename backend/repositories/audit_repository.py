from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
import models

# repositories/audit_repository.py
def get_audit_logs(
    db: Session, 
    skip: int, 
    limit: int,
    actor_id: Optional[int] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None
):
    query = db.query(models.AuditLog)

    if actor_id:
        query = query.filter(models.AuditLog.actor_id == actor_id)
    if action:
        query = query.filter(models.AuditLog.action == action)
    if entity_type:
        query = query.filter(models.AuditLog.entity_type == entity_type)

    total = query.count()
    data = query.order_by(desc(models.AuditLog.created_at))\
                .offset(skip)\
                .limit(limit)\
                .all()
                
    return total, data