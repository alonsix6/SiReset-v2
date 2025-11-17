# 🔍 AfiniMap - Guía de Troubleshooting

## ✅ PROBLEMA RESUELTO: "Failed to fetch"

### Causa raíz identificada:
**El backend NO estaba corriendo** - El error "Failed to fetch" ocurría porque el frontend intentaba conectarse a `http://localhost:8080` pero no había ningún servidor escuchando en ese puerto.

---

## 📋 Checklist de solución implementada:

### 1. ✅ Dependencias instaladas
```bash
cd backend
pip install -r requirements.txt
pip install matplotlib==3.8.2
```

**Verificar:**
```bash
python -c "import fastapi, matplotlib, pandas, openpyxl; print('OK')"
```

### 2. ✅ Archivo .env creado
```bash
cd backend
cp .env.example .env
```

**⚠️ IMPORTANTE:** Si usas autenticación real, debes configurar `SUPABASE_JWT_SECRET` en el archivo `.env`.

### 3. ✅ Backend corriendo
```bash
cd backend
./start.sh
# O manualmente:
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

**Verificar que está corriendo:**
```bash
curl http://localhost:8080/health
# Debe retornar: {"status":"healthy","service":"sireset-api","version":"2.0.0"}

curl http://localhost:8080/api/afinimap/health
# Debe retornar: {"status":"ok","module":"AfiniMap","version":"1.0.0"}
```

---

## 🎯 Estructura del Excel TGI

### Formato requerido:

| Fila | Col A (Nombre) | Col B (Métrica) | Col C (TOTAL) | Col D (Target) |
|------|----------------|-----------------|---------------|----------------|
| 1-4  | Metadata (ignorar) | - | - | - |
| **5** | - | "Elementos" | "TOTAL" | **"Maquinarias"** ← Nombre del target |
| 6-7  | Baseline (ignorar) | "Vert%" / "Afinidad" | "100.0%" / "100" | "100.0%" / "100" |
| **8** | **"Comida y bebida"** | **"Vert%"** | "36.1%" | **"48.1%"** ← Consumo |
| **9** | - | **"Afinidad"** | "100" | **"133"** ← Afinidad |
| **10** | **"Arte/ cultural"** | **"Vert%"** | "30.2%" | **"45.8%"** |
| **11** | - | **"Afinidad"** | "100" | **"152"** |
| ... | (más pares) | ... | ... | ... |

### Reglas clave:
- ✅ **Cualquier nombre de hoja** (se lee la primera activa)
- ✅ **Fila 5, Columna D**: Nombre del target
- ✅ **Desde fila 8**: Pares alternando `Vert%` (consumo) y `Afinidad`
- ✅ **Columna A**: Nombre de la variable (solo en filas Vert%)
- ✅ **Columna D**: Valores del target
- ✅ Consumo puede ser: `"48.1%"` (string) o `0.481` (float)
- ✅ Afinidad siempre es número: `133` o `"133"`

---

## 📊 Excel de prueba

Se creó un archivo de prueba en `/tmp/test_tgi_afinimap.xlsx` con:
- **Target:** Maquinarias
- **10 variables** de ejemplo
- Estructura TGI válida

**Usar para testing:**
1. Descargar: `/tmp/test_tgi_afinimap.xlsx`
2. Subir en AfiniMap
3. Debería procesar correctamente y generar el gráfico

---

## 🔧 Comandos útiles

### Ver logs del backend:
```bash
tail -f /tmp/backend.log
```

### Detener backend:
```bash
kill $(cat /tmp/backend.pid)
```

### Verificar puerto 8080:
```bash
lsof -i :8080
# O en sistemas sin lsof:
netstat -tuln | grep 8080
```

### Reiniciar backend:
```bash
kill $(cat /tmp/backend.pid) 2>/dev/null
cd backend && ./start.sh
```

---

## 🐛 Errores comunes

### Error: "Failed to fetch"
**Causa:** Backend no está corriendo
**Solución:** `cd backend && ./start.sh`

### Error: "Excel con formato inválido"
**Causa:** Estructura del Excel no coincide con TGI
**Solución:** Verificar que:
- Fila 5, columna D tiene el nombre del target
- Desde fila 8 hay pares de Vert% / Afinidad
- Columna B tiene exactamente el texto "Vert%" y "Afinidad"

### Error: "No se pudo leer el archivo Excel"
**Causa:** Archivo corrupto o formato no soportado
**Solución:** Asegurar que es .xlsx o .xls válido

### Error: "ModuleNotFoundError: No module named 'matplotlib'"
**Causa:** Falta instalar matplotlib
**Solución:** `pip install matplotlib==3.8.2`

---

## 🎨 Personalización

### Colores por defecto:
- **Burbujas:** `#cf3b4d` (rojo)
- **Fondo:** `#fff2f4` (rosa claro)
- **Línea afinidad:** `110`

### Cambiar desde la UI:
1. Subir Excel
2. Ir al panel "🎨 Estilo"
3. Modificar colores con color pickers
4. El gráfico se actualiza en tiempo real

---

## 📞 Soporte

Si el problema persiste después de seguir esta guía:

1. Verificar logs del backend: `tail -f /tmp/backend.log`
2. Verificar consola del navegador (F12)
3. Probar con el Excel de prueba: `/tmp/test_tgi_afinimap.xlsx`
4. Verificar que el frontend está apuntando a la URL correcta en `.env`

---

## ✨ Estado actual

- ✅ Backend corriendo en `http://localhost:8080`
- ✅ Endpoint `/api/afinimap/health` respondiendo
- ✅ Dependencias instaladas (matplotlib, pandas, openpyxl)
- ✅ Excel de prueba disponible
- ✅ Frontend con token correcto (`localStorage.getItem('token')`)

**AfiniMap está completamente funcional y listo para usar.**
