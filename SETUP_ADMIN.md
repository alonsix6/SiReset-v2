# Crear Primer Administrador - Guía Rápida

Esta guía muestra **3 formas** de hacer administrador a un usuario en SiReset.

## 🎯 Opciones Disponibles

| Método | Dificultad | Cuándo Usar |
|--------|-----------|-------------|
| **1. Supabase Dashboard** | ⭐ Fácil | Primera vez, acceso manual |
| **2. Script Node.js** | ⭐⭐ Medio | Automatización local |
| **3. API Endpoint** | ⭐⭐⭐ Avanzado | Automatización remota, CI/CD |

---

## 🔥 Método 1: Supabase Dashboard (MÁS FÁCIL)

### Requisitos
- Acceso a Supabase Dashboard

### Pasos

**1. Crea el usuario en Supabase**

```
URL: https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
1. Ve a Authentication → Users
2. Click "Add User"
3. Completa:
   - Email: admin@reset.com
   - Password: [contraseña segura]
   - Auto Confirm User: ✅ (marcar!)
4. Click "Create User"
```

**2. Asigna rol de administrador**

```
1. Encuentra el usuario en la lista
2. Click en ⋮ (tres puntos) → Edit User
3. En "Raw User Meta Data", pega:

{
  "role": "admin",
  "name": "Administrador Principal",
  "modules": ["Mougli", "Mapito"]
}

4. Click "Save"
```

**3. Listo!**

```
El usuario puede iniciar sesión en:
https://tu-url.run.app

Con:
- Email: admin@reset.com
- Password: [la contraseña que pusiste]
```

---

## 💻 Método 2: Script Node.js (LOCAL)

### Requisitos
- Node.js instalado
- Acceso al código fuente
- Service Role Key de Supabase

### Paso 1: Obtener Service Role Key

```
1. Ve a: https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
2. Settings → API
3. Busca "service_role" key (secret)
4. Click "Reveal" y copia la clave
```

⚠️ **IMPORTANTE**: El service_role key es un secreto. NO lo compartas ni lo subas a git.

### Paso 2: Configurar .env

Crea o edita `.env` en la raíz del proyecto:

```bash
SUPABASE_URL=https://jmzlfdbooafivioaapti.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTI5MiwiZXhwIjoyMDc3OTUxMjkyfQ.XXXXXXXXXX
```

### Paso 3: Ejecutar Script

**Opción A: Si ya tienes el usuario creado en Supabase**

```bash
node scripts/make-admin.js admin@reset.com
```

**Opción B: Si necesitas crear el usuario primero**

Primero créalo en Supabase Dashboard (paso 1 del Método 1), luego ejecuta:

```bash
node scripts/make-admin.js admin@reset.com
```

### Salida Esperada

```
🔍 Buscando usuario: admin@reset.com
📡 Consultando API de Supabase...
✅ Usuario encontrado: admin@reset.com
   ID: 123abc...
   Rol actual: user

⚙️  Actualizando permisos de administrador...

✅ ¡Éxito! Usuario actualizado a administrador

👤 Usuario: admin@reset.com
🎭 Rol: admin
📦 Módulos: Mougli, Mapito

⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar
   para que los cambios tomen efecto.
```

---

## 🌐 Método 3: API Endpoint (REMOTO)

### Requisitos
- App desplegada en Cloud Run
- Secret Key del servidor
- Service Role Key configurado en Cloud Run

### Paso 1: Configurar Variables en Cloud Run

```
1. Ve a: Cloud Run → tu servicio → Edit & Deploy New Revision
2. En "Environment Variables", agrega:

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SECRET_KEY=tu_secret_key_segura

3. Deploy
```

### Paso 2: Verificar que el endpoint esté disponible

```bash
curl https://tu-url.run.app/api/setup/health
```

Deberías ver:
```json
{
  "status": "ok",
  "supabase_configured": true,
  "secret_key_configured": true,
  "note": "Para hacer admin a un usuario, usa POST /api/setup/make-admin con X-Secret-Key header"
}
```

### Paso 3: Hacer Admin a un Usuario

**Opción A: Con curl**

```bash
curl -X POST https://tu-url.run.app/api/setup/make-admin \
  -H "Content-Type: application/json" \
  -H "X-Secret-Key: tu_secret_key_segura" \
  -d '{
    "email": "admin@reset.com",
    "name": "Administrador Principal"
  }'
```

**Opción B: Con Postman**

```
Method: POST
URL: https://tu-url.run.app/api/setup/make-admin

Headers:
  Content-Type: application/json
  X-Secret-Key: tu_secret_key_segura

Body (JSON):
{
  "email": "admin@reset.com",
  "name": "Administrador Principal"
}
```

**Opción C: Con JavaScript/Fetch**

```javascript
const response = await fetch('https://tu-url.run.app/api/setup/make-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Secret-Key': 'tu_secret_key_segura'
  },
  body: JSON.stringify({
    email: 'admin@reset.com',
    name: 'Administrador Principal'
  })
})

const result = await response.json()
console.log(result)
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Usuario admin@reset.com actualizado a administrador exitosamente. IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar para que los cambios tomen efecto.",
  "user": {
    "id": "123abc...",
    "email": "admin@reset.com",
    "role": "admin",
    "name": "Administrador Principal",
    "modules": ["Mougli", "Mapito"]
  }
}
```

### Errores Comunes

**Error 401: X-Secret-Key inválido**
```json
{"detail": "X-Secret-Key inválido o faltante"}
```
→ Verifica que el header X-Secret-Key sea correcto

**Error 404: Usuario no encontrado**
```json
{"detail": "Usuario no encontrado: admin@reset.com. Usuarios disponibles: [...]"}
```
→ Primero crea el usuario en Supabase Dashboard

**Error 500: SUPABASE_SERVICE_ROLE_KEY no configurada**
```json
{"detail": "Servidor no configurado correctamente"}
```
→ Agrega SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de Cloud Run

---

## 🔐 Seguridad

### Service Role Key

⚠️ **MUY IMPORTANTE**:

- El `service_role` key es **super secreto**
- Tiene acceso total a tu base de datos
- NUNCA lo compartas ni lo subas a git
- NUNCA lo pongas en el código frontend
- Solo úsalo en:
  - Variables de entorno del servidor
  - Scripts locales (.env en tu máquina)
  - CI/CD con secrets

### Secret Key

- Usa una clave segura generada aleatoriamente
- Cámbiala si se compromete
- No la compartas con usuarios regulares
- Solo para administradores del sistema

### Generar Secret Key Segura

```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Opción 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🆘 Troubleshooting

### "Usuario debe cerrar sesión"

**Problema**: Hice admin a un usuario pero sigue sin ver el panel Admin

**Solución**:
1. El usuario debe hacer logout
2. Cerrar sesión completamente en SiReset
3. Volver a iniciar sesión
4. Ahora verá el menú Admin

**Razón**: El JWT token guarda los permisos antiguos. Al cerrar sesión y volver a iniciar, se genera un nuevo token con los nuevos permisos.

### Script dice "Usuario no encontrado"

**Problema**: `❌ ERROR: No se encontró usuario con email: admin@reset.com`

**Solución**:
1. Verifica que el email esté escrito correctamente (sin espacios)
2. Crea primero el usuario en Supabase Dashboard
3. Luego ejecuta el script

### Endpoint retorna 401

**Problema**: `{"detail": "X-Secret-Key inválido o faltante"}`

**Solución**:
1. Verifica que el header sea exactamente `X-Secret-Key` (mayúsculas/minúsculas)
2. Verifica que el valor coincida con SECRET_KEY del servidor
3. Si usas curl, asegúrate de que las comillas estén correctas

### Service Role Key no funciona

**Problema**: Error 401 o 403 de Supabase

**Solución**:
1. Ve a Supabase Dashboard → Settings → API
2. Verifica que estés usando el **service_role** key (NO el anon key)
3. El service_role key es mucho más largo que el anon key
4. Copia la clave completa sin espacios extras

---

## 📝 Checklist Post-Setup

Después de crear tu primer admin:

- [ ] Usuario puede iniciar sesión en SiReset
- [ ] Usuario ve el menú "Admin" (⚙️) en la navegación
- [ ] Al entrar a /admin, ve la lista de usuarios
- [ ] Puede cambiar roles de otros usuarios
- [ ] Puede asignar/desasignar módulos
- [ ] Cerró sesión del usuario admin y volvió a entrar (para confirmar que el token se regenera correctamente)

---

## 🎉 ¡Listo!

Una vez que tengas tu primer administrador, puedes:

1. **Gestionar usuarios desde el Panel Admin** (/admin)
2. **Crear más usuarios** en Supabase Dashboard
3. **Asignar roles y módulos** desde SiReset
4. **No necesitas usar estos scripts nuevamente** (a menos que quieras automatizar)

Para gestión continua de usuarios, usa el **Panel Admin** en SiReset.

---

**Documentación relacionada:**
- [GESTION_USUARIOS.md](./GESTION_USUARIOS.md) - Gestión completa de usuarios
- [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) - Deployment en Cloud Run
