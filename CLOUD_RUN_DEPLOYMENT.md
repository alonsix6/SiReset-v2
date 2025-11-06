# Guía de Deployment en Google Cloud Run

Esta guía te ayudará a desplegar tu aplicación SiReset-v2 en Google Cloud Run con GitHub integration.

## 📋 Prerequisitos

1. Cuenta de Google Cloud Platform (GCP) activa
2. Proyecto de GCP creado (puedes crear uno en https://console.cloud.google.com)
3. Repositorio GitHub: `alonsix6/SiReset-v2`
4. Proyecto de Supabase configurado con autenticación habilitada

## 🏗️ Arquitectura

Tu aplicación usa un Dockerfile multi-stage que:
- **Stage 1:** Construye el frontend React con Vite
- **Stage 2:** Configura el backend FastAPI + copia frontend construido
- **Resultado:** Una sola imagen Docker que sirve tanto API como frontend

El backend FastAPI sirve:
- API REST en `/api/*`
- Frontend estático en todas las demás rutas
- Health check en `/health`

## 🚀 Pasos para Deployment

### 1. Configurar Google Cloud Platform

#### A. Habilitar APIs necesarias

1. Ve a Google Cloud Console: https://console.cloud.google.com
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **APIs & Services** → **Enable APIs and Services**
4. Habilita estas APIs:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Container Registry API** (o Artifact Registry API)
   - **Cloud Resource Manager API**

#### B. Configurar facturación

- Asegúrate de tener una cuenta de facturación vinculada a tu proyecto
- Cloud Run tiene un tier gratuito generoso: 2 millones de requests/mes

### 2. Conectar GitHub con Cloud Run

1. Ve a **Cloud Run** en la consola de GCP
2. Click en **CREATE SERVICE**
3. Selecciona **Continuously deploy from a repository (source)**
4. Click en **SET UP WITH CLOUD BUILD**

#### Configurar el repositorio:

1. **Source Repository:**
   - Repository Provider: **GitHub**
   - Click en **Authenticate** y autoriza Google Cloud Build
   - Selecciona `alonsix6/SiReset-v2`
   - Branch: Selecciona la rama que quieres desplegar (ej: `main` o tu rama de desarrollo)

2. **Build Configuration:**
   - Build Type: **Dockerfile**
   - Source Location: `/Dockerfile` (debe estar en la raíz)
   - Click **SAVE**

### 3. Configurar el Servicio Cloud Run

#### Service Settings:

1. **Service name:** `sireset-v2` (o el nombre que prefieras)

2. **Region:** Selecciona la región más cercana a tus usuarios:
   - `us-central1` (Iowa) - recomendado para Latinoamérica
   - `southamerica-east1` (São Paulo) - si quieres hosting en Sudamérica
   - `us-east1` (Carolina del Sur)

3. **Authentication:**
   - ✅ **Allow unauthenticated invocations** (para que tu app sea pública)

#### Container Settings (expand "Container, Variables & Secrets, Connections, Security"):

1. **Container port:** `8080`

2. **Environment Variables** - Click en **ADD VARIABLE** para cada una:

   | Variable | Value | Descripción |
   |----------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://jmzlfdbooafivioaapti.supabase.co` | URL de Supabase |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Anon key de Supabase |
   | `DATABASE_URL` | `postgresql://user:pass@host/db` | URL de PostgreSQL (Supabase) |
   | `SECRET_KEY` | `tu-secret-key-aqui` | Para JWT tokens |
   | `CORS_ORIGINS` | `*` | Permitir todas las origins (o tu dominio específico) |

   **Importante:** Para obtener la DATABASE_URL de Supabase:
   - Ve a Supabase Dashboard → Settings → Database
   - Copia la URI de conexión (modo Transaction)
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña de database

3. **Resources:**
   - **CPU:** 1 (suficiente para empezar)
   - **Memory:** 512 MiB (puede ajustarse según necesidad)
   - **Request timeout:** 300 seconds
   - **Maximum requests per container:** 80

4. **Autoscaling:**
   - **Minimum instances:** 0 (scale to zero para ahorrar costos)
   - **Maximum instances:** 10

5. **Ingress Control:**
   - ✅ **All** (permitir todo el tráfico)

### 4. Deploy

1. Click en **CREATE** o **DEPLOY**
2. Cloud Build comenzará a:
   - Clonar tu repositorio
   - Construir el frontend (Stage 1)
   - Construir el backend (Stage 2)
   - Crear la imagen Docker
   - Desplegar en Cloud Run
3. Este proceso toma aproximadamente **5-7 minutos** la primera vez
4. Verás el progreso en **Cloud Build** → **History**

### 5. Obtener tu URL

Una vez completado el deployment:

1. Ve a **Cloud Run** → **Services**
2. Verás tu servicio `sireset-v2`
3. La URL será algo como: `https://sireset-v2-XXXXX-uc.a.run.app`
4. **Copia esta URL** - la necesitarás para Supabase

### 6. Configurar Supabase para Producción

Ahora que tienes tu URL de Cloud Run:

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
2. Ve a **Authentication** → **URL Configuration**

3. **Site URL:** Configura tu URL de Cloud Run
   ```
   https://sireset-v2-XXXXX-uc.a.run.app
   ```

4. **Redirect URLs:** Agrega estas URLs (una por línea):
   ```
   https://sireset-v2-XXXXX-uc.a.run.app
   https://sireset-v2-XXXXX-uc.a.run.app/auth/callback
   http://localhost:5173
   http://localhost:5173/auth/callback
   ```
   (Las de localhost son para desarrollo local)

5. **Guarda los cambios**

### 7. Crear tu Primer Usuario Admin

Una vez desplegada la aplicación:

1. **Accede a tu aplicación** en la URL de Cloud Run
2. **Regístrate** con email/contraseña o Google OAuth
3. **Configura como admin:**
   - Ve a Supabase Dashboard → **Authentication** → **Users**
   - Encuentra tu usuario y haz clic en los tres puntos → **Edit User**
   - En **User Metadata**, agrega:
     ```json
     {
       "role": "admin",
       "modules": ["Mougli", "Mapito"]
     }
     ```
   - Click en **Save**
4. **Recarga tu aplicación** - ahora verás el menú **Admin**

## 🔄 Deployments Automáticos con GitHub

Cloud Run está configurado para deployment automático:

### Push to Main/Branch
Cada vez que hagas push a la rama configurada:
1. Cloud Build detecta el cambio automáticamente
2. Reconstruye la imagen Docker
3. Despliega la nueva versión
4. Hace rollout gradual (sin downtime)

### Ver el progreso:
- **Cloud Build** → **History** para ver builds
- **Cloud Run** → **Revisions** para ver versiones desplegadas

### Rollback:
Si algo sale mal, puedes hacer rollback instantáneamente:
1. Ve a **Cloud Run** → tu servicio → **REVISIONS**
2. Selecciona una revisión anterior
3. Click en **MANAGE TRAFFIC**
4. Asigna 100% del tráfico a esa revisión

## 📊 Panel de Admin

Una vez que tengas rol de admin, puedes:
- Ver estadísticas de usuarios (total, admins, programadores)
- Cambiar roles de usuarios (user, programmer, admin)
- Asignar módulos específicos (Mougli, Mapito) a usuarios
- Ver información de proveedores de auth (email, google)

**Roles disponibles:**
- **Admin:** Acceso completo + panel de administración
- **Programmer:** Acceso a módulos asignados, puede modificar configs
- **User:** Solo módulos específicamente asignados

## 🔍 Monitoreo y Debugging

### Logs en Cloud Run

1. Ve a **Cloud Run** → tu servicio
2. Click en **LOGS**
3. Verás:
   - Requests HTTP
   - Errores de aplicación
   - Tiempos de respuesta
   - Cold starts

### Métricas

En la misma página:
- **METRICS** muestra:
  - Request count
  - Request latency
  - Container instances
  - Memory usage
  - CPU utilization

### Alertas

Configura alertas para:
- Error rate alto
- Latencia elevada
- Container crashes

## 🐛 Troubleshooting

### Error: "unable to evaluate symlinks in Dockerfile path"
✅ **Resuelto** - El Dockerfile ahora está en `/Dockerfile` (raíz del proyecto)

### Build falla: "npm install failed"
- Verifica que `frontend/package.json` esté en el repo
- Revisa los logs de Cloud Build para detalles del error
- Puede ser un problema de dependencias - verifica package-lock.json

### Build falla: "Module not found" (Python)
- Verifica que `backend/requirements.txt` tenga todas las dependencias
- Asegúrate de que el path en Dockerfile es correcto: `backend/app`

### Error: "Invalid Redirect URL" en login
- Verifica que agregaste la URL de Cloud Run en Supabase
- Asegúrate de incluir `/auth/callback`
- Espera 1-2 minutos para que Supabase propague los cambios

### Login con Google no funciona
- Verifica que Google OAuth esté habilitado en Supabase
- Confirma que las Redirect URLs estén correctamente configuradas
- Revisa que el dominio de Cloud Run esté autorizado

### No veo el panel de Admin
- Verifica que tu usuario tenga `"role": "admin"` en user_metadata
- Cierra sesión y vuelve a iniciar para refrescar el token
- Revisa la consola del navegador (F12) para errores

### App muy lenta o cold starts
- Aumenta el **Minimum instances** a 1 (evita cold starts pero cuesta más)
- Aumenta la memoria asignada a 1 GiB
- Verifica que no haya queries lentas en el backend

### Error 503 o timeout
- Aumenta el **Request timeout** a 300 segundos
- Verifica que el backend responda en `/health`
- Revisa logs para ver dónde se traba

## 💰 Costos Estimados

Con el plan gratuito de Cloud Run:
- **Gratis:** 2 millones de requests/mes
- **Gratis:** 360,000 GB-segundos de memoria/mes
- **Gratis:** 180,000 vCPU-segundos/mes

Para uso moderado (< 10,000 users/mes): **$0 - $10/mes**

## 🔐 Seguridad

### Variables de Entorno Sensibles

- ✅ `VITE_SUPABASE_ANON_KEY` es segura (clave pública)
- ⚠️ `SECRET_KEY` debe ser una clave fuerte y única
- ⚠️ `DATABASE_URL` contiene credenciales - mantener en variables de entorno

### Mejores Prácticas

1. **No hardcodear secretos** en el código
2. **Usar Secret Manager** para secretos muy sensibles:
   - Ve a **Secret Manager** en GCP
   - Crea secretos
   - Referencialos en Cloud Run

3. **Habilitar HTTPS only** (Cloud Run lo hace por defecto)

4. **Configurar CORS** correctamente en producción:
   ```python
   # En vez de "*", usa tu dominio específico
   CORS_ORIGINS = ["https://sireset-v2-XXXXX-uc.a.run.app"]
   ```

## 📚 Recursos Adicionales

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Cloud Build Docs:** https://cloud.google.com/build/docs
- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

## ✅ Checklist Post-Deployment

- [ ] Aplicación desplegada exitosamente en Cloud Run
- [ ] URL de Cloud Run obtenida
- [ ] Redirect URLs configuradas en Supabase
- [ ] Variables de entorno configuradas en Cloud Run
- [ ] Health check responde correctamente (`/health`)
- [ ] Login con email/contraseña funciona
- [ ] Login con Google funciona
- [ ] Primer usuario admin creado
- [ ] Panel de admin accesible
- [ ] Módulos Mougli y Mapito accesibles
- [ ] Logs y métricas monitoreadas

---

**¡Felicidades!** Tu aplicación SiReset-v2 está ahora en producción en Google Cloud Run. 🎉
