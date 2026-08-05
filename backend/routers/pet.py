# routers/pet.py(role: USER)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import schemas
from database import get_db
from services import pet_service
from typing import Optional


router = APIRouter(
    prefix="/pets",
    tags=["User Pets"]
)

@router.get("/", response_model=list[schemas.PetResponse])
def read_available_pets(
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = Query(None, description="min_price"),
    max_price: Optional[int] = Query(None, description="max_price"),
    db: Session = Depends(get_db)
):
    return pet_service.get_pets(db, skip, limit, min_price, max_price)

@router.get("/{pet_id}", response_model=schemas.PetResponse)
def read_pet_detail(pet_id: int, db: Session = Depends(get_db)):
    return pet_service.get_pet_by_id(db, pet_id)