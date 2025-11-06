# Guía de Gestión de Usuarios - SiReset v2.0

Esta guía explica cómo crear usuarios, asignar roles y gestionar permisos en SiReset.

## 🔐 Sistema de Acceso Restringido

SiReset usa un sistema de **acceso restringido** donde:
- ❌ **No hay registro público** - Los usuarios no pueden crear sus propias cuentas
- ❌ **No hay Google OAuth** - Solo login con email/password
- ✅ **Solo administradores crean usuarios** - Tú controlas quién tiene acceso
- ✅ **Sistema de roles y permisos** - Control granular de acceso a módulos

## 👥 Roles Disponibles

### 1. **Admin** (Administrador)
- Acceso completo a todos los módulos (Mougli, Mapito)
- Acceso al panel de administración (`/admin`)
- Puede ver y modificar roles de otros usuarios
- Puede asignar/desasignar módulos a usuarios
- Ver estadísticas de la plataforma

### 2. **Programmer** (Programador)
- Acceso a los módulos asignados
- Puede modificar configuraciones avanzadas
- NO tiene acceso al panel de administración
- NO puede modificar usuarios

### 3. **User** (Usuario)
- Acceso solo a los módulos específicamente asignados
- No puede modificar configuraciones avanzadas
- NO tiene acceso al panel de administración
- Uso básico de los módulos permitidos

## 📋 Cómo Crear Usuarios Manualmente en Supabase

### Paso 1: Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/jmzlfdbooafivioaapti
2. Inicia sesión con tu cuenta de Supabase
3. Ve a la sección **Authentication** en el menú lateral

### Paso 2: Crear un Nuevo Usuario

1. Click en **Add User** (botón verde en la esquina superior derecha)
2. Selecciona **Create new user**
3. Completa el formulario:

   ```
   Email: nombre@reset.com
   Password: [contraseña segura]
   Auto Confirm User: ✅ (marcar para que no necesite confirmar email)
   ```

4. Click en **Create User**

### Paso 3: Asignar Rol y Permisos

Después de crear el usuario, necesitas asignar su rol y módulos:

1. En la lista de usuarios, encuentra el usuario que acabas de crear
2. Click en los **tres puntos (⋮)** al lado del usuario
3. Selecciona **Edit User**
4. En la sección **Raw User Meta Data**, verás un campo JSON
5. Agrega o edita el JSON con esta estructura:

   **Para un Administrador:**
   ```json
   {
     "role": "admin",
     "name": "Nombre Completo",
     "modules": ["Mougli", "Mapito"]
   }
   ```

   **Para un Programador:**
   ```json
   {
     "role": "programmer",
     "name": "Nombre del Programador",
     "modules": ["Mougli", "Mapito"]
   }
   ```

   **Para un Usuario Regular (solo Mougli):**
   ```json
   {
     "role": "user",
     "name": "Nombre del Usuario",
     "modules": ["Mougli"]
   }
   ```

   **Para un Usuario Regular (solo Mapito):**
   ```json
   {
     "role": "user",
     "name": "Nombre del Usuario",
     "modules": ["Mapito"]
   }
   ```

6. Click en **Save** para guardar los cambios

### Paso 4: Notificar al Usuario

Envía al usuario sus credenciales por un canal seguro:

```
Asunto: Acceso a SiReset

Hola [Nombre],

Se te ha creado una cuenta en SiReset.

URL: https://tu-url.run.app
Email: nombre@reset.com
Contraseña: [la contraseña que creaste]

Módulos disponibles: [Mougli/Mapito/Ambos]

Por favor, cambia tu contraseña después del primer login.

Saludos,
Equipo Reset
```

## 🎛️ Panel de Administración de SiReset

Una vez que tengas un usuario con rol **admin**, puedes gestionar usuarios desde la propia aplicación SiReset.

### Acceder al Panel Admin

1. Inicia sesión en SiReset con una cuenta de administrador
2. En el menú de navegación, verás **Admin** (con ícono ⚙️)
3. Click en **Admin** para acceder al panel

### Funcionalidades del Panel Admin

#### 📊 Dashboard de Estadísticas
- **Total de Usuarios**: Cuenta total de usuarios registrados
- **Administradores**: Número de usuarios con rol admin
- **Programadores**: Número de usuarios con rol programmer
- **Usuarios**: Número de usuarios con rol user

#### 👤 Tabla de Usuarios

Para cada usuario puedes ver:
- **Email**: Email de registro
- **Nombre**: Nombre completo del usuario
- **Rol**: Rol actual (admin/programmer/user)
- **Proveedor**: Método de autenticación (email)
- **Módulos**: Módulos asignados (checkboxes)

#### ✏️ Modificar Roles

Para cambiar el rol de un usuario:

1. Localiza al usuario en la tabla
2. En la columna **Rol**, usa el dropdown
3. Selecciona el nuevo rol:
   - `admin` - Administrador
   - `programmer` - Programador
   - `user` - Usuario
4. Click en **Cambiar Rol**
5. Confirma el cambio

**Nota:** Los cambios de rol se aplican inmediatamente, pero el usuario debe cerrar sesión y volver a iniciar para que tome efecto.

#### 🔧 Asignar/Desasignar Módulos

Para modificar los módulos de un usuario:

1. Localiza al usuario en la tabla
2. En la columna **Módulos**, verás checkboxes para:
   - ☑️ Mougli
   - ☑️ Mapito
