# Dockerfile optimizado para Google Cloud Run
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema (necesarias para psycopg2 y pandas)
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY app/ ./app/

# Nota: datos GADM se montan via volumes en docker-compose.yml
# Para producción, usar el Dockerfile en la raíz del proyecto

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 8080

# Comando de inicio para Cloud Run
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1
