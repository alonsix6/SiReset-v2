#!/bin/bash
# deploy/cloud-run-deploy.sh
# Script para deploy en Google Cloud Run

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy de SiReset API a Google Cloud Run${NC}"

# Variables (configurar antes de ejecutar)
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="sireset-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${YELLOW}Proyecto: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Región: ${REGION}${NC}"
echo -e "${YELLOW}Servicio: ${SERVICE_NAME}${NC}"

# 1. Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
    echo "Instalar desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 2. Verificar que estés autenticado
echo -e "${YELLOW}Verificando autenticación...${NC}"
gcloud auth list

# 3. Configurar proyecto
echo -e "${YELLOW}Configurando proyecto ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# 4. Habilitar APIs necesarias
echo -e "${YELLOW}Habilitando APIs de Cloud Run y Container Registry...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 5. Build de imagen Docker
echo -e "${YELLOW}📦 Construyendo imagen Docker...${NC}"
cd ../backend
gcloud builds submit --tag ${IMAGE_NAME}

# 6. Deploy a Cloud Run
echo -e "${YELLOW}🚢 Desplegando a Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "ENVIRONMENT=production" \
  --set-secrets "DATABASE_URL=sireset-db-url:latest,SECRET_KEY=sireset-secret-key:latest"

# 7. Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deploy exitoso!${NC}"
echo -e "${GREEN}URL del servicio: ${SERVICE_URL}${NC}"
echo -e "${GREEN}Docs API: ${SERVICE_URL}/api/docs${NC}"
echo -e "${GREEN}Health check: ${SERVICE_URL}/health${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Configurar secretos en Google Secret Manager:"
echo "   - DATABASE_URL (URL de Supabase PostgreSQL)"
echo "   - SECRET_KEY (generar con: openssl rand -hex 32)"
echo "2. Actualizar CORS_ORIGINS en config.py con la URL del servicio"
echo "3. Configurar dominio personalizado (opcional)"
