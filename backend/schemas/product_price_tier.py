from pydantic import BaseModel, Field
from typing import Optional

# schemas/product_price_tier.py
class ProductPriceTierBase(BaseModel):
    min_months: int = Field(..., gt=0, description="Minimum months for this tier")
    max_months: Optional[int] = Field(None, description="Maximum months for this tier (Null means infinity)")
    price_per_month: int = Field(..., ge=0, description="Retail price per month")
    fixed_package_price: Optional[int] = Field(None, description="Fixed price for the whole package (if applicable)")

class ProductPriceTierCreate(ProductPriceTierBase):
    product_id: int

class ProductPriceTierUpdate(BaseModel):
    min_months: Optional[int] = Field(None, gt=0)
    max_months: Optional[int] = None
    price_per_month: Optional[int] = Field(None, ge=0)
    fixed_package_price: Optional[int] = None

class ProductPriceTierResponse(ProductPriceTierBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True