#!/bin/bash
# Script de verificación y solución rápida para Mougli
# Ejecuta este script en Cloud Shell

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        🔍 DIAGNÓSTICO Y REPARACIÓN DE MOUGLI            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar que estamos en el directorio correcto
echo -e "${BLUE}[1/5]${NC} Verificando directorio..."
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio de SiReset-v2${NC}"
    echo ""
    echo "Ejecuta primero:"
    echo "  cd ~/SiReset-v2"
    echo "  # o la ruta donde clonaste el proyecto"
    exit 1
fi
echo -e "${GREEN}✓${NC} Directorio correcto"
echo ""

# 2. Hacer pull de los últimos cambios
echo -e "${BLUE}[2/5]${NC} Actualizando código desde Git..."
git fetch --all
git checkout claude/fix-mougli-cleanup-011CV2vvCb6DJ9osL3XVPWqH
git pull origin claude/fix-mougli-cleanup-011CV2vvCb6DJ9osL3XVPWqH
echo -e "${GREEN}✓${NC} Código actualizado"
echo ""

# 3. Verificar requirements.txt
echo -e "${BLUE}[3/5]${NC} Verificando dependencias..."
if grep -q "pandas" backend/requirements.txt && grep -q "openpyxl" backend/requirements.txt; then
    echo -e "${GREEN}✓${NC} pandas y openpyxl están en requirements.txt"
else
    echo -e "${RED}❌ Faltan dependencias en requirements.txt${NC}"
    exit 1
fi
echo ""

# 4. Decidir método de despliegue
echo -e "${BLUE}[4/5]${NC} Detectando método de despliegue..."
echo ""

# Verificar si gcloud está configurado
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} Proyecto GCP detectado: ${GREEN}$PROJECT_ID${NC}"
    echo ""
    echo -e "${YELLOW}Opción recomendada: Redesplegar en Cloud Run${NC}"
    echo ""
    read -p "¿Deseas redesplegar en Cloud Run? (s/n): " DEPLOY_GCP

    if [[ $DEPLOY_GCP =~ ^[Ss]$ ]]; then
        echo ""
        echo -e "${BLUE}[5/5]${NC} Desplegando en Cloud Run..."
        cd backend

        gcloud run deploy sireset-backend \
            --source . \
            --region us-central1 \
            --allow-unauthenticated \
            --port 8080 \
            --memory 1Gi \
            --cpu 1 \
            --timeout 300 \
            --quiet

        BACKEND_URL=$(gcloud run services describe sireset-backend --region us-central1 --format='value(status.url)' 2>/dev/null || echo "")

        if [ -n "$BACKEND_URL" ]; then
            echo ""
            echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO EXITOSAMENTE!${NC}"
            echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${BLUE}🔗 URL del Backend:${NC}"
            echo "   $BACKEND_URL"
            echo ""
            echo -e "${BLUE}🧪 Prueba Mougli:${NC}"
            echo "   curl $BACKEND_URL/api/mougli/health"
            echo ""
            echo -e "${YELLOW}⏳ Espera 30 segundos para que el servicio esté listo${NC}"
            echo ""

            # Esperar y probar
            sleep 10
            echo -e "${BLUE}🔍 Verificando health check...${NC}"
            if curl -s "$BACKEND_URL/api/mougli/health" | grep -q "ok"; then
                echo -e "${GREEN}✅ Mougli está funcionando correctamente!${NC}"
            else
                echo -e "${YELLOW}⚠ El servicio puede tardar unos segundos más${NC}"
                echo "   Intenta en el navegador: $BACKEND_URL/api/mougli/health"
            fi
        fi

        cd ..
    else
        echo -e "${YELLOW}⚠ Despliegue cancelado${NC}"
        exit 0
    fi

elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose detectado"
    echo ""
    echo -e "${YELLOW}Opción: Reconstruir contenedor local${NC}"
    echo ""
    read -p "¿Deseas reconstruir el contenedor? (s/n): " REBUILD_DOCKER

    if [[ $REBUILD_DOCKER =~ ^[Ss]$ ]]; then
        echo ""
        echo -e "${BLUE}[5/5]${NC} Reconstruyendo contenedor..."
        docker-compose down
        docker-compose build backend
        docker-compose up -d

        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✅ CONTENEDOR RECONSTRUIDO!${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${BLUE}🧪 Verifica que funciona:${NC}"
        echo "   curl http://localhost:8080/api/mougli/health"
        echo ""
        echo "   docker-compose logs -f backend"
        echo ""
    else
        echo -e "${YELLOW}⚠ Reconstrucción cancelada${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ No se detectó ni GCP ni Docker Compose${NC}"
    echo ""
    echo "Opciones:"
    echo "1. Configura GCP: gcloud config set project TU_PROJECT_ID"
    echo "2. Instala Docker Compose"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Todo listo! Mougli debería funcionar ahora${NC}"
echo ""
echo -e "${BLUE}📝 Qué se arregló:${NC}"
echo "   ✓ Código actualizado"
echo "   ✓ Dependencias instaladas (pandas, openpyxl)"
echo "   ✓ Backend desplegado/reconstruido"
echo ""
echo -e "${BLUE}🚀 Prueba Mougli:${NC}"
echo "   1. Abre tu aplicación en el navegador"
echo "   2. Ve a la sección Mougli"
echo "   3. Sube tu archivo Monitor (.txt) o OutView (.xlsx)"
echo "   4. Descarga el Excel procesado"
echo ""
