# Guía de Despliegue - Mougli Completo

## ✅ Cambios Completados

Esta rama incluye la implementación completa de Mougli:

- **Monitor**: Procesa archivos .txt ATL (TV, Cable, Radio, Revista, Diarios)
- **OutView**: Procesa archivos .xlsx OOH (Vía Pública)
- **Consolidado**: Unifica ambos en Excel con 3 hojas y 27 columnas híbridas
- **Bug Fix**: Corregido error de variable 'loading' que causaba pantalla negra

## 🚀 Despliegue en Google Cloud Run (Recomendado)

### Paso 1: Configurar Google Cloud

```bash
# Configura tu proyecto GCP
gcloud config set project TU_PROJECT_ID

# Habilita las APIs necesarias (solo la primera vez)
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Paso 2: Ejecutar el script de despliegue

```bash
# Desde el directorio raíz del proyecto
./deploy.sh
```

El script te preguntará qué deseas desplegar:
- **Opción 1**: Solo Backend (recomendado para actualizar Mougli)
- **Opción 2**: Solo Frontend
- **Opción 3**: Ambos

### Paso 3: Verificar el despliegue

```bash
# Verificar que Mougli funciona
curl https://TU-SERVICIO-URL.run.app/api/mougli/health

# Deberías ver:
{
  "status": "ok",
  "module": "Mougli",
  "endpoints": {
    "procesar-monitor": "POST /api/mougli/procesar-monitor",
    "procesar-outview": "POST /api/mougli/procesar-outview",
    "procesar-consolidado": "POST /api/mougli/procesar-consolidado"
  }
}
```

## 🐳 Despliegue Local con Docker Compose

Si prefieres probar localmente:

```bash
# Reconstruir el backend (instala pandas, openpyxl, numpy)
docker-compose build backend

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Verificar
curl http://localhost:8080/api/mougli/health
```

## 📊 Uso de Mougli

### Monitor (ATL)
1. Ve a `/mougli` en tu aplicación
2. Sección "Procesar Monitor"
3. Sube archivo .txt de Kantar Ibope
4. Descarga `Monitor_Procesado.xlsx`

### OutView (OOH)
1. Ve a `/mougli` en tu aplicación
2. Sección "Procesar OutView"
3. Sube archivo .xlsx de Kantar Ibope
4. Descarga `OutView_Procesado.xlsx`

### Consolidado (Recomendado) ⭐
1. Ve a `/mougli` en tu aplicación
2. Sección "Procesar Consolidado"
3. Sube Monitor (.txt) y/o OutView (.xlsx)
4. Descarga `SiReset_Mougli.xlsx` con:
   - 1 hoja si subiste solo uno
   - 3 hojas si subiste ambos (Monitor, OutView, **Consolidado**)

## 🔍 Troubleshooting

### Error: "No module named 'pandas'"
**Solución**: Reconstruye el contenedor Docker o redesplega en Cloud Run. Las dependencias se instalan automáticamente desde `requirements.txt`.

### Error: "Pantalla negra en /mougli"
**Solución**: Esto ya fue corregido en el commit `b145478`. Asegúrate de hacer pull de los últimos cambios.

### Error: "Error procesando archivos"
**Solución**: Verifica que el backend esté corriendo con las dependencias instaladas. Ejecuta el script de despliegue.

## 📦 Dependencias Clave

El backend requiere (ya incluidas en `requirements.txt`):
- pandas==2.1.4
- openpyxl==3.1.2
- numpy==1.26.3
- fastapi==0.109.0
- uvicorn==0.27.0

## 🌐 URLs de Endpoints

```
GET  /api/mougli/health              - Health check
POST /api/mougli/procesar-monitor    - Procesar Monitor (.txt)
POST /api/mougli/procesar-outview    - Procesar OutView (.xlsx)
POST /api/mougli/procesar-consolidado - Procesar Consolidado (ambos)
```

## 📋 Commits Principales

```
b145478 - fix: Corregir variable undefined 'loading' que rompía Mougli
946ebf0 - feat: Agregar hoja Consolidado con unificación Monitor + OutView
dcb99fc - feat: Implementar módulo OutView con procesador completo
8dcf186 - feat: Implementar módulo Mougli con procesador Monitor completo
d1269ea - chore: Eliminar completamente módulo Mougli del sistema
```

## 💡 Próximos Pasos

Después del despliegue:
1. Accede a tu aplicación en el navegador
2. Ve a la sección "Mougli"
3. Prueba subir archivos Monitor y/o OutView
4. Verifica que los Excel se descargan correctamente

## 🆘 Soporte

Si tienes problemas:
1. Verifica los logs: `gcloud run logs tail sireset-backend`
2. Revisa el health check del API
3. Confirma que las dependencias están instaladas
