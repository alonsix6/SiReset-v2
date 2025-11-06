# backend/app/main.py
"""
SiReset API - FastAPI Backend
Migrado desde Streamlit para arquitectura profesional escalable
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import time
import os
from pathlib import Path

from app.api.routes import auth, mougli, mapito
from app.core.config import settings

app = FastAPI(
    title="SiReset API",
    description="Suite de herramientas para procesamiento de datos publicitarios",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS - permitir frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    return response

# Health check para Google Cloud Run
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sireset-api", "version": "2.0.0"}

# Incluir routers de módulos
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(mougli.router, prefix="/api/mougli", tags=["mougli"])
app.include_router(mapito.router, prefix="/api/mapito", tags=["mapito"])

# Servir archivos estáticos del frontend (para producción en Cloud Run)
static_dir = Path(__file__).parent.parent.parent / "frontend" / "dist"
if static_dir.exists():
    # Montar archivos estáticos
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

    # Servir index.html para todas las rutas no-API (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Si es una ruta API, dejar que FastAPI maneje
        if full_path.startswith("api/") or full_path in ["health", "docs", "redoc"]:
            return JSONResponse({"error": "Not found"}, status_code=404)

        # Servir archivos estáticos si existen
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        # Para rutas SPA, servir index.html
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

        return JSONResponse({"error": "Frontend not built"}, status_code=404)
else:
    # Fallback si no hay frontend construido
    @app.get("/")
    async def root():
        return {
            "message": "SiReset API v2.0",
            "docs": "/api/docs",
            "health": "/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )
