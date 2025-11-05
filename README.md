# SiReset v2.0 - Suite de Herramientas

> Migración de Streamlit a FastAPI + React para arquitectura escalable profesional

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración Inicial](#-configuración-inicial)
- [Desarrollo Local](#-desarrollo-local)
- [Deploy a Google Cloud Run](#-deploy-a-google-cloud-run)
- [Migración de Datos](#-migración-de-datos)
- [API Documentation](#-api-documentation)

---

## 🏗️ Arquitectura

```
SiReset v2.0
├── Backend (FastAPI)
│   ├── API REST con JWT authentication
│   ├── PostgreSQL (Supabase)
│   ├── Procesadores: Mougli + Mapito
│   └── Deploy: Google Cloud Run
│
└── Frontend (React + Vite)
    ├── SPA moderna con React Router
    ├── Tailwind CSS
    └── Axios para API calls
```

**Stack Tecnológico:**
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: JWT tokens (600k iteraciones PBKDF2)
- **Hosting**: Google Cloud Run (gratis hasta 2M requests/mes)
- **Base de datos**: Supabase PostgreSQL (gratis 500MB)

---

## ⚙️ Requisitos Previos

### Software Necesario

1. **Python 3.11+**
   ```bash
   python --version  # Debe ser 3.11 o superior
   ```

2. **Node.js 18+** (para frontend)
   ```bash
   node --version
   npm --version
   ```

3. **Docker** (opcional, para desarrollo)
   ```bash
   docker --version
   docker-compose --version
   ```

4. **Google Cloud SDK** (para deploy)
   ```bash
   gcloud --version
   ```
   Si no está instalado: https://cloud.google.com/sdk/docs/install

---

## 🚀 Configuración Inicial

### 1. Crear cuenta en Supabase (Base de Datos Gratis)

1. Ve a https://supabase.com
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto:
   - **Nombre**: sireset
   - **Database Password**: Guarda esto (lo necesitarás)
   - **Region**: Elige la más cercana
4. Espera 2-3 minutos a que se cree
5. Ve a **Settings → Database** y copia:
   - **Connection string** (URI mode)
   - Ejemplo: `postgresql://postgres.xxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

### 2. Configurar Variables de Entorno

```bash
# En la raíz del proyecto
cp .env.example .env
nano .env  # o usa tu editor favorito
```

Edita `.env` con estos valores:

```bash
# Database (pegar la connection string de Supabase)
DATABASE_URL=postgresql://postgres.xxxx:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Security (generar una clave secreta)
SECRET_KEY=<genera-con-comando-abajo>

# Environment
ENVIRONMENT=development

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
```

**Generar SECRET_KEY:**
```bash
openssl rand -hex 32
```

### 3. Instalar Dependencias

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## 💻 Desarrollo Local

### Opción A: Con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up

# Acceder a:
# - Backend API: http://localhost:8080
# - API Docs: http://localhost:8080/api/docs
# - Frontend: http://localhost:3000 (si está habilitado)
```

### Opción B: Sin Docker (Manual)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m app.main

# O con uvicorn directamente:
uvicorn app.main:app --reload --port 8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Acceder a: http://localhost:3000
```

### 4. Crear Tablas en PostgreSQL

```bash
cd backend
python -c "from app.core.database import init_db; init_db()"
```

### 5. Crear Usuario Administrador Inicial

```python
cd backend
python

# En el shell de Python:
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()
admin = User(
    email="admin@reset.com.pe",
    name="Administrador",
    role="admin",
    pw_hash=hash_password("tu_password_seguro"),
    active=True,
    modules=["Mougli", "Mapito"]
)
db.add(admin)
db.commit()
print("✅ Admin creado")
```

---

## ☁️ Deploy a Google Cloud Run

### Paso 1: Configurar Google Cloud Project

```bash
# Autenticarse
gcloud auth login

# Crear proyecto (o usar uno existente)
gcloud projects create sireset-production --name="SiReset Production"

# Configurar proyecto actual
gcloud config set project sireset-production

# Habilitar facturación (requerido incluso para tier gratuito)
# Ve a: https://console.cloud.google.com/billing
```

### Paso 2: Configurar Secretos en Google Secret Manager

```bash
# Habilitar Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Crear secret para DATABASE_URL
echo -n "postgresql://postgres.xxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres" | \
  gcloud secrets create sireset-db-url --data-file=-

# Crear secret para SECRET_KEY
openssl rand -hex 32 | \
  gcloud secrets create sireset-secret-key --data-file=-
```

### Paso 3: Deploy Automático

```bash
cd deploy
chmod +x cloud-run-deploy.sh
./cloud-run-deploy.sh
```

O manualmente:

```bash
cd backend

# Build y push de imagen
gcloud builds submit --tag gcr.io/sireset-production/sireset-api

# Deploy a Cloud Run
gcloud run deploy sireset-api \
  --image gcr.io/sireset-production/sireset-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-secrets "DATABASE_URL=sireset-db-url:latest,SECRET_KEY=sireset-secret-key:latest"
```

### Paso 4: Obtener URL y Probar

```bash
# Obtener URL del servicio
gcloud run services describe sireset-api --region us-central1 --format 'value(status.url)'

# Probar health check
curl https://sireset-api-xxxx-uc.a.run.app/health
```

### Paso 5: Actualizar CORS en Producción

Edita `backend/app/core/config.py`:

```python
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://sireset-api-xxxx-uc.a.run.app",  # URL de tu backend
    "https://tusitio.com",  # Tu dominio frontend
]
```

Re-deploy:
```bash
cd deploy
./cloud-run-deploy.sh
```

---

## 🔄 Migración de Datos

Si vienes del sistema anterior (Streamlit + SQLite):

```bash
cd scripts
python migrate_sqlite_to_postgres.py
```

Este script:
1. ✅ Migra todos los usuarios existentes
2. ✅ Preserva contraseñas (se actualizarán a 600k iteraciones en primer login)
3. ✅ Migra módulos (Mougli, Mapito)
4. ✅ Mantiene roles y permisos

---

## 📚 API Documentation

### Acceder a Documentación Interactiva

**Desarrollo:**
- Swagger UI: http://localhost:8080/api/docs
- ReDoc: http://localhost:8080/api/redoc

**Producción:**
- Swagger UI: https://tu-servicio.run.app/api/docs

### Endpoints Principales

#### Autenticación

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=yourpassword
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Usuario",
    "role": "admin",
    "modules": ["Mougli", "Mapito"]
  }
}
```

#### Mougli - Procesar Archivos

```http
POST /api/mougli/process
Authorization: Bearer <token>
Content-Type: multipart/form-data

monitor_files: <archivo1.txt>
monitor_files: <archivo2.txt>
outview_files: <archivo1.csv>
```

Respuesta: Archivo Excel descargable

#### Mapito - Generar Mapa

```http
POST /api/mapito/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "color_general": "#713030",
  "color_selected": "#5F48C6",
  "show_basemap": true
}
```

Respuesta: HTML con mapa Folium

---

## 🔧 Troubleshooting

### Error: "Could not connect to database"

```bash
# Verificar que DATABASE_URL esté correcta
echo $DATABASE_URL

# Probar conexión directa
psql $DATABASE_URL
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
cd backend
pip install -r requirements.txt --force-reinstall
```

### Error en Cloud Run: "Container failed to start"

```bash
# Ver logs
gcloud run services logs read sireset-api --region us-central1 --limit 50

# Verificar secretos
gcloud secrets versions access latest --secret="sireset-db-url"
```

---

## 📊 Costos Estimados

### Configuración Recomendada (Gratis)

- **Google Cloud Run**: Gratis hasta 2M requests/mes
- **Supabase PostgreSQL**: Gratis 500MB
- **Total**: **$0/mes** si <2M requests

### Si necesitas escalar

- **Cloud Run (post-gratis)**: ~$0.00002400 por request
- **PostgreSQL Pro (Supabase)**: $25/mes (8GB, backups)
- **Total estimado para 50 usuarios**: **$5-15/mes**

---

## 🤝 Soporte

**Documentación adicional:**
- FastAPI: https://fastapi.tiangolo.com
- Google Cloud Run: https://cloud.google.com/run/docs
- Supabase: https://supabase.com/docs

**Problemas comunes:**
Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Changelog

### v2.0.0 (2025-11-05)
- ✅ Migración de Streamlit a FastAPI + React
- ✅ PostgreSQL en lugar de SQLite
- ✅ Autenticación JWT con 600k iteraciones PBKDF2
- ✅ Deploy a Google Cloud Run
- ✅ Frontend React moderno con Tailwind CSS
- ✅ API REST documentada con Swagger
- ✅ Sistema de migración de datos desde v1.0

---

**Desarrollado para Reset** | SiReset v2.0 | 2025
