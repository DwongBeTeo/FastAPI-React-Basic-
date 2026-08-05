# models/pet.py
from sqlalchemy import Column, Integer, String, Text
from database import Base

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String)
    
    price = Column(Integer) # news column
    image = Column(String, nullable=True)     
    breed = Column(String)                    
    status = Column(String, default="Active") 
    gender = Column(String)                   
    description = Column(Text, nullable=True) 