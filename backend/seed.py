#seed.py
#  run:      python seed.py
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import auth

ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "123",
    "role": "ADMIN"
}

USER_CREDENTIALS = {
    "username": "user",
    "password": "123",
    "role": "USER"
}

INITIAL_PETS = [
    {"name": "Kōhaku Tanchō", "species": "Cá Koi"},
    {"name": "Blue Rim", "species": "Cá Betta"},
    {"name": "Showa Sanshoku", "species": "Cá Koi"},
    {"name": "Halfmoon Đỏ", "species": "Cá Betta"}
]

# 2. Seed Users (Idempotent)
def seed_users(db: Session):
    print("--- Bắt đầu seed Users ---")
    for u in [ADMIN_CREDENTIALS, USER_CREDENTIALS]:
        # check if user already exists
        existing_user = db.query(models.User).filter(models.User.username == u["username"]).first()
        
        if existing_user:
            print(f"[SKIP] User '{u['username']}' already exists.")
        else:
            hashed_pwd = auth.get_password_hash(u["password"])
            new_user = models.User(
                username=u["username"], 
                hashed_password=hashed_pwd, 
                role=u["role"]
            )
            db.add(new_user)
            print(f"[SUCCESS] create user : '{u['username']}' with role {u['role']}")
            
    db.commit() # save all new users to DB

# 3. Seed Pets/Products (Idempotent)
def seed_pets(db: Session):
    print("--- Bắt đầu seed Pets ---")
    for p in INITIAL_PETS:
        # check if pet already exists
        existing_pet = db.query(models.Pet).filter(
            models.Pet.name == p["name"], 
            models.Pet.species == p["species"]
        ).first()
        
        if existing_pet:
            print(f"[SKIP] Pet '{p['name']}' ({p['species']}) already exists.")
        else:
            new_pet = models.Pet(name=p["name"], species=p["species"])
            db.add(new_pet)
            print(f"[SUCCESS] create pet : '{p['name']}'")
            
    db.commit() # save all new pets to DB   

# 4. Run the seed function
def run_seed():
    db = SessionLocal()
    try:
        seed_users(db)
        seed_pets(db)
        print(">>> Seed data successful <<<")
    except Exception as e:
        print(f">>> Error occurred while seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()