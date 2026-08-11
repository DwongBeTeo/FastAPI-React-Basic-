from datetime import date

from pydantic import BaseModel
from typing import Optional


# schemas/product.py
class ProductBase(BaseModel):
    name: str
    # description: Optional[str] = None
    price: int = 0
    is_active: bool = True
    available_from: Optional[date] = None
    available_to: Optional[date] = None

# Client gửi lên để tạo/update
class ProductCreate(ProductBase):
    pass


# Backend trả về cho Client
class ProductResponse(ProductBase):
    id: int
    code: str

    class Config:
        from_attributes = True