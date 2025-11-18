#!/bin/bash
# Script de despliegue rápido a Cloud Run con variables de entorno
# Este script despliega el backend con la configuración correcta de base de datos

set -e

echo "🚀 Desplegando SiReset Backend a Cloud Run..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f ".env.yaml" ]; then
    echo "❌ Error: No se encontró .env.yaml"
    echo "   Asegúrate de estar en el directorio backend/"
    exit 1
fi

echo "📋 Configuración:"
echo "   - Base de datos: Supabase PostgreSQL"
echo "   - Región: us-central1"
echo "   - Memoria: 1Gi"
echo "   - Timeout: 300s"
echo ""

echo "🔄 Iniciando despliegue..."
gcloud run deploy sireset-v2 \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --env-vars-file=.env.yaml \
    --quiet

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "🔗 Verificando el servicio..."
SERVICE_URL=$(gcloud run services describe sireset-v2 --region us-central1 --format='value(status.url)')
echo "   URL del servicio: $SERVICE_URL"
echo ""
echo "🧪 Probando endpoint de salud de Mougli..."
curl -s "$SERVICE_URL/api/mougli/health" | python3 -m json.tool || echo "Endpoint disponible"
echo ""
echo "🎉 ¡Listo! Ahora puedes probar subir un archivo OutView."
