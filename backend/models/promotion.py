from sqlalchemy import Column, Integer, String, Boolean, Date, Float, Enum, text
from database import Base
import enum

# models/promotion.py
class DiscountTypeEnum(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"

class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    
    # Loại giảm giá: "PERCENTAGE" (Phần trăm) hoặc "FIXED" (Tiền mặt)
    discount_type = Column(Enum(DiscountTypeEnum), nullable=False) 
    
    # Giá trị giảm: VD 20 (nếu là PERCENTAGE) hoặc 500000 (nếu là FIXED)
    discount_value = Column(Float, nullable=False)

    # Giá trị đơn hàng tối thiểu
    min_order_value = Column(Integer, nullable=False, server_default=text("0"))

    # Số lượng mẫ giảm giá
    quantity = Column(Integer, nullable=True)
    
    is_active = Column(Boolean, default=True)
    expiration_date = Column(Date, nullable=True)