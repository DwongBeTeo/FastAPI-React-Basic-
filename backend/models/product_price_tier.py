from sqlalchemy import Column, Integer, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

# models/product_price_tier.py
class ProductPriceTier(Base):
    __tablename__ = "product_price_tiers"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Khoảng tháng áp dụng (VD: min=1, max=11)
    min_months = Column(Integer, nullable=False) 
    max_months = Column(Integer, nullable=True)
    
    # Định giá
    price_per_month = Column(Integer, nullable=False)
    fixed_package_price = Column(Integer, nullable=True)

    product = relationship("Product", back_populates="price_tiers")