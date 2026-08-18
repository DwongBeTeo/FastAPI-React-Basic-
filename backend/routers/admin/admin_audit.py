from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import schemas, auth, models
from database import get_db
from services import audit_service

# routers/admin/admin_audit.py
router = APIRouter(
    tags=["Admin Audit Logs"]
)

@router.get("/", response_model=schemas.PaginatedAuditLogResponse)
def fetch_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100), # Giới hạn tối đa 100 record mỗi lần gọi
    actor_id: Optional[int] = Query(None, description="Lọc theo ID người dùng"),
    action: Optional[str] = Query(None, description="Lọc theo hành động (VD: LOGIN, APPROVE)"),
    entity_type: Optional[str] = Query(None, description="Lọc theo loại thực thể (VD: USER, PRODUCT)"),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin) #Only Admin
):
    """
    API lấy danh sách Audit Log dành cho Admin Dashboard.
    Hỗ trợ phân trang và lọc theo nhiều tiêu chí.
    """
    return audit_service.get_audit_logs(
        db=db, 
        skip=skip, 
        limit=limit, 
        actor_id=actor_id, 
        action=action, 
        entity_type=entity_type
    )