# 📦 Instalación Frontend - SiReset v2.0

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

---

## Dependencias Instaladas

### Core Dependencies
- ✅ `react` - Framework UI
- ✅ `react-dom` - React DOM renderer
- ✅ `react-router-dom` - Routing
- ✅ `vite` - Build tool (rápido!)

### Supabase (Auth + Database)
- ✅ `@supabase/supabase-js` - Cliente Supabase
- ✅ `@supabase/auth-ui-react` - UI components para auth
- ✅ `@supabase/auth-ui-shared` - Temas compartidos

### Styling
- ✅ `tailwindcss` - CSS utility-first
- ✅ `postcss` - Procesador CSS
- ✅ `autoprefixer` - Prefijos CSS automáticos

### HTTP Client
- ✅ `axios` - Cliente HTTP para API calls
- ✅ `@tanstack/react-query` - State management

---

## Verificar Instalación

Después de `npm install`, verifica que tienes:

```bash
# Ver dependencias instaladas
npm list --depth=0

# Deberías ver:
# @supabase/auth-ui-react@0.4.7
# @supabase/auth-ui-shared@0.1.8
# @supabase/supabase-js@2.39.3
# @tanstack/react-query@5.17.9
# axios@1.6.5
# react@18.2.0
# react-dom@18.2.0
# react-router-dom@6.21.1
# + devDependencies
```

---

## Variables de Entorno

Crea `.env` en `/frontend/`:

```bash
VITE_SUPABASE_URL=https://jmzlfdbooafivioaapti.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzUyOTIsImV4cCI6MjA3Nzk1MTI5Mn0.54NCHCK4h5MukcsVAgqAPBHrAAurypaR89G2EtZcfos
VITE_API_URL=http://localhost:8080
```

---

## Troubleshooting

### Error: `Cannot find module '@supabase/supabase-js'`

**Solución:**
```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

### Error: `Module not found: ../lib/supabaseClient`

**Solución:**
- Verifica que existe `/frontend/src/lib/supabaseClient.js`
- Si no existe, cópialo del repositorio

### Port 3000 already in use

**Solución:**
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
npm run dev -- --port 3001
```

---

## Build para Producción

```bash
npm run build
```

Esto genera `/frontend/dist/` que puedes deployar.

---

## Próximos Pasos

1. ✅ Instalar dependencias (`npm install`)
2. ✅ Configurar `.env`
3. ✅ Ejecutar dev server (`npm run dev`)
4. 📖 Leer `SUPABASE_SETUP.md` para configurar Google OAuth
5. 🚀 Empezar a desarrollar!
