# Guía de Deployment en Vercel

Esta guía te ayudará a desplegar tu aplicación SiReset-v2 en Vercel.

## 📋 Prerequisitos

1. Cuenta de GitHub con el repositorio SiReset-v2
2. Cuenta de Vercel (puedes usar tu cuenta de GitHub para crear una)
3. Proyecto de Supabase configurado con autenticación habilitada

## 🚀 Pasos para Deployment

### 1. Preparar Supabase para Producción

Antes de desplegar, necesitas configurar la URL de redirección en Supabase:

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
2. Ve a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega:
   - Tu URL de producción de Vercel (ej: `https://tu-app.vercel.app`)
   - La ruta de callback: `https://tu-app.vercel.app/auth/callback`

**Nota:** Actualizarás estas URLs después de obtener tu dominio de Vercel en el paso 4.

### 2. Conectar GitHub con Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **Sign Up** y selecciona **Continue with GitHub**
3. Autoriza a Vercel para acceder a tus repositorios

### 3. Importar tu Proyecto

1. En el dashboard de Vercel, haz clic en **Add New Project**
2. Busca el repositorio `alonsix6/SiReset-v2`
3. Haz clic en **Import**

### 4. Configurar el Proyecto

En la página de configuración:

#### Framework Preset
- Vercel debería detectar automáticamente **Vite**
- Si no, selecciona **Vite** del dropdown

#### Root Directory
- Configura el root directory como: `frontend`
- Haz clic en **Edit** junto a "Root Directory" y escribe `frontend`

#### Build Settings (se configuran automáticamente)
- **Build Command:** `npm run vercel-build` (o `vite build`)
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables

Haz clic en **Environment Variables** y agrega:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://jmzlfdbooafivioaapti.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzUyOTIsImV4cCI6MjA3Nzk1MTI5Mn0.54NCHCK4h5MukcsVAgqAPBHrAAurypaR89G2EtZcfos` |

**Importante:** Estas variables ya están en `vercel.json`, pero es buena práctica configurarlas también en el dashboard de Vercel para mayor seguridad.

### 5. Desplegar

1. Haz clic en **Deploy**
2. Vercel comenzará a construir y desplegar tu aplicación
3. El proceso toma aproximadamente 2-3 minutos
4. Una vez completado, verás tu URL de producción (ej: `https://sireset-v2.vercel.app`)

### 6. Actualizar URLs en Supabase

Ahora que tienes tu URL de Vercel:

1. Copia tu URL de producción de Vercel
2. Ve a Supabase Dashboard → **Authentication** → **URL Configuration**
3. Actualiza las **Redirect URLs**:
   - `https://tu-url.vercel.app`
   - `https://tu-url.vercel.app/auth/callback`
4. En **Site URL**, configura: `https://tu-url.vercel.app`

### 7. Crear tu Primer Usuario Admin

Una vez desplegada la aplicación:

1. Ve a tu aplicación en producción
2. Regístrate con email/contraseña o Google OAuth
3. Ve a Supabase Dashboard → **Authentication** → **Users**
4. Encuentra tu usuario y haz clic en los tres puntos → **Edit User**
5. En la sección **User Metadata**, agrega:
```json
{
  "role": "admin",
  "modules": ["Mougli", "Mapito"]
}
```
6. Guarda los cambios
7. Recarga tu aplicación y ahora verás el menú **Admin**

## 🔄 Deployments Automáticos

Vercel está configurado para hacer deployment automático:

- **Producción:** Cada push a la rama `main` despliega automáticamente
- **Preview:** Cada push a otras ramas crea un preview deployment con URL única
- **Pull Requests:** Cada PR obtiene su propia URL de preview

## 📊 Panel de Admin

Una vez que tengas rol de admin, puedes:

1. Ver estadísticas de usuarios (total, admins, programadores)
2. Cambiar roles de usuarios (user, programmer, admin)
3. Asignar módulos específicos (Mougli, Mapito) a usuarios
4. Ver información de proveedores de auth (email, google)

### Roles Disponibles

- **Admin:** Acceso completo a todos los módulos y panel de administración
- **Programmer:** Acceso a todos los módulos asignados, puede modificar configuraciones
- **User:** Acceso solo a los módulos específicamente asignados

## 🔐 Seguridad

### Variables de Entorno Sensibles

Tu `SUPABASE_ANON_KEY` está segura porque:
- Es una clave pública diseñada para uso en el frontend
- Las políticas RLS (Row Level Security) en Supabase protegen los datos
- Solo permite operaciones autorizadas según tus políticas de seguridad

### Proteger Operaciones Admin

Para mayor seguridad, considera crear funciones RPC en Supabase para operaciones admin:

```sql
-- En Supabase SQL Editor
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🐛 Troubleshooting

### Error: "Invalid Redirect URL"
- Verifica que hayas agregado la URL de Vercel en Supabase → URL Configuration
- Asegúrate de incluir la ruta `/auth/callback`

### Login con Google no funciona
- Verifica que Google OAuth esté habilitado en Supabase
- Confirma que las Redirect URLs estén correctamente configuradas
- Revisa que el dominio de Vercel esté autorizado

### No veo el panel de Admin
- Verifica que tu usuario tenga `"role": "admin"` en user_metadata
- Cierra sesión y vuelve a iniciar sesión para refrescar el token
- Revisa la consola del navegador para errores

### Build falla en Vercel
- Verifica que el Root Directory esté configurado como `frontend`
- Confirma que `vercel.json` esté en el directorio `frontend`
- Revisa los logs de build en Vercel para más detalles

## 📱 Monitoreo

Vercel proporciona:
- **Analytics:** Métricas de rendimiento y uso
- **Logs:** Logs de runtime y build
- **Speed Insights:** Análisis de velocidad de carga
- **Deployment History:** Historial completo de deployments

Accede a estas herramientas desde tu dashboard de Vercel.

## 🔗 URLs Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
- **Documentación Vercel:** https://vercel.com/docs
- **Documentación Supabase:** https://supabase.com/docs

## ✅ Checklist Post-Deployment

- [ ] Aplicación desplegada exitosamente en Vercel
- [ ] URLs de redirect configuradas en Supabase
- [ ] Login con email/contraseña funciona
- [ ] Login con Google funciona
- [ ] Primer usuario admin creado
- [ ] Panel de admin accesible
- [ ] Módulos Mougli y Mapito accesibles

---

**¡Felicidades!** Tu aplicación SiReset-v2 está ahora en producción y lista para usar. 🎉
