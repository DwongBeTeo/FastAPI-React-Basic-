from pydantic import BaseModel

# Class cơ sở chứa các thuộc tính chung
class PetBase(BaseModel):
    name: str
    species: str

# Schema dùng khi tạo mới (chưa có ID)
class PetCreate(PetBase):
    pass

# Schema dùng khi trả dữ liệu về (đã có ID từ database)
class PetResponse(PetBase):
    id: int

    class Config:
        from_attributes = True  # Cho phép Pydantic đọc dữ liệu trực tiếp từ SQLAlchemy Model