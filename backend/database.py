import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

load_dotenv()  # Load environment variables from .env file
# connect to DB
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# The session database is per-request level and automatically closes.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()