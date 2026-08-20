# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # instance variables for the settings
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Pydantic settings configuration
    model_config = SettingsConfigDict(env_file=".env")

# create 1 instance to access the settings throughout the application
settings = Settings()