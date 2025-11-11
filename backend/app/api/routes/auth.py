# backend/app/api/routes/auth.py
"""
Endpoints de autenticación con JWT
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    migrate_password_if_needed
)
from app.core.config import settings
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

# Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "user"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    active: bool
    modules: list

    class Config:
        from_attributes = True

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login con email y password
    Retorna JWT token
    """
    # Buscar usuario por email
    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar password
    if not verify_password(form_data.password, user.pw_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar usuario activo
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    # Migrar password si es legacy (del sistema Streamlit antiguo)
    if user.pw_hash.startswith("pbkdf2$"):
        new_hash = hash_password(form_data.password)
        user.pw_hash = new_hash
        db.commit()

    # Crear JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    """
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar nuevo usuario (solo admins)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden crear usuarios"
        )

    # Verificar que email no existe
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )

    # Crear usuario
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email.lower().strip(),
        name=user_data.name.strip(),
        role=user_data.role,
        pw_hash=hashed_password,
        active=True,
        modules=["Mapito"]  # Módulos por defecto
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos los usuarios (solo admins)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden listar usuarios"
        )

    users = db.query(User).all()
    return users
