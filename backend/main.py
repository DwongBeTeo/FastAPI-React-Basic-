# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.api import api_router

app = FastAPI(title="Pet Project API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # frontend (http://localhost:8080)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)  # embed the api_router which includes user and admin routers

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok", 
        "message": "Backend is running smoothly!"
    }