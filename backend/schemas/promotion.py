from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from models.promotion import DiscountTypeEnum

# schemas/promotion.py
class PromotionBase(BaseModel):
    code: str = Field(..., description="Unique discount code, e.g., SUMMER2026")
    description: Optional[str] = None
    discount_type: DiscountTypeEnum = Field(..., description="Must be PERCENTAGE or FIXED")
    discount_value: float = Field(..., gt=0, description="Value of the discount")
    is_active: bool = True
    expiration_date: Optional[date] = None
class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    is_active: Optional[bool] = None
    expiration_date: Optional[date] = None

class PromotionResponse(PromotionBase):
    id: int

    class Config:
        from_attributes = True