# services/pet_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas

def create_pet(db: Session, pet: schemas.PetCreate):
    db_pet = models.Pet(name=pet.name, species=pet.species)
    db.add(db_pet) 
    db.commit() 
    db.refresh(db_pet) 
    return db_pet

def get_pets(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Pet).offset(skip).limit(limit).all()

def get_pet_by_id(db: Session, pet_id: int):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

def update_pet(db: Session, pet_id: int, pet_update: schemas.PetCreate):
    pet = get_pet_by_id(db, pet_id) # Tái sử dụng hàm ở trên
    pet.name = pet_update.name
    pet.species = pet_update.species
    db.commit()
    db.refresh(pet)
    return pet

def delete_pet(db: Session, pet_id: int):
    pet = get_pet_by_id(db, pet_id)
    db.delete(pet)
    db.commit()
    return {"message": "Delete successful!"}