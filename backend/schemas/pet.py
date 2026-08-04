from pydantic import BaseModel

# Base class containing common attributes
class PetBase(BaseModel):
    name: str
    species: str

# Schema for creation (without ID)
class PetCreate(PetBase):
    pass

# Schema for response (with ID from database)
class PetResponse(PetBase):
    id: int

    class Config:
        from_attributes = True  # Allows Pydantic to read data directly from SQLAlchemy Model