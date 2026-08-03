from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
# connect to DB
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:duong19082004@localhost:5432/pet_DB"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()