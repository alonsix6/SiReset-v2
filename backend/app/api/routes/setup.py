# backend/app/api/routes/setup.py
"""
Endpoints para configuración inicial del sistema
Solo se pueden usar con la SECRET_KEY correcta
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
import os
import httpx

router = APIRouter()

SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
SECRET_KEY = os.getenv('SECRET_KEY')

class MakeAdminRequest(BaseModel):
    email: EmailStr
    name: str = None

class MakeAdminResponse(BaseModel):
    success: bool
    message: str
    user: dict = None

@router.post("/make-admin", response_model=MakeAdminResponse)
async def make_admin(
    request: MakeAdminRequest,
    x_secret_key: str = Header(None, alias="X-Secret-Key")
):
    """
    Hace administrador a un usuario existente de Supabase

    Requiere:
    - Header: X-Secret-Key (debe coincidir con SECRET_KEY del servidor)
    - Body: { "email": "usuario@ejemplo.com", "name": "Nombre Opcional" }

    Ejemplo de uso:
    ```bash
    curl -X POST https://tu-url.run.app/api/setup/make-admin \
      -H "Content-Type: application/json" \
      -H "X-Secret-Key: tu_secret_key" \
      -d '{"email": "admin@reset.com", "name": "Administrador Principal"}'
    ```
    """

    # Verificar configuración
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Servidor no configurado correctamente (falta SUPABASE_URL o SERVICE_ROLE_KEY)"
        )

    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="SECRET_KEY no configurada en el servidor"
        )

    # Verificar autenticación
    if not x_secret_key or x_secret_key != SECRET_KEY:
        raise HTTPException(
            status_code=401,
            detail="X-Secret-Key inválido o faltante"
        )

    try:
        # 1. Buscar usuario por email usando Supabase Admin API
        async with httpx.AsyncClient() as client:
            # Listar usuarios
            list_response = await client.get(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers={
                    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                    "apikey": SERVICE_ROLE_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )

            if list_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error listando usuarios de Supabase: {list_response.text}"
                )

            users_data = list_response.json()
            users = users_data.get('users', [])

            # Buscar usuario específico
            user = next((u for u in users if u.get('email') == request.email), None)

            if not user:
                available_emails = [u.get('email') for u in users]
                raise HTTPException(
                    status_code=404,
                    detail=f"Usuario no encontrado: {request.email}. Usuarios disponibles: {available_emails}"
                )

            user_id = user['id']
            current_metadata = user.get('user_metadata', {})

            # 2. Actualizar metadata para hacer admin
            new_metadata = {
                **current_metadata,
                'role': 'admin',
                'name': request.name or current_metadata.get('name') or request.email,
                'modules': ['Mapito']
            }

            update_response = await client.put(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                headers={
                    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                    "apikey": SERVICE_ROLE_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "user_metadata": new_metadata
                },
                timeout=30.0
            )

            if update_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error actualizando usuario: {update_response.text}"
                )

            updated_user = update_response.json()

            return MakeAdminResponse(
                success=True,
                message=f"Usuario {request.email} actualizado a administrador exitosamente. IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar para que los cambios tomen efecto.",
                user={
                    "id": updated_user['id'],
                    "email": updated_user['email'],
                    "role": updated_user['user_metadata'].get('role'),
                    "name": updated_user['user_metadata'].get('name'),
                    "modules": updated_user['user_metadata'].get('modules')
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado: {str(e)}"
        )

@router.get("/health")
async def setup_health():
    """
    Verifica que el módulo de setup esté funcionando y configurado correctamente
    """
    return {
        "status": "ok",
        "supabase_configured": bool(SUPABASE_URL and SERVICE_ROLE_KEY),
        "secret_key_configured": bool(SECRET_KEY),
        "note": "Para hacer admin a un usuario, usa POST /api/setup/make-admin con X-Secret-Key header"
    }
