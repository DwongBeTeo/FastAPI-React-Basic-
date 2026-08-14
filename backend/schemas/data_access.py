from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import enum

# schemas/data_access.py
class SubscriptionTypeEnum(str, enum.Enum):
    HISTORICAL = "HISTORICAL"
    ONGOING = "ONGOING"

# --- DataRequestItem ---
class DataRequestItemBase(BaseModel):
    product_id: int
    access_type: str
    
    # THÊM MỚI: Bắt buộc chọn loại gói đăng ký
    subscription_type: SubscriptionTypeEnum 
    
    from_date: date
    to_date: Optional[date] = None

class DataRequestItemCreate(DataRequestItemBase):
    pass

class DataRequestItemResponse(DataRequestItemBase):
    id: int
    request_id: int
    calculated_months: int  
    applied_price: int      

    class Config:
        from_attributes = True

# --- DataRequest ---
class DataRequestCreate(BaseModel):
    items: List[DataRequestItemCreate]
    
    #  Cho phép người dùng gửi mã giảm giá lên
    promotion_code: Optional[str] = None 

class DataRequestResponse(BaseModel):
    id: int
    reference_code: str
    user_id: int
    status: str
    total_amount: int       
    reviewed_by: Optional[int] = None
    items: List[DataRequestItemResponse] = []
    promotion_id: Optional[int] = None 

    class Config:
        from_attributes = True

class PaginatedRequestResponse(BaseModel):
    total: int
    data: List[DataRequestResponse]

# --- UserDataAccess ---
class UserDataAccessResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    request_id: int
    granted_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True 

# --- ProductData ---
class ProductDataResponse(BaseModel):
    id: int
    product_id: int
    data_date: date
    content: str

    class Config:
        from_attributes = True

class PaginatedProductDataResponse(BaseModel):
    total: int
    data: List[ProductDataResponse]

class ProductDataCreate(BaseModel):
    product_id: int
    data_date: date
    content: str

class ProductDataUpdate(BaseModel):
    data_date: Optional[date] = None
    content: Optional[str] = None