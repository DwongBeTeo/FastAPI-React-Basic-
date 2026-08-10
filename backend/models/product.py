# models/product.py
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    # new column
    available_from = Column(Date, nullable=True)
    available_to = Column(Date, nullable=True)

# TEST QUYỀN TRUY CẬP
class ProductData(Base):
    __tablename__ = "product_data"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    data_date = Column(Date, nullable=False)
    content = Column(String, nullable=False)