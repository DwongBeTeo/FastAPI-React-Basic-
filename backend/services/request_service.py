# services/request_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas
from datetime import datetime, timedelta
import calendar

from repositories import product_repository, request_repository, access_repository, product_price_tier_repository

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
        now = datetime.now()
        current_date = now.date()
        
        # --- PREPARE DATA LISTS ---
        new_items = []
        total_request_price = 0

        # --- BUSINESS LOGIC VALIDATION ---
        for item in request_data.items:
            product = product_repository.get_product_by_id(db, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")

            # 1. CHUẨN HÓA NGÀY THÁNG
            std_from_date = item.from_date.replace(day=1)
            # to_date luôn là ngày cuối cùng của tháng đó (VD: 28, 30, hoặc 31)
            last_day = calendar.monthrange(item.to_date.year, item.to_date.month)[1]
            std_to_date = item.to_date.replace(day=last_day)

            # 2.
            # Validation Quá khứ (Ranh giới dưới)
            if product.available_from and std_from_date < product.available_from:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product '{product.name}' data is only available from {product.available_from.strftime('%m/%Y')}."
                )

            # Validation Tương lai (Ranh giới trên)
            if std_to_date > current_date:
                # Khách mua vắt ngang tới tương lai
                if not product.is_ongoing:
                    # Nếu data đã chết thì chặn lại ngay
                    if product.available_to and std_to_date > product.available_to:
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Product '{product.name}' is no longer updating. Data only available until {product.available_to.strftime('%m/%Y')}."
                        )
                # Nếu is_ongoing == True, cho phép mua thả ga, không cần check available_to
            else:
                # Khách chỉ mua hoàn toàn trong quá khứ
                if product.available_to and std_to_date > product.available_to:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Product '{product.name}' data is only available until {product.available_to.strftime('%m/%Y')}."
                    )

            # 3. CHỐNG TRÙNG LẶP (Logic cũ)
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

            # 4. TÍNH TOÁN GIÁ TIỀN TỰ ĐỘNG
            total_months = calculate_months(std_from_date, std_to_date)
            price_tier = product_price_tier_repository.get_tier_by_months(db, item.product_id, total_months)
            
            if not price_tier:
                raise HTTPException(status_code=400, detail="Pricing configuration not found for this duration.")
                
            applied_price = price_tier.fixed_package_price if price_tier.fixed_package_price else (price_tier.price_per_month * total_months)
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