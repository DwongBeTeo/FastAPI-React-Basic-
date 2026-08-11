# services/request_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas
from datetime import datetime, timedelta
import calendar

from repositories import product_repository, request_repository, access_repository

def generate_reference_code(db: Session) -> str:
    """Auto-generate sequential reference code (e.g., REQ-20260806-0001)"""
    date_str = datetime.now().strftime("%Y%m%d")
    prefix = f"REQ-{date_str}-"
    
    last_request = request_repository.get_last_request_by_prefix(db, prefix)
    
    if last_request:
        last_sequence = int(last_request.reference_code.split("-")[-1])
        new_sequence = last_sequence + 1
    else:
        new_sequence = 1
        
    return f"{prefix}{new_sequence:04d}"

# USER OPERATIONS
def calculate_months(start_date, end_date):
    """Tính tổng số tháng giữa 2 mốc thời gian"""
    return (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1

# USER OPERATIONS
def create_request(db: Session, request_data: schemas.DataRequestCreate, user_id: int):
    try:
        # --- PREPARE DATA LISTS ---
        new_items = []
        total_request_price = 0

        # --- BUSINESS LOGIC VALIDATION ---
        for item in request_data.items:
            product = product_repository.get_product_by_id(db, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")

            # 1. CHUẨN HÓA NGÀY THÁNG KHÁCH HÀNG GỬI LÊN
            std_from_date = item.from_date.replace(day=1)
            last_day = calendar.monthrange(item.to_date.year, item.to_date.month)[1]
            std_to_date = item.to_date.replace(day=last_day)

            # 2. CHUẨN HÓA NGÀY THÁNG CỦA SẢN PHẨM TRONG DB
            std_avail_from = product.available_from.replace(day=1) if product.available_from else None
            
            std_avail_to = None
            if product.available_to:
                avail_last_day = calendar.monthrange(product.available_to.year, product.available_to.month)[1]
                std_avail_to = product.available_to.replace(day=avail_last_day)


            # 3. KIỂM TRA LOGIC THỜI GIAN (Rất đơn giản)
            # Ranh giới dưới: Không được mua trước ngày data ra mắt
            if std_avail_from and std_from_date < std_avail_from:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product '{product.name}' data is only available from {std_avail_from.strftime('%m/%Y')}."
                )

            # Ranh giới trên: Không được mua vượt quá ngày data đóng cửa (nếu có)
            # Nếu std_avail_to là None -> Cho phép mua vô hạn tới tương lai
            if std_avail_to and std_to_date > std_avail_to:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product '{product.name}' data is only available until {std_avail_to.strftime('%m/%Y')}."
                )

            # 4. CHỐNG TRÙNG LẶP
            pending_item = request_repository.get_pending_request_item(db, user_id, item.product_id)
            if pending_item:
                raise HTTPException(
                    status_code=400, 
                    detail=f"A pending request for Product ID {item.product_id} already exists."
                )

            overlapping_item = request_repository.get_overlapping_approved_item(
                db, user_id, item.product_id, std_from_date, std_to_date
            )
            if overlapping_item:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product ID {item.product_id} overlaps with an already approved access period."
                )

            # 5. TÍNH TOÁN GIÁ TIỀN (Sử dụng trực tiếp giá của Product)
            total_months = calculate_months(std_from_date, std_to_date)
            
            # Tính giá gốc (Base Price)
            base_price = product.price * total_months
            applied_price = base_price
            
            # Logic áp dụng Promotion
            if 12 <= total_months <= 24:
                # Mua từ 1 - 2 năm: Giảm giá 20%
                discount_rate = 0.20
                applied_price = int(base_price * (1 - discount_rate))
                
            elif total_months > 24:
                # Tùy chọn mở rộng: Mua trên 2 năm thì giảm 30% 
                discount_rate = 0.30
                applied_price = int(base_price * (1 - discount_rate))

            total_request_price += applied_price
            
            new_items.append(
                models.DataRequestItem(
                    product_id=item.product_id,
                    access_type=item.access_type,
                    from_date=std_from_date,
                    to_date=std_to_date,
                    calculated_months=total_months,
                    applied_price=applied_price
                )
            )

        # --- PREPARE DATA MODELS ---
        new_request = models.DataRequest(
            reference_code=generate_reference_code(db),
            user_id=user_id,
            status="PENDING",
            total_amount=total_request_price
        )
        
        # --- CALL REPOSITORY ---
        created_request = request_repository.create_request_with_items(db, new_request, new_items)
        db.commit()
        db.refresh(created_request)
        return created_request

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error during request creation: {str(e)}"
        )

def get_my_requests(db: Session, user_id: int):
    """Retrieve a list of requests submitted by the current user."""
    return request_repository.get_requests_by_user_id(db, user_id)

# ADMIN OPERATIONS
def get_all_requests(db: Session, status: str = None):
    """Retrieve all requests with optional status filtering."""
    return request_repository.get_all_requests(db, status)

def process_request(db: Session, request_id: int, admin_id: int, action: str):
    """Process a request (Approve/Reject)."""
    request = request_repository.get_request_by_id(db, request_id)
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found.")
    
    if request.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"This request has already been processed ({request.status}).")

    try:
        request.reviewed_by = admin_id

        if action == "APPROVE":
            request.status = "APPROVED"
            now = datetime.now()
            expires_at = now + timedelta(days=100) 
            
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
                    access_repository.add_user_access(db, new_access) # Assume this repo function uses db.add() without commit

        elif action == "REJECT":
            request.status = "REJECTED"
        else:
            raise HTTPException(status_code=400, detail="Invalid action specified.")
        db.commit()
        db.refresh(request)
        return request

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while processing the request: {str(e)}"
        )