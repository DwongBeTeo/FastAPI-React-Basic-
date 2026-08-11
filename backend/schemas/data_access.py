# schemas/data_access.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

# --- DataRequestItem ---
class DataRequestItemBase(BaseModel):
    product_id: int
    access_type: str
    from_date: date  
    to_date: date   

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

class DataRequestResponse(BaseModel):
    id: int
    reference_code: str
    user_id: int
    status: str
    total_amount: int       
    reviewed_by: Optional[int] = None
    items: List[DataRequestItemResponse] = []

    class Config:
        from_attributes = True

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

class ProductDataCreate(BaseModel):
    product_id: int
    data_date: date
    content: str

class ProductDataUpdate(BaseModel):
    data_date: Optional[date] = None
    content: Optional[str] = None