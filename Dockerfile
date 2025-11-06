# Multi-stage Dockerfile para Google Cloud Run
# Stage 1: Construir el frontend React
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copiar package files
COPY frontend/package*.json ./

# Instalar dependencias (incluye devDependencies necesarias para build como Vite)
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/ ./

# Variables de entorno para build
# Cloud Run: configurar estos valores en "Build environment variables"
ARG VITE_SUPABASE_URL=https://jmzlfdbooafivioaapti.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptemxmZGJvb2FmaXZpb2FhcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzUyOTIsImV4cCI6MjA3Nzk1MTI5Mn0.54NCHCK4h5MukcsVAgqAPBHrAAurypaR89G2EtZcfos

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build del frontend
RUN npm run build

# Stage 2: Backend Python + Frontend construido
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Instalar dependencias del sistema (para psycopg2, pandas, etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements del backend e instalar
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código del backend (estructura correcta para imports)
COPY backend/app ./app

# Copiar datos necesarios (GADM para Mapito)
COPY data ./data

# Copiar frontend construido desde stage anterior
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto para Cloud Run
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

# Comando de inicio (app.main:app porque copiamos backend/app a /app/app)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1
