# backend/app/core/database.py
"""
Database setup con SQLAlchemy + Supabase PostgreSQL
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Engine con configuración para Supabase
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,  # Cloud Run no mantiene conexiones persistentes
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,  # Verificar conexiones antes de usar
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency para FastAPI - obtener sesión de DB
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Crear todas las tablas (llamar en startup si es necesario)
    """
    Base.metadata.create_all(bind=engine)
