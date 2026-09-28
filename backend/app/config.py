import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SupplyMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database configuration with SQLite fallback for local running ease
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./supplymind.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supplymind-super-secret-capstone-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Vector DB / Upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    VECTOR_DB_DIR: str = os.getenv("VECTOR_DB_DIR", "./faiss_index")

settings = Settings()
