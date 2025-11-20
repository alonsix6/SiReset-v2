# 🔧 Configuración de Supabase para Invitaciones

Esta guía te ayudará a configurar correctamente Supabase para que el sistema de invitaciones funcione al 100%.

---

## 📋 Tabla de Contenidos

1. [Configurar Redirect URLs](#1-configurar-redirect-urls)
2. [Configurar Email Template](#2-configurar-email-template)
3. [Verificar Service Role Key](#3-verificar-service-role-key)
4. [Probar el Flujo](#4-probar-el-flujo)

---

## 1. Configurar Redirect URLs

**⚠️ ESTO ES LO MÁS IMPORTANTE - Sin esto, el link del email NO funcionará**

### Paso 1: Ir a Authentication > URL Configuration

1. Abre tu proyecto Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto `jmzlfdbooafivioaapti`
3. En el menú lateral, haz clic en **"Authentication"**
4. Haz clic en **"URL Configuration"**

### Paso 2: Configurar Site URL

En el campo **"Site URL"**, asegúrate que tenga:

```
https://sireset-v2-381100913457.us-central1.run.app
```

### Paso 3: Configurar Redirect URLs

En el campo **"Redirect URLs"**, agrega las siguientes URLs (una por línea):

```
https://sireset-v2-381100913457.us-central1.run.app/crear-password
https://sireset-v2-381100913457.us-central1.run.app/auth/callback
https://sireset-v2-381100913457.us-central1.run.app/*
```

**¿Por qué estas URLs?**
- `/crear-password` → Donde el usuario crea su contraseña
- `/auth/callback` → Para OAuth (Google, etc.)
- `/*` → Wildcard para permitir otras rutas si es necesario

### Paso 4: Guardar Cambios

Haz clic en **"Save"** para guardar la configuración.

---

## 2. Configurar Email Template

### Paso 1: Ir a Email Templates

1. En el menú lateral, haz clic en **"Authentication"**
2. Haz clic en **"Email Templates"**
3. Selecciona **"Invite user"** en el dropdown

### Paso 2: Verificar el Template

Asegúrate que el botón de acción use `{{ .ConfirmationURL }}`:

```html
<a href="{{ .ConfirmationURL }}">ACTIVAR MI CUENTA</a>
```

**⚠️ IMPORTANTE:**
- NO uses `{{ .SiteURL }}` o cualquier otra variable
- `{{ .ConfirmationURL }}` es la ÚNICA variable que funciona correctamente
- Esta variable automáticamente incluye el `redirect_to` que configuramos en el backend

### Paso 3: Copiar el Template Completo

Si quieres usar el template que te di antes, cópialo completo desde el mensaje anterior y pégalo aquí.

### Paso 4: Guardar

Haz clic en **"Save"** para guardar el template.

---

## 3. Verificar Service Role Key

### Paso 1: Ir a Project Settings > API

1. En el menú lateral, haz clic en el ícono de **engranaje** (Settings)
2. Haz clic en **"API"**

### Paso 2: Verificar las Keys

Asegúrate que tengas las siguientes keys:

- **Project URL**: `https://jmzlfdbooafivioaapti.supabase.co`
- **anon public**: `eyJhbGci...` (ya configurada)
- **service_role**: `eyJhbGci...` (debe coincidir con la que pusimos en `.env.yaml`)

### Paso 3: Verificar que Backend tenga la Key

El backend ya tiene configurada la Service Role Key en `/backend/.env.yaml`:

```yaml
SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTI5MiwiZXhwIjoyMDc3OTUxMjkyfQ.MS4EKhndURjboFO81VS3DEYHm1m0wwC8-66Q50JigrU"
```

✅ Ya está configurado, no necesitas hacer nada aquí.

---

## 4. Probar el Flujo

### Paso 1: Desplegar Backend (si no lo has hecho)

```bash
cd backend
./deploy-to-cloudrun.sh
```

Esto desplegará el backend con todas las configuraciones actualizadas.

### Paso 2: Probar Invitación

1. Inicia sesión como `admin@reset.com.pe`
2. Ve a `/admin` (o haz clic en el botón "INVITAR" en la barra)
3. Haz clic en **"+ Invitar Usuario"**
4. Ingresa:
   - Email: `test@example.com`
   - Nombre: `Usuario de Prueba`
5. Haz clic en **"Enviar Invitación"**

### Paso 3: Revisar el Email

1. Ve al inbox de `test@example.com`
2. Busca el email de **"Reset"**
3. Haz clic en **"ACTIVAR MI CUENTA"**

### Paso 4: Verificar Redirección

**Resultado esperado:**
- Te redirige a: `https://sireset-v2-381100913457.us-central1.run.app/crear-password`
- Ves tu email mostrado
- Puedes crear una contraseña
- Después te redirige al dashboard

**Si NO funciona:**
- Verifica que agregaste las Redirect URLs en Supabase Dashboard
- Revisa que el backend esté desplegado con `.env.yaml` actualizado
- Mira la consola del navegador para ver errores

---

## 🎯 Checklist de Configuración

Usa este checklist para verificar que todo está configurado:

- [ ] Site URL configurado: `https://sireset-v2-381100913457.us-central1.run.app`
- [ ] Redirect URLs agregados (incluyendo `/crear-password`)
- [ ] Email template usa `{{ .ConfirmationURL }}`
- [ ] Backend desplegado con `.env.yaml` actualizado
- [ ] Service Role Key configurada correctamente
- [ ] Probado flujo de invitación completo

---

## 🐛 Troubleshooting

### Problema: El link me redirige a la plataforma principal, no a /crear-password

**Solución:**
1. Verifica que agregaste `https://sireset-v2-381100913457.us-central1.run.app/crear-password` en **Redirect URLs**
2. Verifica que el endpoint `/invite-user` usa `redirect_to` correctamente (ya está configurado)
3. Asegúrate que el backend está desplegado

### Problema: Error "Could not find the table 'public.user_profiles'"

**Solución:**
- ✅ Este error ya fue solucionado en el último commit
- Asegúrate de desplegar el backend actualizado

### Problema: No puedo listar usuarios en /admin

**Solución:**
1. Verifica que el backend tiene el `SUPABASE_SERVICE_ROLE_KEY` configurado
2. Despliega el backend con el nuevo endpoint `/list-users-supabase`
3. Verifica que `admin@reset.com.pe` tiene rol "admin" (ya se fuerza automáticamente)

---

## 📞 Soporte

Si sigues teniendo problemas después de seguir esta guía, revisa:

1. **Logs del backend**: `gcloud run logs read sireset-v2 --region us-central1`
2. **Consola del navegador**: Abre DevTools (F12) y ve a la pestaña Console
3. **Network tab**: Revisa las peticiones a `/api/auth/invite-user` y `/crear-password`

---

✅ Con esta configuración, el flujo de invitaciones debería funcionar perfectamente.
