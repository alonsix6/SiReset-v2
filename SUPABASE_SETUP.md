# 🔐 Configuración de Supabase para SiReset v2.0

Esta guía te ayudará a configurar Supabase Auth con Google OAuth para el proyecto SiReset.

---

## ✅ Lo que ya está configurado

- ✅ Proyecto Supabase creado: `https://jmzlfdbooafivioaapti.supabase.co`
- ✅ API Key configurada en `.env`
- ✅ Cliente Supabase instalado (`supabaseClient.js`)
- ✅ Auth UI component integrado
- ✅ Login con Email/Password habilitado

---

## 🔧 Configuración de Google OAuth (Paso a Paso)

### PASO 1: Configurar Google Cloud Console

1. **Ve a Google Cloud Console**
   - https://console.cloud.google.com/

2. **Crear un proyecto (si no tienes uno)**
   - Click en "Select a project" → "New Project"
   - Nombre: `SiReset` (o el que prefieras)
   - Click "Create"

3. **Habilitar Google+ API**
   - Ve a "APIs & Services" → "Library"
   - Busca "Google+ API"
   - Click "Enable"

4. **Configurar OAuth Consent Screen**
   - Ve a "APIs & Services" → "OAuth consent screen"
   - Selecciona "External" (o "Internal" si es para tu organización)
   - Click "Create"

   **Completa la información:**
   - App name: `SiReset`
   - User support email: Tu email
   - Developer contact: Tu email
   - Click "Save and Continue"

   **Scopes (permisos):**
   - Click "Add or Remove Scopes"
   - Selecciona:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Save and Continue"

   **Test users (opcional para desarrollo):**
   - Agrega emails de prueba si quieres
   - Click "Save and Continue"

5. **Crear OAuth 2.0 Client ID**
   - Ve a "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `SiReset Web Client`

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://jmzlfdbooafivioaapti.supabase.co
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://jmzlfdbooafivioaapti.supabase.co/auth/v1/callback
   ```

   - Click "Create"

6. **Copiar credenciales**
   - Aparecerá un popup con:
     - **Client ID**: `123456789-abc.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxx`
   - **GUÁRDALOS** - los necesitarás en el siguiente paso

---

### PASO 2: Configurar Google en Supabase

1. **Ve a tu dashboard de Supabase**
   - https://supabase.com/dashboard/project/jmzlfdbooafivioaapti

2. **Ir a Authentication Settings**
   - Click en "Authentication" en el menú lateral
   - Click en "Providers"

3. **Configurar Google Provider**
   - Busca "Google" en la lista
   - Click para expandir
   - **Enable**: Activa el toggle

   **Pega las credenciales de Google Cloud:**
   - **Client ID**: Pega el Client ID que copiaste
   - **Client Secret**: Pega el Client Secret

   - Click "Save"

---

### PASO 3: Configurar Email Authentication (ya habilitado)

Si quieres permitir login con email/password sin confirmación:

1. En Supabase Dashboard → Authentication → Settings
2. **Email Auth**:
   - ✅ Enable email confirmations: Desactivar (para desarrollo)
   - ✅ Enable email provider: Activar
3. Click "Save"

**Para producción**, recomiendo activar confirmación de email.

---

## 🧪 Probar la Configuración

### Opción 1: Probar localmente

```bash
cd frontend
npm install  # Instalar dependencias nuevas (@supabase/*)
npm run dev
```

**Abrir en navegador:** http://localhost:3000

**Deberías ver:**
- ✅ Formulario de login con email/password
- ✅ Botón "Sign in with Google"

**Probar Google OAuth:**
1. Click en "Sign in with Google"
2. Selecciona tu cuenta de Google
3. Permite los permisos
4. Deberías ser redirigido al Dashboard

**Probar Email/Password:**
1. Click en "Sign up" (si no tienes cuenta)
2. Ingresa email y contraseña
3. Click "Sign up"
4. Deberías ser redirigido al Dashboard

---

### Opción 2: Verificar en Supabase Dashboard

1. Ve a Authentication → Users
2. Deberías ver los usuarios que se registraron
3. Verifica que tengan:
   - ✅ Email
   - ✅ Provider (email o google)
   - ✅ Metadata (nombre, etc.)

---

## 🔑 Variables de Entorno

Verifica que `/frontend/.env` tenga:

```bash
VITE_SUPABASE_URL=https://jmzlfdbooafivioaapti.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzUyOTIsImV4cCI6MjA3Nzk1MTI5Mn0.54NCHCK4h5MukcsVAgqAPBHrAAurypaR89G2EtZcfos
VITE_API_URL=http://localhost:8080
```

---

## 🛡️ Seguridad: Row Level Security (RLS)

**IMPORTANTE:** Para producción, habilita RLS en tus tablas.

1. Ve a Supabase → Table Editor
2. Para cada tabla, click en "..." → "Enable RLS"
3. Crear políticas de acceso

**Ejemplo de política básica:**
```sql
-- Permitir que usuarios lean solo sus propios datos
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

