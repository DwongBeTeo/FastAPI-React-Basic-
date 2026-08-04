# routers/api.py
from fastapi import APIRouter, Depends
import auth

from routers.admin import admin_pet
from routers import auth_router, pet
    

# 1. ADMIN GROUP (Admin only)
admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(auth.get_current_admin)] # every API in this router requires admin authentication
)

admin_router.include_router(admin_pet.router, prefix="/pets")
# admin_router.include_router(admin_product.router, prefix="/products")
# admin_router.include_router(admin_order.router, prefix="/orders")


# 2. USER GROUP (User only)
user_router = APIRouter()
user_router.include_router(pet.router, prefix="/pets")
# user_router.include_router(user_product.router, prefix="/products")

# 3. API V1 GROUP (Public)
api_router = APIRouter(prefix="/api/v1")

# Embed the router into api_router
api_router.include_router(auth_router.router)
# Embed the user and admin routers into the api_router
api_router.include_router(user_router)
api_router.include_router(admin_router)