#models/data_access.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from database import Base

class DataRequest(Base):
    __tablename__ = "data_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    reference_code = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="PENDING") 
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

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

class UserDataAccess(Base):
    __tablename__ = "user_data_access"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("data_requests.id"), nullable=False)
    granted_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)


# from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
# from sqlalchemy.orm import relationship
# from database import Base
# import datetime

# class DataRequest(Base):
#     __tablename__ = "data_requests"
    
#     id = Column(Integer, primary_key=True, index=True)
#     reference_code = Column(String, unique=True, index=True, nullable=False)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
#     notes = Column(String, nullable=True)
#     reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
#     reviewed_at = Column(DateTime, nullable=True)

#     items = relationship("DataRequestItem", back_populates="request")


# class DataRequestItem(Base):
#     __tablename__ = "data_request_items"
    
#     id = Column(Integer, primary_key=True, index=True)
#     request_id = Column(Integer, ForeignKey("data_requests.id"), nullable=False)
#     product_id = Column(Integer, ForeignKey("pets.id"), nullable=False) # Map to product table
#     access_type = Column(String, nullable=False)
#     from_date = Column(DateTime, nullable=True)
#     to_date = Column(DateTime, nullable=True)

#     request = relationship("DataRequest", back_populates="items")


# class UserDataAccess(Base):
#     __tablename__ = "user_data_access"
    
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     product_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
#     request_id = Column(Integer, ForeignKey("data_requests.id"), nullable=False)
#     granted_at = Column(DateTime, default=datetime.datetime.utcnow)
#     expires_at = Column(DateTime, nullable=True)
#     is_active = Column(Boolean, default=True)