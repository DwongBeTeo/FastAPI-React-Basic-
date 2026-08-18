import json
import contextvars
from sqlalchemy.orm import Session
from models.system import AuditLog

# utils/audit_logger.py
# Context variable để lưu trace_id xuyên suốt vòng đời của 1 request
trace_id_ctx = contextvars.ContextVar("trace_id", default=None)

# Tập hợp các keys nhạy cảm cần che giấu
SENSITIVE_KEYS = {"password", "access_token", "refresh_token", "token", "client_secret"}

def sanitize_payload(payload: dict) -> dict:
    """Đệ quy kiểm tra và che giấu các giá trị nhạy cảm trong payload."""
    if not isinstance(payload, dict):
        return payload
        
    sanitized = {}
    for key, value in payload.items():
        if key.lower() in SENSITIVE_KEYS:
            sanitized[key] = "***"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_payload(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_payload(item) if isinstance(item, dict) else item 
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized

def write_audit_log(
    db: Session, 
    actor_id: int, 
    action: str, 
    entity_type: str, 
    entity_id: int, 
    payload: dict = None
):
    """
    Hàm thực thi việc lưu DB. Sẽ được gọi thông qua BackgroundTasks.
    """
    try:
        safe_payload = sanitize_payload(payload) if payload else None
        payload_str = json.dumps(safe_payload) if safe_payload else None
        
        audit_entry = AuditLog(
            trace_id=trace_id_ctx.get(), # Lấy trace_id của request hiện tại
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload=payload_str
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        # Trong hệ thống thực tế, dùng thư viện logging (như loguru) để lưu lỗi này
        print(f"[AUDIT LOG ERROR]: {e}")