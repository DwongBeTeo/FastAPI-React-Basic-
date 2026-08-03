from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas
from database import SessionLocal, engine
app = FastAPI(title="Pet Project API")

# Cấu hình CORS  để React SPA (chạy ở port khác) có thể gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  đổi thành URL của frontend (http://localhost:8080)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: Cấp session database cho mỗi request và tự động đóng lại
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "message": "Backend is running smoothly!"
    }
# Start CRUD pets
#Create
@app.post("/pets/", response_model=schemas.PetResponse)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db)):
    db_pet = models.Pet(name=pet.name, species=pet.species)
    db.add(db_pet) # add obj to session
    db.commit() #save TO DB
    db.refresh(db_pet) #get ID
    return db_pet
# Get ALl
@app.get("/pets/", response_model=list[schemas.PetResponse])
def read_pets(
    # pagination
    skip: int = 0, limit: int = 10, db: Session = Depends(get_db)
    ):
    pets = db.query(models.Pet).offset(skip).limit(limit).all()
    return pets

# Get ONe
@app.get("/pets/{pet_id}", response_model=schemas.PetResponse)
def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

# UPDATE
@app.put("/pets/{pet_id}", response_model=schemas.PetResponse)
def update_pet(pet_id: int, pet_update: schemas.PetCreate, db: Session = Depends(get_db)):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    pet.name = pet_update.name
    pet.species = pet_update.species
    db.commit()
    db.refresh(pet)
    return pet

# DELETE
@app.delete("/pets/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    db.delete(pet)
    db.commit()
    return {"message": "Xóa thành công!"}