---

## 🎨 Personalizar Auth UI (opcional)

El componente `<Auth />` en `Login.jsx` ya está personalizado con:
- ✅ Colores morados (brand: #5f48c6)
- ✅ Textos en español
- ✅ Theme Supa (moderno)

**Para personalizar más:**
```jsx
<Auth
  supabaseClient={supabase}
  appearance={{
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: '#tu-color-aqui',
          brandAccent: '#tu-color-hover',
        }
      }
    }
  }}
  providers={['google', 'github', 'facebook']} // Agregar más providers
/>
```

---

## 📊 Flujo de Autenticación

```
Usuario → Click "Sign in with Google"
  ↓
Redirect a Google OAuth
  ↓
Usuario selecciona cuenta y permite permisos
  ↓
Google redirect a: https://jmzlfdbooafivioaapti.supabase.co/auth/v1/callback
  ↓
Supabase procesa auth y redirect a: http://localhost:3000/auth/callback
  ↓
AuthCallback.jsx detecta sesión
  ↓
Redirect a Dashboard (/) con usuario autenticado
```

---

## 🆘 Troubleshooting

### Error: "Invalid redirect URL"

**Solución:**
- Verifica que la URL de callback esté en Google Cloud Console:
  - `https://jmzlfdbooafivioaapti.supabase.co/auth/v1/callback`

### Error: "Access blocked: This app's request is invalid"

**Solución:**
- Completa OAuth Consent Screen en Google Cloud Console
- Agrega tu email como test user
- Verifica que los scopes estén correctos

### Google login no funciona pero email sí

**Solución:**
1. Verifica que Google Provider esté habilitado en Supabase
2. Verifica Client ID y Client Secret en Supabase
3. Verifica redirect URLs en Google Cloud Console

### Usuarios no aparecen en Supabase Dashboard

**Solución:**
- Ve a Authentication → Users
- Si no aparecen, verifica la consola del navegador (F12) para errores

---

## ✅ Checklist de Configuración

- [ ] Proyecto Google Cloud creado
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID creado
- [ ] Redirect URIs configuradas en Google Cloud
- [ ] Google Provider habilitado en Supabase
- [ ] Client ID y Secret configurados en Supabase
- [ ] Variables de entorno configuradas en `.env`
- [ ] `npm install` ejecutado en `/frontend`
- [ ] Aplicación corriendo (`npm run dev`)
- [ ] Login con Google probado y funciona
- [ ] Login con Email probado y funciona

---

## 🎉 ¡Listo!

Si completaste todos los pasos, deberías poder:
- ✅ Iniciar sesión con Google
- ✅ Iniciar sesión con Email/Password
- ✅ Ver usuarios en Supabase Dashboard
- ✅ Acceder al Dashboard de SiReset

**¿Problemas?** Revisa la sección Troubleshooting o abre un issue.

---

**Documentación oficial:**
- Supabase Auth: https://supabase.com/docs/guides/auth
- Google OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google
