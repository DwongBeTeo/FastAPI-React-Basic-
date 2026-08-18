from sqlalchemy import text
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user, get_current_admin
from utils.audit_logger import trace_id_ctx
# dependencies.py
def get_audit_db(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Dependency này trả về database session cho User thường.
    Đồng thời tự động gắn user.id vào PostgreSQL Audit.
    """
    # Lấy ID của user (ép kiểu về string để tránh lỗi SQL)
    user_id = str(current_user.id)

    # Lấy trace_id hiện tại từ middleware
    current_trace_id = trace_id_ctx.get()

    # Gắn ID vào biến môi trường local của transaction hiện tại
    db.execute(text(f"SET LOCAL postgresql_audit.client_id = '{user_id}'"))

    # Báo cho Postgresql-Audit biết Trace_ID (nếu có)
    if current_trace_id:
        db.execute(text(f"SET LOCAL postgresql_audit.transaction_id = '{current_trace_id}'"))
        
    return db


def get_admin_audit_db(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Dependency này trả về database session cho ADMIN.
    Đồng thời tự động gắn admin.id vào PostgreSQL Audit.
    """
    admin_id = str(current_admin.id)
    db.execute(text(f"SET LOCAL postgresql_audit.client_id = '{admin_id}'"))
    
    return db