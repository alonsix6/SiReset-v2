# ⚙️ CONFIGURACIÓN MANUAL NECESARIA

Este documento lista **TODOS** los pasos que necesitas hacer manualmente para completar el deploy.

---

## 📋 CHECKLIST COMPLETO

### ✅ PASO 1: Crear Cuenta Supabase (5 minutos)

**Por qué:** Necesitamos una base de datos PostgreSQL gratis para reemplazar SQLite

**Cómo:**
1. Ve a https://supabase.com
2. Click en "Start your project"
3. Crea cuenta (puedes usar GitHub)
4. Click en "New Project"
5. Completa:
   - **Name**: `sireset`
   - **Database Password**: Genera una fuerte (mínimo 12 caracteres)
   - **Region**: Elige la más cercana a Perú (ej: `South America (São Paulo)`)
6. Click "Create new project"
7. **ESPERA 2-3 MINUTOS** mientras se crea

**Resultado esperado:**
- ✅ Proyecto creado
- ✅ Dashboard visible en https://supabase.com/dashboard

---

### ✅ PASO 2: Obtener Connection String de Supabase

**Por qué:** Esta es la URL que conecta la aplicación a la base de datos

**Cómo:**
1. En el dashboard de Supabase, ve a **Settings** (ícono engranaje abajo izquierda)
2. Click en **Database** en el menú lateral
3. Scroll hasta **Connection string**
4. Selecciona **URI** en el dropdown
5. **COPIA** el string completo (se ve así):
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
6. **REEMPLAZA** `[YOUR-PASSWORD]` con el password que creaste en PASO 1

**Ejemplo final:**
```
postgresql://postgres.abcdefghijk:MiPassword123!@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Guárdalo:** Lo necesitarás para el archivo `.env`

---

### ✅ PASO 3: Generar SECRET_KEY

**Por qué:** Necesitamos una clave secreta para firmar los JWT tokens

**Cómo:**
1. Abre terminal
2. Ejecuta:
   ```bash
   openssl rand -hex 32
   ```
3. Copia el resultado (se ve así):
   ```
   a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
   ```

**Guárdalo:** Lo necesitarás para el archivo `.env`

---

### ✅ PASO 4: Crear archivo .env

**Por qué:** Aquí se guardan todas las configuraciones sensibles

**Cómo:**
1. En la raíz del proyecto, copia el ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env`:
   ```bash
   nano .env  # o usa tu editor favorito
   ```

3. Completa con los valores de los pasos anteriores:
   ```bash
   # Database (PASO 2 - tu connection string de Supabase)
   DATABASE_URL=postgresql://postgres.xxxx:TU_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

   # Security (PASO 3 - tu SECRET_KEY generada)
   SECRET_KEY=a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0

   # Environment
   ENVIRONMENT=development

   # CORS - agregar dominios permitidos
   CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]

   # Supabase keys (opcional)
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=tu_anon_key_de_supabase
   ```

4. Guarda y cierra el archivo

**Verificar:**
```bash
cat .env  # Debe mostrar los valores correctos
```

---

### ✅ PASO 5: Instalar Dependencias Python

**Por qué:** Necesitamos todas las librerías de Python

**Cómo:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Verificar:**
```bash
python -c "import fastapi; print('✅ FastAPI instalado')"
python -c "import sqlalchemy; print('✅ SQLAlchemy instalado')"
```

---

### ✅ PASO 6: Crear Tablas en PostgreSQL

**Por qué:** La base de datos está vacía, necesitamos crear las tablas

**Cómo:**
```bash
cd backend
source venv/bin/activate
python -c "from app.core.database import init_db; init_db()"
```

**Verificar en Supabase:**
1. Ve a tu dashboard Supabase
2. Click en **Table Editor**
3. Deberías ver:
   - ✅ Tabla `users`
   - ✅ Tabla `modules`

---

### ✅ PASO 7: Crear Usuario Administrador

**Por qué:** Necesitas un usuario para login inicial

**Cómo:**
```bash
cd backend
source venv/bin/activate
python
```

En el shell de Python:
```python
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
import json

db = SessionLocal()

# Crear admin
admin = User(
    email="admin@reset.com.pe",  # Cambia esto por tu email
    name="Administrador",
    role="admin",
    pw_hash=hash_password("Admin123!"),  # Cambia este password
    active=True,
    modules=json.dumps(["Mougli", "Mapito"])
)

db.add(admin)
db.commit()
print(f"✅ Usuario creado: {admin.email}")
exit()
```

**Guarda estas credenciales:**
- Email: `admin@reset.com.pe`
- Password: `Admin123!`

---

### ✅ PASO 8: Migrar Datos Antiguos (Opcional)

**Solo si vienes del sistema anterior Streamlit**

**Cómo:**
```bash
cd scripts
python migrate_sqlite_to_postgres.py
```

**Qué hace:**
- ✅ Migra usuarios de `sireset.db` (SQLite) a PostgreSQL
- ✅ Migra módulos
- ✅ Preserva contraseñas (se actualizarán en primer login)

---

### ✅ PASO 9: Probar Backend Localmente

**Por qué:** Verificar que todo funciona antes de deploy

**Cómo:**
```bash
cd backend
source venv/bin/activate
python -m app.main
```

