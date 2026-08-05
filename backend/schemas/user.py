#schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr # Hoặc dùng EmailStr (cần cài pip install pydantic[email]) để tự validate định dạng @
    password: str
    role: str = "USER"

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr | None = None
    role: str

    class Config:
        from_attributes = True