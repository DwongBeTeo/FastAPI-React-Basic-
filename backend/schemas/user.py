from pydantic import BaseModel, EmailStr

#schemas/user.py
class UserCreate(BaseModel):
    username: str
    email: EmailStr 
    password: str
    role: str = "USER"
    is_active: bool = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr | None = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True