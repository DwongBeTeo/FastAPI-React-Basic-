# routers init.py
from fastapi import APIRouter

# Import các router của bạn
from routers import auth_router
from routers.admin import admin_pet
from routers import pet # <--- 1. IMPORT FILE pet.py VÀO ĐÂY

# Khởi tạo api_router tổng (thường đã được gán sẵn prefix /api/v1 ở đây)
api_router = APIRouter(prefix="/api/v1")

# Đăng ký các router con
api_router.include_router(auth_router.router)
api_router.include_router(admin_pet.router)

# <--- 2. THÊM DÒNG NÀY ĐỂ KÍCH HOẠT API USER (GET /api/v1/pets) --->
api_router.include_router(pet.router)