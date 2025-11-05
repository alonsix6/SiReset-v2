# backend/app/core/security.py
"""
Seguridad mejorada con PBKDF2 600k iteraciones + JWT
"""
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import base64
import os
import hmac

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Context para password hashing con PBKDF2 mejorado
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
    pbkdf2_sha256__rounds=settings.PBKDF2_ITERATIONS  # 600,000 iteraciones
)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crear JWT token con expiración
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """
    Verificar y decodificar JWT token
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def hash_password(password: str) -> str:
    """
    Hash password con PBKDF2-SHA256 600k iteraciones
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar password contra hash
    """
    # Compatibilidad con hashes antiguos del sistema Streamlit
    if hashed_password.startswith("pbkdf2$"):
        return _verify_legacy_password(plain_password, hashed_password)

    # Nuevos hashes con passlib
    return pwd_context.verify(plain_password, hashed_password)

def _verify_legacy_password(password: str, stored: str) -> bool:
    """
    Verificar passwords del sistema antiguo Streamlit
    Formato: pbkdf2$iters$salt_b64$hash_b64
    """
    try:
        scheme, iters, salt_b64, hash_b64 = stored.split("$", 3)
        if scheme != "pbkdf2":
            return False

        iters = int(iters)
        salt = base64.urlsafe_b64decode(salt_b64.encode("ascii"))
        target = base64.urlsafe_b64decode(hash_b64.encode("ascii"))

        candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters)
        return hmac.compare_digest(candidate, target)
    except Exception:
        return False

def migrate_password_if_needed(user_id: int, plain_password: str, current_hash: str, db):
    """
    Migrar password antiguo a nuevo formato si es legacy
    """
    if current_hash.startswith("pbkdf2$"):
        # Es legacy, rehash con el nuevo sistema
        new_hash = hash_password(plain_password)
        # Actualizar en DB (implementar según tu ORM)
        # db.execute("UPDATE users SET pw_hash = ? WHERE id = ?", (new_hash, user_id))
        return new_hash
    return current_hash
