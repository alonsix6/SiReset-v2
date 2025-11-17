# backend/app/api/routes/afinimap.py
"""
Endpoints para el módulo AfiniMap

Genera mapas de afinidad (scatter plots de burbujas) a partir de archivos
Excel TGI de Kantar Ibope Media.
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_module
from app.models.user import User
from app.processors.afinimap_processor import AfinimapProcessor, generar_afinimap_matplotlib

logger = logging.getLogger('afinimap.api')

router = APIRouter()


@router.post("/procesar-excel")
async def procesar_excel(
    excel: UploadFile = File(...),
    current_user: User = Depends(require_module("AfiniMap"))
) -> Dict[str, Any]:
    """
    Procesa archivo Excel TGI y retorna metadatos de variables

    Valida:
    - Usuario tiene acceso al módulo AfiniMap
    - Archivo es .xlsx o .xls
    - Tamaño máximo 50MB
    - Formato TGI válido

    Args:
        excel: Archivo Excel TGI de Kantar Ibope Media

    Returns:
        {
            "target_name": "Nombre del target",
            "variables": [
                {
                    "nombre": "Variable X",
                    "consumo": 0.481,
                    "afinidad": 133.0,
                    "visible": true
                },
                ...
            ]
        }

    Raises:
        HTTPException 400: Archivo inválido (extensión, tamaño, formato)
        HTTPException 403: Sin acceso al módulo
        HTTPException 500: Error interno de procesamiento
    """
    logger.info(f"Usuario {current_user.email} procesando Excel: {excel.filename}")

    # 1. Validar extensión
    if not excel.filename.endswith(('.xlsx', '.xls')):
        logger.warning(f"Extensión inválida: {excel.filename}")
        raise HTTPException(
            status_code=400,
            detail="Archivo debe ser Excel (.xlsx o .xls)"
        )

    # 2. Leer contenido y validar tamaño
    try:
        content = await excel.read()
    except Exception as e:
        logger.error(f"Error leyendo archivo: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error leyendo archivo"
        )

    size_mb = len(content) / (1024 * 1024)

    if size_mb > 50:
        logger.warning(f"Archivo muy grande: {size_mb:.1f}MB")
        raise HTTPException(
            status_code=400,
            detail=f"Archivo muy grande ({size_mb:.1f}MB). Máximo: 50MB"
        )

    logger.info(f"Archivo leído: {size_mb:.2f}MB")

    # 3. Procesar Excel
    try:
        processor = AfinimapProcessor()
        result = processor.procesar_excel(content)

        logger.info(
            f"Procesamiento exitoso: {len(result['variables'])} variables "
            f"para target '{result['target_name']}'"
        )

        return result

    except ValueError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error interno procesando Excel: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando archivo: {str(e)}"
        )


@router.post("/generar-grafico")
async def generar_grafico(
    config: Dict[str, Any] = Body(...)
) -> StreamingResponse:
    """
    Genera imagen PNG del gráfico AfiniMap

    NOTA: Este endpoint NO requiere autenticación para funcionar sin DB.
    El Excel ya fue procesado en el frontend.

    Valida:
    - Al menos 2 variables visibles
    - Valores de configuración válidos

    Args:
        config: Configuración del gráfico
            {
                "variables": [...],       // Solo las marcadas como visible=true
                "target_name": "Target",
                "linea_afinidad": 110,
                "color_burbujas": "#cf3b4d",
                "color_fondo": "#fff2f4"
            }

    Returns:
        StreamingResponse con imagen PNG (300 DPI)

    Raises:
        HTTPException 400: Configuración inválida (< 2 variables, colores inválidos)
        HTTPException 500: Error generando gráfico
    """
    logger.info("Generando gráfico AfiniMap")

    # 1. Validar configuración
    try:
        variables = config.get('variables', [])
        target_name = config.get('target_name', 'Target')
        linea_afinidad = float(config.get('linea_afinidad', 110))
        color_burbujas = config.get('color_burbujas', '#cf3b4d')
        color_fondo = config.get('color_fondo', '#fff2f4')

    except (ValueError, TypeError) as e:
        logger.error(f"Error en configuración: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Configuración inválida: {str(e)}"
        )

    # 2. Filtrar variables visibles
    vars_visibles = [v for v in variables if v.get('visible', False)]

    if len(vars_visibles) < 2:
        logger.warning(f"Pocas variables visibles: {len(vars_visibles)}")
        raise HTTPException(
            status_code=400,
            detail=f"Se necesitan al menos 2 variables visibles (tienes {len(vars_visibles)})"
        )

    logger.info(
        f"Generando gráfico con {len(vars_visibles)} variables visibles "
        f"para target '{target_name}'"
    )

    # 3. Generar gráfico
    try:
        img_bytes = generar_afinimap_matplotlib(
            variables=vars_visibles,
            target_name=target_name,
            linea_afinidad=linea_afinidad,
            color_burbujas=color_burbujas,
            color_fondo=color_fondo
        )

        # 4. Retornar imagen
        return StreamingResponse(
            img_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": f'inline; filename="afinimap_{target_name}.png"'
            }
        )

    except ValueError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generando gráfico: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generando gráfico: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Endpoint de salud para verificar que el módulo AfiniMap está funcionando

    Returns:
        {"status": "ok", "module": "AfiniMap"}
    """
    return {
        "status": "ok",
        "module": "AfiniMap",
        "version": "1.0.0"
    }
