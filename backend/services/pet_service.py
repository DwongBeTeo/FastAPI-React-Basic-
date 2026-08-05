# services/pet_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas
from typing import Optional

def create_pet(db: Session, pet: schemas.PetCreate):
    db_pet = models.Pet(**pet.model_dump()) 
    db.add(db_pet) 
    db.commit() 
    db.refresh(db_pet) 
    return db_pet


def get_pets(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = None, 
    max_price: Optional[int] = None
):
    query = db.query(models.Pet)
    
    # price filter
    if min_price is not None:
        query = query.filter(models.Pet.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Pet.price <= max_price)
        
    return query.order_by(models.Pet.id).offset(skip).limit(limit).all()

def get_pet_by_id(db: Session, pet_id: int):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

def update_pet(db: Session, pet_id: int, pet_update: schemas.PetCreate):
    pet = get_pet_by_id(db, pet_id) 
    
    # Lặp qua các trường gửi lên và cập nhật tự động
    update_data = pet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)
        
    db.commit()
    db.refresh(pet)
    return pet

def delete_pet(db: Session, pet_id: int):
    pet = get_pet_by_id(db, pet_id)
    db.delete(pet)
    db.commit()
    return {"message": "Delete successful!"}

# price filter
def get_pets(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    min_price: Optional[int] = None, 
    max_price: Optional[int] = None
):
    query = db.query(models.Pet)
    
    # Thêm điều kiện lọc giá nếu có tham số truyền vào
    if min_price is not None:
        query = query.filter(models.Pet.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Pet.price <= max_price)
        
    return query.order_by(models.Pet.id).offset(skip).limit(limit).all()