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

    # Supabase (para autenticación)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://jmzlfdbooafivioaapti.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzUyOTIsImV4cCI6MjA3Nzk1MTI5Mn0.54NCHCK4h5MukcsVAgqAPBHrAAurypaR89G2EtZcfos")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")  # Necesario para verificar tokens de Supabase

    # Google Cloud Storage (opcional - para archivos)
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = 'ignore'  # Ignorar variables extra en .env

settings = Settings()
