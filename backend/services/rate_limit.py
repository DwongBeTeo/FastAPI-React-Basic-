# services/rate_limit.py
from fastapi import HTTPException, status
from datetime import datetime, timedelta

MAX_FAILED_ATTEMPTS = 10
LOCKOUT_DURATION = 300  # 5 phút = 300 giây

# Biến Dictionary toàn cục dùng để lưu trạng thái đăng nhập sai
# Cấu trúc: { "ip:username": {"count": số_lần, "lockout_until": thời_gian_mở_khóa} }
_rate_limit_store = {}

def get_rate_limit_key(ip: str, username: str) -> str:
    """Tạo key kết hợp IP và Username"""
    return f"{ip}:{username}"

def check_login_rate_limit(ip: str, username: str):
    """Kiểm tra xem user có đang bị khóa không."""
    key = get_rate_limit_key(ip, username)
    record = _rate_limit_store.get(key)
    
    if record:
        lockout_time = record.get("lockout_until")
        if lockout_time:
            # Nếu thời gian hiện tại vẫn nhỏ hơn thời gian mở khóa -> Đang bị khóa
            if datetime.now() < lockout_time:
                remaining_seconds = (lockout_time - datetime.now()).seconds
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Tài khoản đã bị tạm khóa.",
                        "remaining_seconds": remaining_seconds
                    }
                )
            else:
                # Nếu đã qua thời gian khóa, reset lại bộ đếm để user đăng nhập lại bình thường
                _rate_limit_store.pop(key, None)

def record_failed_login(ip: str, username: str):
    """Ghi nhận một lần đăng nhập sai."""
    key = get_rate_limit_key(ip, username)
    
    # Nếu chưa có record nào thì tạo mới
    if key not in _rate_limit_store:
        _rate_limit_store[key] = {"count": 1, "lockout_until": None}
    else:
        # Nếu có rồi thì tăng biến đếm lên
        _rate_limit_store[key]["count"] += 1
        
    # Nếu chạm mốc 10 lần -> Set thời gian khóa là 5 phút tính từ hiện tại
    if _rate_limit_store[key]["count"] >= MAX_FAILED_ATTEMPTS:
        _rate_limit_store[key]["lockout_until"] = datetime.now() + timedelta(seconds=LOCKOUT_DURATION)

def reset_failed_login(ip: str, username: str):
    """Xóa bộ đếm nếu người dùng đăng nhập thành công."""
    key = get_rate_limit_key(ip, username)
    if key in _rate_limit_store:
        _rate_limit_store.pop(key, None)