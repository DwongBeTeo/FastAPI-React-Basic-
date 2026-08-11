#models/data_access.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, text
from sqlalchemy.orm import relationship
from database import Base

class DataRequest(Base):
    __tablename__ = "data_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    reference_code = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="PENDING") 
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    total_amount = Column(Integer, nullable=False, server_default=text("0"))
    items = relationship("DataRequestItem", back_populates="request")

class DataRequestItem(Base):
    __tablename__ = "data_request_items"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("data_requests.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    access_type = Column(String, nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    request = relationship("DataRequest", back_populates="items")

    # THÊM MỚI: Lưu lại số tháng và giá tiền thực tế áp dụng cho Item này
    calculated_months = Column(Integer, nullable=False, server_default=text("1"))
    applied_price = Column(Integer, nullable=False, server_default=text("0"))


class UserDataAccess(Base):
    __tablename__ = "user_data_access"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("data_requests.id"), nullable=False)
    granted_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
