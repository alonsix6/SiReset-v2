#!/bin/bash
# Script de inicio del backend SiReset

set -e

echo "🚀 Iniciando backend SiReset..."

# Verificar que estamos en el directorio correcto
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio backend/"
    exit 1
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita .env y configura SUPABASE_JWT_SECRET"
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📥 Instalando dependencias..."
    pip install -q -r requirements.txt
fi

# Verificar matplotlib
if ! python -c "import matplotlib" 2>/dev/null; then
    echo "📥 Instalando matplotlib (necesario para AfiniMap)..."
    pip install -q matplotlib==3.8.2
fi

echo "✅ Dependencias OK"

# Levantar servidor
echo "🌐 Levantando servidor en http://localhost:8080..."
echo "📊 API Docs: http://localhost:8080/api/docs"
echo ""
echo "Presiona CTRL+C para detener el servidor"
echo ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
