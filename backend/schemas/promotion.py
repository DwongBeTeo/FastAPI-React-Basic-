from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from models.promotion import DiscountTypeEnum

# schemas/promotion.py
class PromotionBase(BaseModel):
    code: Optional[str] = Field(default=None, description="Unique discount code. Leave empty to auto-generate.")
    description: Optional[str] = None
    discount_type: DiscountTypeEnum = Field(..., description="Must be PERCENTAGE or FIXED")
    discount_value: float = Field(..., gt=0, description="Value of the discount")
    # Mặc định là 0 (Không yêu cầu tối thiểu)
    min_order_value: int = Field(default=0, description="Min value of order")
    quantity: Optional[int] = Field(default=None, description="Limited number of Vouchers. Leave blank (None) for unlimited codes.")
    is_active: bool = True
    expiration_date: Optional[date] = None
class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[DiscountTypeEnum] = None
    discount_value: Optional[float] = None
    is_active: Optional[bool] = None
    expiration_date: Optional[date] = None
    min_order_value: Optional[int] = None
    quantity: Optional[int] = None

class PromotionResponse(PromotionBase):
    id: int
    code: str
    
    class Config:
        from_attributes = True

class PromotionCheckResponse(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: DiscountTypeEnum 
    discount_value: float
    min_order_value: int
    quantity: Optional[int]

    class Config:
        from_attributes = True