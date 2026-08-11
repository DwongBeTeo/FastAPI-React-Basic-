from fastapi import APIRouter, Depends
import auth

from routers import product,request_router,access_router
from routers.admin import admin_product, admin_request, admin_product_data
from routers import auth_router
    

# routers/api.py
# 1. ADMIN GROUP (Admin only)
admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(auth.get_current_admin)] # every API in this router requires admin authentication
)
admin_router.include_router(admin_request.router, prefix="/requests")
admin_router.include_router(admin_product.router, prefix="/products")
admin_router.include_router(admin_product_data.router, prefix="/product-data")


# 2. USER GROUP (User only)
user_router = APIRouter()

user_router.include_router(product.router)
user_router.include_router(request_router.router)
user_router.include_router(access_router.router)


# 3. API V1 GROUP (Public)
api_router = APIRouter(prefix="/api/v1")

# Embed the router into api_router
api_router.include_router(auth_router.router)
# Embed the user and admin routers into the api_router
api_router.include_router(user_router)
api_router.include_router(admin_router)
