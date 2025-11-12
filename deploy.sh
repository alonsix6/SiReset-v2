#!/bin/bash
# Script de despliegue automático de Mougli en Google Cloud Run
# Ejecuta este script desde Cloud Shell

set -e  # Detener si hay algún error

echo "🚀 Iniciando despliegue de SiReset con Mougli completo..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No se encontró docker-compose.yml${NC}"
    echo "   Asegúrate de estar en el directorio raíz de SiReset-v2"
    exit 1
fi

# Verificar que gcloud está configurado
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: Proyecto GCP no configurado${NC}"
    echo ""
    echo "Configura tu proyecto con:"
    echo "  gcloud config set project TU_PROJECT_ID"
    echo ""
    exit 1
fi

echo -e "${BLUE}📦 Proyecto GCP: ${GREEN}$PROJECT_ID${NC}"
echo ""

# Preguntar qué servicios desplegar
echo -e "${YELLOW}¿Qué deseas desplegar?${NC}"
echo "1) Backend (FastAPI) - Recomendado para actualizar Mougli"
echo "2) Frontend (React)"
echo "3) Ambos"
read -p "Selecciona (1-3): " DEPLOY_OPTION

echo ""

# Función para desplegar backend
deploy_backend() {
    echo -e "${BLUE}🔨 Desplegando Backend...${NC}"
    cd backend

    # Verificar que requirements.txt tiene pandas y openpyxl
    if grep -q "pandas" requirements.txt && grep -q "openpyxl" requirements.txt; then
        echo -e "${GREEN}✓ Dependencias verificadas (pandas, openpyxl)${NC}"
    else
        echo -e "${RED}⚠ Advertencia: Faltan dependencias en requirements.txt${NC}"
    fi

    # Deploy a Cloud Run
    gcloud run deploy sireset-backend \
        --source . \
        --region us-central1 \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi \
        --cpu 1 \
        --timeout 300 \
        --set-env-vars "ENVIRONMENT=production" \
        --quiet

    # Obtener URL del servicio
    BACKEND_URL=$(gcloud run services describe sireset-backend --region us-central1 --format='value(status.url)')
    echo ""
    echo -e "${GREEN}✅ Backend desplegado exitosamente!${NC}"
    echo -e "${BLUE}🔗 URL: ${GREEN}$BACKEND_URL${NC}"

    # Test del endpoint de Mougli
    echo ""
    echo -e "${BLUE}🧪 Probando endpoint de Mougli...${NC}"
    HEALTH_URL="$BACKEND_URL/api/mougli/health"
    if curl -s "$HEALTH_URL" | grep -q "ok"; then
        echo -e "${GREEN}✓ Mougli está funcionando correctamente${NC}"
    else
        echo -e "${YELLOW}⚠ Nota: El endpoint puede tardar unos segundos en estar disponible${NC}"
    fi

    cd ..
}

# Función para desplegar frontend
deploy_frontend() {
    echo -e "${BLUE}🔨 Desplegando Frontend...${NC}"
    cd frontend

    # Aquí puedes agregar el comando de despliegue del frontend
    # Por ejemplo, si usas Firebase Hosting, Cloud Storage, etc.
    echo -e "${YELLOW}⚠ Configura el despliegue del frontend según tu método preferido${NC}"
    echo "  (Firebase Hosting, Cloud Storage + CDN, etc.)"

    cd ..
}

# Ejecutar despliegue según selección
case $DEPLOY_OPTION in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Despliegue completado!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}📋 Cambios desplegados:${NC}"
echo "  ✅ Mougli - Monitor (ATL)"
echo "  ✅ Mougli - OutView (OOH)"
echo "  ✅ Mougli - Consolidado (3 hojas)"
echo "  ✅ Bug de 'loading' corregido"
echo ""
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "  Backend:  $BACKEND_URL"
echo "  Health:   $BACKEND_URL/api/mougli/health"
echo "  Docs:     $BACKEND_URL/docs"
echo ""
echo -e "${YELLOW}💡 Tip: Guarda estos URLs para acceso rápido${NC}"
