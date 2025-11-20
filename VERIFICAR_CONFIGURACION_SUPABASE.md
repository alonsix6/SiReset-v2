# ✅ CHECKLIST: Verificar Configuración de Supabase

Sigue estos pasos EXACTAMENTE para verificar que todo está configurado:

---

## 1️⃣ Verificar Redirect URLs

**URL:** https://supabase.com/dashboard/project/jmzlfdbooafivioaapti/auth/url-configuration

### Paso 1: Site URL
Debe ser EXACTAMENTE:
```
https://sireset-v2-381100913457.us-central1.run.app
```
❌ **NO** terminar con `/`
❌ **NO** agregar rutas adicionales

### Paso 2: Redirect URLs
Debe incluir estas 3 URLs (una por línea):

```
https://sireset-v2-381100913457.us-central1.run.app/crear-password
https://sireset-v2-381100913457.us-central1.run.app/auth/callback
https://sireset-v2-381100913457.us-central1.run.app/*
```

**Captura de pantalla de cómo debe verse:**
```
┌─────────────────────────────────────────────────────────────┐
│ Site URL                                                     │
│ https://sireset-v2-381100913457.us-central1.run.app        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Redirect URLs (one per line)                                │
│ https://sireset-v2-381100913457.us-central1.run.app/crear-password
│ https://sireset-v2-381100913457.us-central1.run.app/auth/callback
│ https://sireset-v2-381100913457.us-central1.run.app/*       │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Guardar
1. Hacer clic en **"Save"**
2. Esperar que aparezca confirmación
3. Refrescar la página para verificar que se guardó

---

## 2️⃣ Verificar Email Template

**URL:** https://supabase.com/dashboard/project/jmzlfdbooafivioaapti/auth/templates

### Paso 1: Seleccionar Template
1. En el dropdown, seleccionar **"Invite user"**
2. Buscar el botón de acción en el HTML

### Paso 2: Verificar Variable
El botón debe usar **EXACTAMENTE** esta variable:

```html
<a href="{{ .ConfirmationURL }}">ACTIVAR MI CUENTA</a>
```

❌ **NO usar:**
- `{{ .SiteURL }}`
- `{{ .TokenHash }}`
- Ninguna otra variable

✅ **SOLO usar:** `{{ .ConfirmationURL }}`

### Paso 3: Guardar
1. Hacer clic en **"Save"**
2. Verificar que aparezca confirmación

---

## 3️⃣ Probar con Usuario Nuevo

### Paso 1: Eliminar Usuario Anterior (si existe)
1. **Authentication** → **Users**
2. Buscar el email que invitaste
3. **Delete User**

### Paso 2: Enviar NUEVA Invitación
1. En tu app, ir a `/admin`
2. Invitar un **email completamente nuevo**
3. Por ejemplo: `test-verificacion@ejemplo.com`

### Paso 3: Verificar Email
1. Abrir el email
2. **ANTES de hacer clic**, hacer clic derecho en "ACTIVAR MI CUENTA"
3. Seleccionar **"Copiar dirección del enlace"**
4. Pegar el link en un bloc de notas

### Paso 4: Verificar el Link
El link debe verse así:
```
https://jmzlfdbooafivioaapti.supabase.co/auth/v1/verify?token=...&type=invite&redirect_to=https://sireset-v2-381100913457.us-central1.run.app/crear-password
```

**Verificar que:**
- ✅ Incluye `redirect_to=`
- ✅ El redirect_to apunta a `/crear-password`

### Paso 5: Hacer Clic
1. Hacer clic en el botón
2. **Debe redirigir a:** `/crear-password`
3. **NO debe redirigir a:** `/#`

---

## 🐛 Si SIGUE sin funcionar

Si después de verificar todo lo anterior SIGUE redirigiendo a `/#`, entonces:

### Opción 1: Verificar Logs del Backend
```bash
gcloud run logs read sireset-v2 --region us-central1 --limit 50
```
Buscar si hay errores al enviar invitaciones.

### Opción 2: Verificar Petición Real
Abre DevTools (F12) en tu navegador cuando hagas clic en el botón del email:
1. Ir a la pestaña **Network**
2. Hacer clic en el botón del email
3. Buscar la petición a `/auth/v1/verify`
4. Ver a qué URL redirige finalmente

### Opción 3: Probar Manualmente el Endpoint
```bash
curl -X POST https://sireset-v2-381100913457.us-central1.run.app/api/auth/invite-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","name":"Test User"}'
```

Debería responder:
```json
{"message":"Usuario invitado exitosamente","email":"test@ejemplo.com","user_id":"..."}
```

---

## 📸 Por Favor, Envíame

Para ayudarte mejor, envíame:

1. **Screenshot de Redirect URLs** en Supabase Dashboard
2. **Screenshot del Email Template** (la parte del botón)
3. **El link completo** del email (copia el link antes de hacer clic)

Con eso puedo ver exactamente qué está fallando.

---

✅ Si seguiste TODO este checklist y sigue sin funcionar, hay algo más que necesitamos revisar.
