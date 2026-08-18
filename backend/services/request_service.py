from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
import models, schemas
from datetime import datetime, timedelta, date
from models.promotion import DiscountTypeEnum
from schemas.data_access import SubscriptionTypeEnum
import calendar
from utils.audit_logger import write_audit_log

from repositories import product_repository, request_repository, access_repository, promotion_repository

# services/request_service.py
# 1. UTILITY FUNCTIONS (HÀM TIỆN ÍCH DÙNG CHUNG)
def get_start_of_next_month(d: date) -> date:
    """Lấy ngày đầu tiên của tháng tiếp theo"""
    if d.month == 12:
        return d.replace(year=d.year + 1, month=1, day=1)
    return d.replace(month=d.month + 1, day=1)

def calculate_months(start_date: date, end_date: date) -> int:
    """Tính tổng số tháng giữa 2 mốc thời gian"""
    return (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1

def get_start_of_month(d: date) -> date:
    """Lấy ngày đầu tiên của tháng"""
    return d.replace(day=1)

def get_end_of_month(d: date) -> date:
    """Lấy ngày cuối cùng của tháng"""
    return d.replace(day=calendar.monthrange(d.year, d.month)[1])

def generate_reference_code(db: Session) -> str:
    """Tạo mã hóa đơn tự động"""
    date_str = datetime.now().strftime("%Y%m%d")
    prefix = f"REQ-{date_str}-"
    last_request = request_repository.get_last_request_by_prefix(db, prefix)
    
    new_sequence = int(last_request.reference_code.split("-")[-1]) + 1 if last_request else 1
    return f"{prefix}{new_sequence:04d}"

# 2. BUSINESS LOGIC HELPERS (HÀM XỬ LÝ NGHIỆP VỤ)
def _validate_and_get_promotion(db: Session, promotion_code: str, current_date: date):
    """Kiểm tra mã giảm giá và trả về cấu hình giảm giá"""
    if not promotion_code:
        return None, None, 0.0, 0

    promotion = promotion_repository.get_promotion_by_code(db, promotion_code)
    if not promotion or not promotion.is_active:
        raise HTTPException(status_code=400, detail="Promotion code does not exist or is inactive.")
    if promotion.expiration_date and promotion.expiration_date < current_date:
        raise HTTPException(status_code=400, detail="Promotion code has expired.")

    # Chặn tại thời điểm chốt đơn
    if promotion.quantity is not None and promotion.quantity <= 0:
        raise HTTPException(
            status_code=400, 
            detail="This promotion code has reached its usage limit."
        )
    
    return promotion.id, promotion.discount_type, promotion.discount_value, promotion.min_order_value


def _process_request_item(
    db: Session, 
    item: schemas.DataRequestItemCreate, 
    user_id: int, 
    current_date: date, 
    discount_type: DiscountTypeEnum, 
    discount_value: float
):
    """Xử lý validate logic và tính tiền cho từng Item lẻ"""
    product = product_repository.get_product_by_id(db, item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")

    current_month_start = get_start_of_month(current_date)
    current_month_end = get_end_of_month(current_date)
    
    # Tính ngày mùng 1 của tháng tiếp theo
    next_month_start = get_start_of_next_month(current_date) 
    
    std_from_date = get_start_of_month(item.from_date)
    std_avail_from = get_start_of_month(product.available_from) if product.available_from else None

    # LƯỚI LỌC CHUNG
    if std_avail_from and std_from_date < std_avail_from:
        raise HTTPException(status_code=400, detail=f"Product '{product.name}' data is only available from {std_avail_from.strftime('%m/%Y')}.")

    std_to_date = None
    total_months = 0

    # LƯỚI LỌC 1: HISTORICAL DATA
    if item.subscription_type == SubscriptionTypeEnum.HISTORICAL:
        if not item.to_date:
            raise HTTPException(status_code=400, detail=f"Historical data for '{product.name}' requires a 'to_date'.")
        if std_from_date > current_month_start:
            raise HTTPException(status_code=400, detail=f"Historical data for '{product.name}' cannot start after {current_month_start.strftime('%m/%Y')}.")

        std_to_date = get_end_of_month(item.to_date)
        
        if std_to_date < std_from_date:
            raise HTTPException(status_code=400, detail="The 'to_date' cannot be earlier than the 'from_date'.")
        if std_to_date > current_month_end:
            raise HTTPException(status_code=400, detail=f"Historical data for '{product.name}' can only end at or before {current_month_end.strftime('%m/%Y')}.")

        if product.available_to:
            std_avail_to = get_end_of_month(product.available_to)
            if std_to_date > std_avail_to:
                raise HTTPException(status_code=400, detail=f"Historical data for '{product.name}' is only available until {std_avail_to.strftime('%m/%Y')}.")
                
        total_months = calculate_months(std_from_date, std_to_date)

    # LƯỚI LỌC 2: ONGOING SUBSCRIPTION
    elif item.subscription_type == SubscriptionTypeEnum.ONGOING:
        if product.available_to and std_from_date > product.available_to:
            raise HTTPException(status_code=400, detail=f"Product '{product.name}' is no longer updating. Cannot create Ongoing Subscription.")
            
        # Ranh giới tuyệt đối: Phải từ tháng tiếp theo trở đi
        if std_from_date < next_month_start:
            raise HTTPException(
                status_code=400, 
                detail=f"Ongoing subscription for '{product.name}' must start from the next month ({next_month_start.strftime('%m/%Y')}) or later."
            )

        # Kiểm tra xem khách có chọn End Date (to_date) hay không
        if item.to_date:
            # Khách có chọn ngày kết thúc
            std_to_date = get_end_of_month(item.to_date)
            
            # 1. Chặn End Date nằm trước Start Date
            if std_to_date < std_from_date:
                raise HTTPException(status_code=400, detail="The 'to_date' cannot be earlier than the 'from_date'.")
                
            # 2. Chặn End Date vượt quá tuổi thọ của sản phẩm (nếu sản phẩm có ngày kết thúc)
            if product.available_to:
                std_avail_to = get_end_of_month(product.available_to)
                if std_to_date > std_avail_to:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Ongoing subscription for '{product.name}' can only be set up to {std_avail_to.strftime('%m/%Y')}."
                    )
            
            # 3. Tính toán số tháng thực tế khách đã chọn
            total_months = calculate_months(std_from_date, std_to_date)
        else:
            # Khách bỏ trống End Date -> Mua vô thời hạn
            std_to_date = None 
            total_months = 1   # Thu tiền cọc 1 tháng đầu tiên

    # CHỐNG TRÙNG LẶP
    if request_repository.get_pending_request_item(db, user_id, item.product_id):
        raise HTTPException(status_code=400, detail=f"A pending request for Product ID {item.product_id} already exists.")
    if request_repository.get_overlapping_approved_item(db, user_id, item.product_id, std_from_date, std_to_date):
        raise HTTPException(status_code=400, detail=f"Product ID {item.product_id} overlaps with an already approved access period.")

    # TÍNH TOÁN GIÁ TIỀN
    base_price = product.price * total_months
    applied_price = base_price
    
    if discount_type == DiscountTypeEnum.PERCENTAGE:
        applied_price = int(base_price * (1 - discount_value / 100.0))

    # TẠO MODEL ITEM
    item_model = models.DataRequestItem(
        product_id=item.product_id,
        access_type=item.access_type,
        subscription_type=item.subscription_type,
        from_date=std_from_date,
        to_date=std_to_date,
        calculated_months=total_months,
        applied_price=applied_price
    )
    return item_model, applied_price, base_price

# 3. MAIN FUNCTION
def create_request(db: Session, request_data: schemas.DataRequestCreate, user_id: int):
    try:
        current_date = datetime.now().date()
        
        # 1. Xác thực và cấu hình mã giảm giá
        promo_id, discount_type, discount_value, min_order_value = _validate_and_get_promotion(
            db, request_data.promotion_code, current_date
        )

        new_items = []
        total_request_price = 0
        cart_subtotal = 0 

        # 2. Xử lý logic và tính tiền cho từng sản phẩm
        for item in request_data.items:
            item_model, item_price, base_price = _process_request_item(
                db=db, 
                item=item,
                user_id=user_id, 
                current_date=current_date, 
                discount_type=discount_type, 
                discount_value=discount_value
            )
            new_items.append(item_model)
            total_request_price += item_price
            cart_subtotal += base_price

        # CHỐT CHẶN MIN ORDER VALUE SAU KHI ĐÃ CỘNG TỔNG
        if promo_id and cart_subtotal < min_order_value:
            raise HTTPException(
                status_code=400, 
                detail=f"Order subtotal (${cart_subtotal}) must be at least ${min_order_value} to apply this promotion."
            )

        # 3. Trừ tiền nếu dùng mã giảm giá cố định (FIXED) trên tổng hóa đơn
        if discount_type == DiscountTypeEnum.FIXED:
            total_request_price = max(0, total_request_price - int(discount_value))

        # 4. Tạo Object Hóa đơn tổng
        new_request = models.DataRequest(
            reference_code=generate_reference_code(db),
            user_id=user_id,
            status="PENDING",
            total_amount=total_request_price,
            promotion_id=promo_id  
        )
        
        # 5. Lưu vào Database (Transaction)
        created_request = request_repository.create_request_with_items(db, new_request, new_items)

        # ==========================================
        # 6. SỬA LỖI TẠI ĐÂY: TRỪ SỐ LƯỢNG MÃ GIẢM GIÁ
        # ==========================================
        if promo_id:
            # Query để lấy object promotion từ Database
            promotion = promotion_repository.get_promotion_by_id(db, promo_id)
            
            # Nếu promotion giới hạn số lượng (không phải None)
            if promotion and promotion.quantity is not None:
                # Chốt chặn cuối cùng ngay trước khoảnh khắc lưu DB
                if promotion.quantity <= 0:
                    raise HTTPException(
                        status_code=400, 
                        detail="This promotion code has reached its usage limit during checkout."
                    )
                # THỰC THI TRỪ LƯỢT SỬ DỤNG
                promotion.quantity -= 1
        
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
def get_all_requests(db: Session, status: str = None, skip: int = 0, limit: int = 10):
    """Retrieve all requests with optional status filtering."""
    return request_repository.get_all_requests(db, status, skip, limit)

def process_request(bg_tasks: BackgroundTasks, db: Session, request_id: int, admin_id: int, action: str):
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
        # Ghi Log ngầm sau khi Transaction chính đã thành công
        bg_tasks.add_task(
            write_audit_log,
            db=db,
            actor_id=admin_id,
            action=action, # "APPROVE" hoặc "REJECT"
            entity_type="DATA_REQUEST",
            entity_id=request.id,
            payload={
                "status_changed_to": request.status,
                "items_count": len(request.items) if request.items else 0
            }
        )
        return request

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while processing the request: {str(e)}"
        )