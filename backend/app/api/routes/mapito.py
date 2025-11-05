# backend/app/api/routes/mapito.py
"""
Endpoints para Mapito - Mapas interactivos de Perú
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Tuple
from pathlib import Path

from app.core.database import get_db
from app.api.deps import require_module
from app.models.user import User
from app.processors import mapito_processor as mapito

router = APIRouter()

# Schemas
class MapRequest(BaseModel):
    nivel: str = "regiones"  # regiones, provincias, distritos
    color_general: str = "#713030"
    color_selected: str = "#5F48C6"
    color_border: str = "#000000"
    grosor_borde: float = 0.8
    show_borders: bool = True
    show_basemap: bool = True
    # Selecciones opcionales
    regions: Optional[List[str]] = None
    provinces: Optional[List[Tuple[str, str]]] = None
    districts: Optional[List[Tuple[str, str, str]]] = None

@router.post("/generate", response_class=HTMLResponse)
async def generate_map(
    request: MapRequest,
    current_user: User = Depends(require_module("Mapito"))
):
    """
    Generar mapa interactivo de Perú

    Retorna HTML con mapa Folium embebido
    """
    try:
        # Path a datos GADM
        data_dir = Path(__file__).parent.parent.parent.parent.parent / "data"

        if not data_dir.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Directorio de datos no encontrado: {data_dir}"
            )

        # Preparar configuraciones
        colores = {
            "fill": request.color_general,
            "selected": request.color_selected,
            "border": request.color_border
        }

        style = {
            "weight": request.grosor_borde,
            "show_borders": request.show_borders,
            "show_basemap": request.show_basemap
        }

        selections = {}
        if request.regions:
            selections["regions"] = request.regions
        if request.provinces:
            selections["provinces"] = request.provinces
        if request.districts:
            selections["districts"] = request.districts

        # Generar mapa usando lógica existente
        html, meta = mapito.build_map(
            data_dir=data_dir,
            colores=colores,
            style=style,
            selections=selections,
            fit_selected=bool(selections),
            background_color="#ffffff"
        )

        # Retornar HTML con metadata en headers
        return HTMLResponse(
            content=html,
            headers={
                "X-Map-Regions": str(meta.get("n_regions", 0)),
                "X-Map-Selected": str(meta.get("n_selected", 0))
            }
        )

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Archivo de datos no encontrado: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generando mapa: {str(e)}"
        )

@router.get("/regions")
async def list_regions(
    current_user: User = Depends(require_module("Mapito"))
):
    """
    Listar todas las regiones disponibles
    """
    try:
        data_dir = Path(__file__).parent.parent.parent.parent.parent / "data"
        gj1 = mapito._load_gadm(data_dir, 1)

        regions = [
            feature["properties"]["NAME_1"]
            for feature in gj1["features"]
        ]

        return {
            "total": len(regions),
            "regions": sorted(regions)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cargando regiones: {str(e)}"
        )

@router.get("/provinces/{region}")
async def list_provinces(
    region: str,
    current_user: User = Depends(require_module("Mapito"))
):
    """
    Listar provincias de una región específica
    """
    try:
        data_dir = Path(__file__).parent.parent.parent.parent.parent / "data"
        gj2 = mapito._load_gadm(data_dir, 2)

        provinces = [
            feature["properties"]["NAME_2"]
            for feature in gj2["features"]
            if feature["properties"]["NAME_1"].lower() == region.lower()
        ]

        return {
            "region": region,
            "total": len(provinces),
            "provinces": sorted(provinces)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cargando provincias: {str(e)}"
        )