3. Marca/desmarca los módulos según lo necesites
4. Los cambios se guardan automáticamente

**Nota:** Los administradores siempre tienen acceso a todos los módulos, independientemente de los checkboxes.

## 🔄 Flujo Completo de Gestión de Usuarios

### Escenario 1: Crear Primer Administrador

```
1. Crear usuario en Supabase (tú mismo)
   └─ Email: admin@reset.com
   └─ Password: [tu contraseña]
   └─ Auto Confirm: ✅

2. Asignar rol admin
   └─ Edit User → Raw User Meta Data
   └─ {
        "role": "admin",
        "name": "Administrador Principal",
        "modules": ["Mougli", "Mapito"]
      }

3. Iniciar sesión en SiReset
   └─ Ahora tienes acceso al panel Admin
```

### Escenario 2: Agregar Nuevo Empleado (Programador)

**Opción A: Desde Supabase (recomendado para primer usuario)**

```
1. Supabase → Authentication → Add User
2. Email: empleado@reset.com
3. Password: [contraseña temporal]
4. Auto Confirm: ✅
5. Edit User → Raw User Meta Data:
   {
     "role": "programmer",
     "name": "Juan Pérez",
     "modules": ["Mougli", "Mapito"]
   }
6. Enviar credenciales al empleado
```

**Opción B: Desde Panel Admin (cuando necesites cambiar rol/módulos)**

```
1. Login como admin en SiReset
2. Ir a /admin
3. Localizar usuario en tabla
4. Cambiar rol a "programmer"
5. Marcar módulos que necesita
6. Guardar cambios
```

### Escenario 3: Dar Acceso Temporal a Mapito

```
1. Login como admin en SiReset
2. Ir a /admin
3. Localizar usuario
4. Marcar checkbox "Mapito"
5. Cuando termine el proyecto:
   └─ Desmarcar checkbox "Mapito"
```

### Escenario 4: Revocar Acceso Completamente

**Opción A: Desactivar usuario (recomendado)**

```
1. Supabase → Authentication → Users
2. Encontrar usuario
3. Click ⋮ → Edit User
4. En Raw User Meta Data, agregar:
   {
     "role": "user",
     "name": "...",
     "modules": [],
     "active": false
   }
5. El usuario no podrá acceder a ningún módulo
```

**Opción B: Eliminar usuario (permanente)**

```
1. Supabase → Authentication → Users
2. Encontrar usuario
3. Click ⋮ → Delete User
4. Confirmar eliminación
⚠️ Esta acción no se puede deshacer
```

## 🔒 Seguridad y Mejores Prácticas

### Contraseñas

- ✅ Usa contraseñas fuertes para todos los usuarios
- ✅ Pide a los usuarios cambiar contraseñas temporales después del primer login
- ✅ No compartas contraseñas por email sin cifrar
- ✅ Usa gestores de contraseñas (1Password, Bitwarden, etc.)

### Roles

- ✅ Principio de mínimo privilegio: asigna solo los permisos necesarios
- ✅ Revisa roles periódicamente (cada 3-6 meses)
- ✅ Revoca acceso inmediatamente cuando empleados dejen la empresa
- ⚠️ Ten al menos 2 administradores (respaldo)

### Módulos

- ✅ Asigna módulos según las responsabilidades del usuario
- ✅ Revoca acceso a módulos cuando terminen proyectos temporales
- ✅ Documenta quién tiene acceso a qué módulos

### Auditoría

Supabase guarda logs de:
- ✅ Inicios de sesión (exitosos y fallidos)
- ✅ Cambios en usuarios
- ✅ Acciones de administración

Revisa estos logs regularmente en: Supabase → Logs

## 🆘 Troubleshooting

### Usuario no puede iniciar sesión

**Problema:** "Email o contraseña incorrectos"

**Soluciones:**
1. Verifica que el email esté escrito correctamente
2. Verifica que `Auto Confirm User` esté marcado en Supabase
3. Resetea la contraseña desde Supabase

### Usuario no ve el módulo asignado

**Problema:** Usuario tiene acceso a Mougli pero no lo ve en el menú

**Soluciones:**
1. Verifica en Supabase → Edit User → Raw User Meta Data
2. Confirma que `"modules": ["Mougli"]` esté presente
3. Pide al usuario cerrar sesión y volver a iniciar
4. Verifica en Panel Admin que el módulo esté marcado

### Admin no ve el panel de administración

**Problema:** Usuario admin no ve menú "Admin"

**Soluciones:**
1. Verifica en Supabase que `"role": "admin"` esté configurado
2. Pide al usuario cerrar sesión y volver a iniciar
3. Verifica en consola del navegador (F12) si hay errores
4. Confirma que el rol sea exactamente `"admin"` (minúsculas)

### Cambios no se aplican

**Problema:** Cambiaste el rol pero el usuario sigue con permisos antiguos

**Solución:**
- Los cambios en roles/módulos requieren que el usuario **cierre sesión y vuelva a iniciar**
- El JWT token guarda los permisos antiguos hasta que expira
- Cerrar sesión fuerza la regeneración del token

## 📞 Contacto

Si tienes dudas sobre gestión de usuarios:
1. Revisa esta guía primero
2. Verifica los logs en Supabase
3. Contacta al equipo técnico con detalles específicos

---

**Última actualización:** 2025-11-06
**Versión:** SiReset v2.0