Deberías ver:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080
```

**Probar en navegador:**
1. Ve a http://localhost:8080/health
   - Debe decir: `{"status":"healthy"}`

2. Ve a http://localhost:8080/api/docs
   - Debe mostrar documentación Swagger

3. **Probar login:**
   - Click en `POST /api/auth/login`
   - Click en "Try it out"
   - Completa:
     ```
     username: admin@reset.com.pe
     password: Admin123!
     ```
   - Click en "Execute"
   - Debe retornar token JWT

**Si todo funciona → ✅ Backend listo**

---

### ✅ PASO 10: Instalar y Probar Frontend

**Cómo:**
```bash
cd frontend
npm install
npm run dev
```

Deberías ver:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Probar en navegador:**
1. Ve a http://localhost:3000
2. Debe mostrar página de login
3. Ingresa credenciales:
   - Email: `admin@reset.com.pe`
   - Password: `Admin123!`
4. Debe redirigir a Dashboard

**Si funciona → ✅ Frontend listo**

---

### ✅ PASO 11: Configurar Google Cloud Project

**Por qué:** Necesitamos un proyecto para deploy en Cloud Run

**Requisitos previos:**
```bash
# Instalar gcloud CLI
# MacOS:
brew install google-cloud-sdk

# Windows:
# Descargar de: https://cloud.google.com/sdk/docs/install

# Linux:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Cómo:**
```bash
# 1. Autenticarse
gcloud auth login

# 2. Crear proyecto
gcloud projects create sireset-prod --name="SiReset Production"

# 3. Verificar proyecto creado
gcloud projects list

# 4. Configurar como proyecto actual
gcloud config set project sireset-prod

# 5. Habilitar facturación (REQUERIDO incluso para tier gratuito)
# Ve a: https://console.cloud.google.com/billing
# Asocia el proyecto 'sireset-prod' a una cuenta de facturación

# 6. Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

**Verificar:**
```bash
gcloud config get-value project
# Debe mostrar: sireset-prod
```

---

### ✅ PASO 12: Crear Secretos en Google Secret Manager

**Por qué:** No queremos hardcodear credenciales en el código

**Cómo:**
```bash
# 1. Crear secret DATABASE_URL
echo -n "postgresql://postgres.xxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres" | \
  gcloud secrets create sireset-db-url --data-file=-

# REEMPLAZA la URL de arriba con la tuya del PASO 2

# 2. Crear secret SECRET_KEY
echo -n "a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" | \
  gcloud secrets create sireset-secret-key --data-file=-

# REEMPLAZA con tu SECRET_KEY del PASO 3
```

**Verificar:**
```bash
gcloud secrets list
# Debe mostrar:
# NAME                  CREATED
# sireset-db-url        2025-11-05...
# sireset-secret-key    2025-11-05...
```

---

### ✅ PASO 13: Deploy a Google Cloud Run

**Cómo:**
```bash
cd deploy
chmod +x cloud-run-deploy.sh

# Ejecutar script de deploy
GCP_PROJECT_ID=sireset-prod ./cloud-run-deploy.sh
```

**Qué hace el script:**
1. ✅ Verifica gcloud instalado
2. ✅ Build de imagen Docker
3. ✅ Push a Container Registry
4. ✅ Deploy a Cloud Run
5. ✅ Configura secretos
6. ✅ Retorna URL del servicio

**Tiempo estimado:** 5-10 minutos

**Resultado esperado:**
```
✅ Deploy exitoso!
URL del servicio: https://sireset-api-xxxx-uc.a.run.app
Docs API: https://sireset-api-xxxx-uc.a.run.app/api/docs
Health check: https://sireset-api-xxxx-uc.a.run.app/health
```

---

### ✅ PASO 14: Actualizar CORS para Producción

**Por qué:** El backend necesita permitir requests desde el frontend en producción

**Cómo:**
1. Edita `backend/app/core/config.py`
2. Agrega la URL de Cloud Run:
   ```python
   CORS_ORIGINS: List[str] = [
       "http://localhost:3000",
       "https://sireset-api-xxxx-uc.a.run.app",  # Tu URL de Cloud Run
   ]
   ```

3. Re-deploy:
   ```bash
   cd deploy
   ./cloud-run-deploy.sh
   ```

---

### ✅ PASO 15: Verificación Final

**Checklist de verificación:**

```bash
# 1. Backend en Cloud Run funciona
curl https://sireset-api-xxxx-uc.a.run.app/health
# Debe retornar: {"status":"healthy"}

# 2. API Docs accesibles
# Abrir en navegador: https://sireset-api-xxxx-uc.a.run.app/api/docs

# 3. Login funciona
curl -X POST "https://sireset-api-xxxx-uc.a.run.app/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@reset.com.pe&password=Admin123!"
# Debe retornar token JWT

# 4. Database tiene usuarios
# Ve a Supabase dashboard → Table Editor → users
# Debe mostrar al menos 1 usuario
```

---

## 🎉 ¡LISTO!

Si todos los pasos están ✅, tienes:

1. ✅ Backend FastAPI corriendo en Google Cloud Run
2. ✅ Base de datos PostgreSQL en Supabase
3. ✅ Autenticación JWT funcionando
4. ✅ API REST documentada
5. ✅ Frontend React listo para desarrollo

**Próximos pasos:**
1. Configurar dominio personalizado (opcional)
2. Deploy del frontend a Vercel/Netlify
3. Configurar CI/CD con GitHub Actions
4. Agregar más usuarios desde el panel admin

---

## 🆘 Si algo falla

**Base de datos no conecta:**
```bash
# Verificar connection string
psql "postgresql://postgres.xxxx:PASSWORD@..."
```

**Deploy falla:**
```bash
# Ver logs de Cloud Run
gcloud run services logs read sireset-api --limit 100
```

**Frontend no conecta al backend:**
```bash
# Verificar CORS configurado
curl -H "Origin: http://localhost:3000" \
  -I https://sireset-api-xxxx-uc.a.run.app/health
```

---

**¿Necesitas ayuda?** Envía los logs completos del error.
