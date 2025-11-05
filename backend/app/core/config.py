# backend/app/core/config.py
"""
Configuración centralizada usando Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Básico
    PROJECT_NAME: str = "SiReset API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"

    # CORS - permitir frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev
        "http://localhost:5173",  # Vite dev
        "https://sireset.app",    # Producción (cambiar por tu dominio)
    ]

    # Base de datos Supabase PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/sireset"
    )

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_IN_PRODUCTION_USE_openssl_rand_hex_32")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    # PBKDF2 con iteraciones seguras
    PBKDF2_ITERATIONS: int = 600_000  # NIST 2023 compliant

    # Límites de upload
    MAX_UPLOAD_SIZE_MB: int = 500

    # Supabase (opcional - para storage)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Google Cloud Storage (opcional - para archivos)
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
