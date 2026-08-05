# routers/admin/admin_pet.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas, auth
from database import get_db
from services import pet_service

router = APIRouter(
    tags=["Admin Pets"]
)

@router.post("/", response_model=schemas.PetResponse)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db)):
    return pet_service.create_pet(db, pet)

@router.get("/", response_model=list[schemas.PetResponse])
def read_all_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return pet_service.get_pets(db, skip, limit)

@router.put("/{pet_id}", response_model=schemas.PetResponse)
def update_pet(pet_id: int, pet_update: schemas.PetCreate, db: Session = Depends(get_db)):
    return pet_service.update_pet(db, pet_id, pet_update)

@router.delete("/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    return pet_service.delete_pet(db, pet_id)