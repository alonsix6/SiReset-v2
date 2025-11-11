# backend/app/api/routes/mougli.py
"""
Endpoints para el módulo Mougli (Monitor & OutView)

Procesa archivos de Kantar Ibope Media:
- Monitor: Inversión publicitaria en medios ATL (TV, Cable, Radio, Revista, Diarios)
- OutView: Publicidad exterior (OOH) - próximamente
"""

import logging
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_module
from app.models.user import User
from app.processors.monitor_processor import procesar_monitor_txt

logger = logging.getLogger('mougli.api')

router = APIRouter()


@router.post("/procesar-monitor")
async def procesar_monitor(
    monitor: UploadFile,
    current_user: User = Depends(require_module("Mougli"))
) -> StreamingResponse:
    """
    Procesa archivo Monitor .txt y retorna Excel

    Valida:
    - Usuario tiene acceso al módulo Mougli
    - Archivo es .txt
    - Tamaño máximo 100MB
    - Encoding válido (UTF-8, Latin-1, CP1252)

    Args:
        monitor: Archivo .txt de Kantar Ibope Media

    Returns:
        StreamingResponse con Excel procesado

    Raises:
        HTTPException 400: Archivo inválido (extensión, tamaño, formato)
        HTTPException 403: Sin acceso al módulo
        HTTPException 500: Error interno de procesamiento
    """
    logger.info(f"Usuario {current_user.email} procesando Monitor: {monitor.filename}")

    # 1. Validar extensión
    if not monitor.filename.endswith('.txt'):
        logger.warning(f"Extensión inválida: {monitor.filename}")
        raise HTTPException(
            status_code=400,
            detail="Archivo debe ser .txt"
        )

    # 2. Leer contenido y validar tamaño
    try:
        content = await monitor.read()
    except Exception as e:
        logger.error(f"Error leyendo archivo: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error leyendo archivo"
        )

    size_mb = len(content) / (1024 * 1024)

    if size_mb > 100:
        logger.warning(f"Archivo muy grande: {size_mb:.1f}MB")
        raise HTTPException(
            status_code=400,
            detail=f"Archivo muy grande ({size_mb:.1f}MB). Máximo: 100MB"
        )

    logger.info(f"Archivo leído: {size_mb:.2f}MB")

    # 3. Detectar encoding y convertir a string
    file_content = None
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']

    for encoding in encodings:
        try:
            file_content = content.decode(encoding)
            logger.info(f"Archivo decodificado con encoding: {encoding}")
            break
        except UnicodeDecodeError:
            continue

    if file_content is None:
        logger.error("No se pudo detectar encoding del archivo")
        raise HTTPException(
            status_code=400,
            detail="No se pudo leer archivo. Encoding inválido. Intenta guardar como UTF-8."
        )

    # 4. Procesar archivo
    try:
        excel_output = procesar_monitor_txt(file_content)
        logger.info("Procesamiento completado exitosamente")

    except ValueError as e:
        logger.error(f"Error de validación: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Archivo inválido: {str(e)}"
        )

    except Exception as e:
        logger.error(f"Error procesando Monitor: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al procesar archivo: {str(e)}"
        )

    # 5. Retornar Excel
    return StreamingResponse(
        excel_output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=Monitor_Procesado.xlsx"
        }
    )


@router.get("/health")
async def health_check():
    """
    Health check del módulo Mougli

    Returns:
        Dict con status y módulos disponibles
    """
    return {
        "status": "ok",
        "module": "Mougli",
        "endpoints": {
            "procesar-monitor": "POST /api/mougli/procesar-monitor"
        }
    }
