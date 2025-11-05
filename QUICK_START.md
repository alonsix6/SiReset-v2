# 🚀 QUICK START - SiReset v2.0

**Inicio rápido en 15 minutos**

---

## ⚡ DESARROLLO LOCAL (5 minutos)

### 1. Configurar Base de Datos

**Opción A: Usar Docker (más rápido)**
```bash
docker-compose up -d db
```

**Opción B: Crear cuenta Supabase (gratis)**
1. https://supabase.com → Sign up
2. New Project → Name: `sireset`
3. Copiar connection string

### 2. Configurar Entorno

```bash
# Copiar .env
cp .env.example .env

# Si usas Docker:
# DATABASE_URL ya está configurado en docker-compose.yml

# Si usas Supabase:
# Edita .env y pega tu connection string

# Generar SECRET_KEY
openssl rand -hex 32
# Copiar resultado a .env
```

### 3. Instalar y Ejecutar

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Crear tablas
python -c "from app.core.database import init_db; init_db()"

# Crear admin
python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
import json

db = SessionLocal()
admin = User(
    email='admin@test.com',
    name='Admin',
    role='admin',
    pw_hash=hash_password('admin123'),
    active=True,
    modules=json.dumps(['Mougli', 'Mapito'])
)
db.add(admin)
db.commit()
print('✅ Admin creado: admin@test.com / admin123')
"

# Iniciar backend
uvicorn app.main:app --reload --port 8080
```

**En otra terminal:**
```bash
# Frontend
cd frontend
npm install
npm run dev
```

### 4. Probar

- Frontend: http://localhost:3000
- Login: `admin@test.com` / `admin123`
- API Docs: http://localhost:8080/api/docs

---

## ☁️ DEPLOY A CLOUD RUN (10 minutos)

### 1. Preparar Google Cloud

```bash
# Instalar gcloud (si no lo tienes)
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Crear proyecto
gcloud projects create sireset-prod --name="SiReset"

# Configurar
gcloud config set project sireset-prod

# Habilitar APIs (ve a console.cloud.google.com/billing y habilita facturación primero)
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Crear Secretos

```bash
# DATABASE_URL (tu connection string de Supabase)
echo -n "postgresql://postgres.xxxx:PASSWORD@..." | \
  gcloud secrets create sireset-db-url --data-file=-

# SECRET_KEY
openssl rand -hex 32 | \
  gcloud secrets create sireset-secret-key --data-file=-
```

### 3. Deploy

```bash
cd deploy
chmod +x cloud-run-deploy.sh
GCP_PROJECT_ID=sireset-prod ./cloud-run-deploy.sh
```

### 4. Verificar

```bash
# Debe retornar {"status":"healthy"}
curl https://sireset-api-xxxx-uc.a.run.app/health
```

---

## 🔄 MIGRAR DATOS ANTIGUOS

Si vienes del sistema Streamlit anterior:

```bash
# Asegúrate de tener sireset.db en la raíz del proyecto
cd scripts
python migrate_sqlite_to_postgres.py
```

Migra:
- ✅ Usuarios (sol.vivanco, vicky.montero)
- ✅ Contraseñas (se actualizarán en primer login)
- ✅ Módulos y permisos

---

## 📝 CREDENCIALES POR DEFECTO

**Desarrollo local:**
- Email: `admin@test.com`
- Password: `admin123`

**Usuarios migrados** (si corriste migración):
- `sol.vivanco@reset.com.pe` (password sin cambios)
- `vicky.montero@reset.com.pe` (password sin cambios)

---

## 🆘 PROBLEMAS COMUNES

### "Cannot connect to database"
```bash
# Verificar que DATABASE_URL esté correcta
echo $DATABASE_URL

# Probar conexión
psql $DATABASE_URL
```

### "Module not found: app"
```bash
# Asegurarse de estar en /backend
cd backend
source venv/bin/activate
```

### "Port 8080 already in use"
```bash
# Matar proceso en puerto 8080
lsof -ti:8080 | xargs kill -9
```

### Docker no inicia
```bash
# Verificar Docker corriendo
docker ps

# Reiniciar Docker
docker-compose down
docker-compose up -d
```

---

## ✅ CHECKLIST DE ÉXITO

- [ ] Backend corre en http://localhost:8080
- [ ] API Docs visibles en /api/docs
- [ ] Frontend corre en http://localhost:3000
- [ ] Login funciona
- [ ] Puedes ver Dashboard
- [ ] Cloud Run deploy exitoso (opcional)

---

## 📚 PRÓXIMOS PASOS

1. Lee [README.md](./README.md) completo
2. Revisa [MANUAL_CONFIG_NEEDED.md](./MANUAL_CONFIG_NEEDED.md)
3. Explora API en /api/docs
4. Personaliza frontend en `frontend/src/`

---

**¿Listo en <15 minutos?** 🎉
