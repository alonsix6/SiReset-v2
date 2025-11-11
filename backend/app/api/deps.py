# backend/app/api/deps.py
"""
Dependencies compartidas para endpoints
"""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtener usuario actual desde JWT token
    Header: Authorization: Bearer <token>
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not authorization:
        raise credentials_exception

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise credentials_exception
    except ValueError:
        raise credentials_exception

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    # Determinar si es token de Supabase (sub es UUID) o token propio (sub es int)
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Si el token contiene 'email', es de Supabase - buscar por email
    user_email = payload.get("email")
    if user_email:
        # Token de Supabase - buscar usuario por email
        user = db.query(User).filter(User.email == user_email.lower().strip()).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario no registrado en el sistema. Contacta al administrador."
            )
    else:
        # Token propio - buscar por ID
        try:
            user_id_int = int(user_id)
            user = db.query(User).filter(User.id == user_id_int).first()
        except (ValueError, TypeError):
            raise credentials_exception

        if user is None:
            raise credentials_exception

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verificar que usuario está activo"""
    if not current_user.active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

def require_module(module_code: str):
    """
    Dependency factory para requerir acceso a módulo específico
    Usage: Depends(require_module("Mapito"))
    """
    async def _require_module(current_user: User = Depends(get_current_user)):
        if not current_user.has_module(module_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes acceso al módulo {module_code}"
            )
        return current_user
    return _require_module
