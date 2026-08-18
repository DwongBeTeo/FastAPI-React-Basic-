from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# schemas/audit.py
class AuditLogResponse(BaseModel):
    id: int
    trace_id: Optional[str] = None
    actor_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: int
    payload: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedAuditLogResponse(BaseModel):
    total: int
    data: List[AuditLogResponse]