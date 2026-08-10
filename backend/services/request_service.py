# services/request_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas
from datetime import datetime, timedelta

from repositories import product_repository, request_repository, access_repository

def generate_reference_code(db: Session) -> str:
    """Sinh mã tự động tuần tự theo ngày (VD: REQ-20260806-0001)"""
    date_str = datetime.now().strftime("%Y%m%d")
    prefix = f"REQ-{date_str}-"
    
    last_request = request_repository.get_last_request_by_prefix(db, prefix)
    
    if last_request:
        last_sequence = int(last_request.reference_code.split("-")[-1])
        new_sequence = last_sequence + 1
    else:
        new_sequence = 1
        
    return f"{prefix}{new_sequence:04d}"

# USER
def create_request(db: Session, request_data: schemas.DataRequestCreate, user_id: int):
    for item in request_data.items:

        product = product_repository.get_product_by_id(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Sản phẩm ID {item.product_id} không tồn tại.")

        if product.available_from and item.from_date < product.available_from:
            raise HTTPException(
                status_code=400, 
                detail=f"Sản phẩm '{product.name}' chỉ cho phép lấy dữ liệu từ ngày {product.available_from.strftime('%d/%m/%Y')}."
            )
            
        if product.available_to and item.to_date > product.available_to:
            raise HTTPException(
                status_code=400, 
                detail=f"Sản phẩm '{product.name}' chỉ cho phép lấy dữ liệu đến ngày {product.available_to.strftime('%d/%m/%Y')}."
            )

        pending_item = request_repository.get_pending_request_item(db, user_id, item.product_id)
        if pending_item:
            raise HTTPException(
                status_code=400, 
                detail=f"Sản phẩm ID {item.product_id} đang có yêu cầu chờ duyệt. Vui lòng không gửi trùng."
            )

        overlapping_item = request_repository.get_overlapping_approved_item(
            db, user_id, item.product_id, item.from_date, item.to_date
        )
        if overlapping_item:
            raise HTTPException(
                status_code=400,
                detail=f"Sản phẩm ID {item.product_id} bị trùng thời gian với dữ liệu bạn đã được cấp quyền."
            )

    new_request = models.DataRequest(
        reference_code=generate_reference_code(db),
        user_id=user_id,
        status="PENDING"
    )
    
    new_items = [
        models.DataRequestItem(
            product_id=item.product_id,
            access_type=item.access_type,
            from_date=item.from_date,
            to_date=item.to_date
        )
        for item in request_data.items
    ]
    
    # Gọi Repo lưu toàn bộ
    return request_repository.save_request_with_items(db, new_request, new_items)

def get_my_requests(db: Session, user_id: int):
    """Lấy danh sách phiếu yêu cầu của chính user đang login"""
    return request_repository.get_requests_by_user_id(db, user_id)

# ADMIN
def get_all_requests(db: Session, status: str = None):
    """Admin xem tất cả request, có thể lọc theo trạng thái"""
    return request_repository.get_all_requests(db, status)

def process_request(db: Session, request_id: int, admin_id: int, action: str):
    """Xử lý Approve hoặc Reject"""
    request = request_repository.get_request_by_id(db, request_id)
    
    if not request:
        raise HTTPException(status_code=404, detail="Không tìm thấy Request")
    
    if request.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request này đã được xử lý ({request.status})")

    request.reviewed_by = admin_id

    if action == "APPROVE":
        request.status = "APPROVED"
        now = datetime.now()
        expires_at = now + timedelta(days=30) 
        
        for item in request.items:
            existing_access = access_repository.get_active_user_access(db, request.user_id, item.product_id)
            
            if not existing_access:
                new_access = models.UserDataAccess(
                    user_id=request.user_id,
                    product_id=item.product_id,
                    request_id=request.id,
                    granted_at=now,
                    expires_at=expires_at,
                    is_active=True
                )
                access_repository.add_user_access(db, new_access)

    elif action == "REJECT":
        request.status = "REJECTED"
    else:
        raise HTTPException(status_code=400, detail="Hành động không hợp lệ")

    # Commit chung cho cả việc đổi status của request VÀ tạo UserDataAccess mới
    db.commit()
    db.refresh(request)
    return request