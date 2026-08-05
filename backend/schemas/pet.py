# schemas/pet.py
from pydantic import BaseModel
from typing import Optional

class PetBase(BaseModel):
    name: str
    species: str
    price: Optional[int] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    status: str = "Active"          
    image: Optional[str] = None     
    description: Optional[str] = None

class PetCreate(PetBase):
    pass

class PetResponse(PetBase):
    id: int

    class Config:
        from_attributes = True