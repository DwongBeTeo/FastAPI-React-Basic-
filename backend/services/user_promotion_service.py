from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from repositories import promotion_repository

# service/user_promotion_service.py
def check_promotion_code(db: Session, code: str, order_value: int | None = None):
    """Kiểm tra tính hợp lệ của mã giảm giá và trả về thông tin chi tiết"""
    
    # 1. Tìm mã trong Database
    promotion = promotion_repository.get_promotion_by_code(db, code)
    
    # 2. Bắt lỗi không tồn tại
    if not promotion:
        raise HTTPException(status_code=404, detail="Promotion code not found.")
        
    # 3. Bắt lỗi bị Admin vô hiệu hóa
    if not promotion.is_active:
        raise HTTPException(status_code=400, detail="This promotion code is currently inactive.")
        
    # 4. Bắt lỗi quá hạn sử dụng
    current_date = datetime.now().date()
    if promotion.expiration_date and promotion.expiration_date < current_date:
        raise HTTPException(status_code=400, detail="This promotion code has expired.")

    # THÊM MỚI: Kiểm tra giá trị đơn hàng tối thiểu nếu Frontend có gửi lên
    if order_value is not None and order_value < promotion.min_order_value:
         raise HTTPException(
             status_code=400, 
             detail=f"Order value must be at least ${promotion.min_order_value} to use this code."
         )
    
    # 5. Nếu vượt qua mọi bài kiểm tra, trả về data cho Frontend
    return promotion