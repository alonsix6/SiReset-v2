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

# Variables de entorno para build (se sobrescriben en Cloud Run)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
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
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copiar código del backend
COPY backend/app ./backend/app

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

# Comando de inicio
CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT} --workers 1
