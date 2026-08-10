# services/access_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
import models

# Import các repositories
from repositories import access_repository, request_repository, product_data_repository

def get_my_accesses(db: Session, user_id: int):
    """Lấy danh sách các quyền truy cập hiện đang còn hiệu lực của User (Dùng cho UI hiển thị)"""
    now = datetime.now()
    return access_repository.get_active_accesses_by_user(db, user_id, now)

def get_product_data(db: Session, user_id: int, product_id: int):
    """
    API cốt lõi của hệ thống: Kiểm tra quyền và trả về dữ liệu thật ĐÚNG trong khoảng thời gian cho phép.
    """
    now = datetime.now()
    
    # BƯỚC 1: KIỂM TRA QUYỀN (Gatekeeper)
    valid_access = access_repository.get_valid_access_by_user_and_product(db, user_id, product_id, now)

    if not valid_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập sản phẩm này hoặc quyền đã hết hạn."
        )

    # BƯỚC 2: TÌM PHẠM VI NGÀY (Scope)
    request_item = request_repository.get_request_item(db, valid_access.request_id, product_id)

    if not request_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chi tiết thời gian của yêu cầu gốc."
        )

    # BƯỚC 3: TRẢ VỀ DỮ LIỆU THẬT ĐÃ ĐƯỢC LỌC
    data = product_data_repository.get_product_data_by_date_range(
        db, 
        product_id=product_id, 
        start_date=request_item.from_date, 
        end_date=request_item.to_date
    )

    return data