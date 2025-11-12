#!/bin/bash
# QUICKSTART - Copia y pega estos comandos en Cloud Shell

# 1. Configura tu proyecto (reemplaza con tu PROJECT_ID real)
gcloud config set project TU_PROJECT_ID

# 2. Habilita las APIs (solo primera vez)
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Ve al directorio del proyecto (ajusta la ruta si es diferente)
cd ~/SiReset-v2

# 4. Haz pull de los últimos cambios
git pull origin claude/fix-mougli-cleanup-011CV2vvCb6DJ9osL3XVPWqH

# 5. Ejecuta el script de despliegue
./deploy.sh

# Selecciona opción 1 cuando te pregunte (Backend)
# El despliegue tomará ~2-3 minutos
