# backend/app/api/routes/mougli.py
"""
Endpoints para el módulo Mougli (Monitor & OutView)

Procesa archivos de Kantar Ibope Media:
- Monitor: Inversión publicitaria en medios ATL (TV, Cable, Radio, Revista, Diarios)
- OutView: Publicidad exterior (OOH)
- Consolidado: Ambos unificados en Excel con 3 hojas
"""

import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, require_module
from app.models.user import User
from app.processors.monitor_processor import procesar_monitor_txt, MonitorProcessor
from app.processors.outview_processor import procesar_outview_excel, OutViewProcessor
from app.processors.excel_generator import generar_excel_mougli_completo

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
        logger.info(f"✅ Archivo leído exitosamente: {len(content)} bytes")
    except Exception as e:
        logger.error(f"❌ Error leyendo archivo: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error leyendo archivo: {str(e)}"
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
        logger.info("🔄 Iniciando procesamiento de Monitor...")
        excel_output = procesar_monitor_txt(file_content)
        logger.info("✅ Procesamiento completado exitosamente")

    except ValueError as e:
        logger.error(f"❌ Error de validación: {e}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Archivo inválido: {str(e)}"
        )

    except Exception as e:
        logger.error(f"❌ Error procesando Monitor: {e}", exc_info=True)
        logger.error(f"   Tipo de error: {type(e).__name__}")
        logger.error(f"   Args: {e.args}")
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


@router.post("/procesar-outview")
async def procesar_outview(
    outview: UploadFile,
    current_user: User = Depends(require_module("Mougli"))
) -> StreamingResponse:
    """
    Procesa archivo OutView .xlsx y retorna Excel

    Valida:
    - Usuario tiene acceso al módulo Mougli
    - Archivo es .xlsx
    - Tamaño máximo 100MB
    - Formato Excel válido

    Args:
        outview: Archivo .xlsx de Kantar Ibope Media

    Returns:
        StreamingResponse con Excel procesado

    Raises:
        HTTPException 400: Archivo inválido (extensión, tamaño, formato)
        HTTPException 403: Sin acceso al módulo
        HTTPException 500: Error interno de procesamiento
    """
    logger.info("=" * 80)
    logger.info("🚀 INICIANDO ENDPOINT /procesar-outview")
    logger.info("=" * 80)
    logger.info(f"👤 Usuario: {current_user.email}")
    logger.info(f"📄 Archivo: {outview.filename}")
    logger.info(f"📦 Content-Type: {outview.content_type}")

    # 1. Validar extensión
    logger.info("📋 PASO 1: Validando extensión del archivo...")
    if not outview.filename.endswith('.xlsx'):
        logger.warning(f"❌ Extensión inválida: {outview.filename}")
        raise HTTPException(
            status_code=400,
            detail="Archivo debe ser .xlsx"
        )
    logger.info("✅ Extensión válida: .xlsx")

    # 2. Leer contenido y validar tamaño
    logger.info("📋 PASO 2: Leyendo contenido del archivo...")
    try:
        content = await outview.read()
        logger.info(f"✅ Archivo leído exitosamente: {len(content)} bytes ({len(content) / 1024:.2f} KB)")
    except Exception as e:
        logger.error(f"❌ Error leyendo archivo: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error leyendo archivo: {str(e)}"
        )

    size_mb = len(content) / (1024 * 1024)
    logger.info(f"📊 Tamaño del archivo: {size_mb:.2f} MB")

    if size_mb > 100:
        logger.warning(f"❌ Archivo muy grande: {size_mb:.1f}MB")
        raise HTTPException(
            status_code=400,
            detail=f"Archivo muy grande ({size_mb:.1f}MB). Máximo: 100MB"
        )
    logger.info("✅ Tamaño válido (< 100MB)")

    # 3. Procesar archivo
    logger.info("📋 PASO 3: Iniciando procesamiento de OutView...")
    logger.info(f"🔄 Llamando a procesar_outview_excel() con {len(content)} bytes...")

    try:
        excel_output = procesar_outview_excel(content)
        logger.info("✅ Procesamiento completado exitosamente")
        logger.info(f"📊 Tamaño del Excel generado: {len(excel_output.getvalue())} bytes")

    except ValueError as e:
        logger.error("=" * 80)
        logger.error(f"❌ ERROR DE VALIDACIÓN en procesar_outview_excel()")
        logger.error(f"   Tipo: {type(e).__name__}")
        logger.error(f"   Mensaje: {str(e)}")
        logger.error(f"   Args: {e.args}")
        logger.error("=" * 80, exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"Archivo inválido: {str(e)}"
        )

    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"❌ ERROR INESPERADO en procesar_outview_excel()")
        logger.error(f"   Tipo: {type(e).__name__}")
        logger.error(f"   Mensaje: {str(e)}")
        logger.error(f"   Args: {e.args}")
        logger.error("=" * 80, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al procesar archivo: {str(e)}"
        )

    # 4. Retornar Excel
    logger.info("📋 PASO 4: Retornando Excel al cliente...")
    logger.info("=" * 80)
    logger.info("✅ ENDPOINT /procesar-outview COMPLETADO")
    logger.info("=" * 80)

    return StreamingResponse(
        excel_output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=OutView_Procesado.xlsx"
        }
    )


@router.post("/procesar-consolidado")
async def procesar_consolidado(
    monitor: Optional[UploadFile] = File(None),
    outview: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_module("Mougli"))
) -> StreamingResponse:
    """
    Procesa Monitor y/o OutView y genera Excel con 1-3 hojas

    Hojas generadas:
    - Solo Monitor → 1 hoja (Monitor)
    - Solo OutView → 1 hoja (OutView)
    - Ambos → 3 hojas (Monitor, OutView, Consolidado)

    Args:
        monitor: Archivo .txt Monitor (opcional)
        outview: Archivo .xlsx OutView (opcional)

    Returns:
        StreamingResponse con Excel SiReset_Mougli.xlsx

    Raises:
        HTTPException 400: Si no se provee ningún archivo o archivos inválidos
        HTTPException 403: Sin acceso al módulo
        HTTPException 500: Error interno de procesamiento
    """

    logger.info(f"Usuario {current_user.email} procesando Consolidado")

    # ==========================================
    # Validar que al menos un archivo existe
    # ==========================================

    if monitor is None and outview is None:
        logger.warning("No se proveyó ningún archivo")
        raise HTTPException(
            status_code=400,
            detail="Debe proveer al menos un archivo (Monitor o OutView)"
        )

    df_monitor = None
    df_outview = None

    # ==========================================
    # Procesar Monitor (si existe)
    # ==========================================

    if monitor is not None:
        logger.info(f"Procesando Monitor: {monitor.filename}")

        # Validar extensión
        if not monitor.filename.endswith('.txt'):
            logger.warning(f"Extensión inválida Monitor: {monitor.filename}")
            raise HTTPException(
                status_code=400,
                detail="Archivo Monitor debe ser .txt"
            )

        # Leer contenido
        try:
            content = await monitor.read()
            logger.info(f"✅ Monitor leído exitosamente: {len(content)} bytes")
        except Exception as e:
            logger.error(f"❌ Error leyendo Monitor: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error leyendo archivo Monitor: {str(e)}"
            )

        # Validar tamaño
        size_mb = len(content) / (1024 * 1024)
        if size_mb > 100:
            logger.warning(f"Monitor muy grande: {size_mb:.1f}MB")
            raise HTTPException(
                status_code=400,
                detail=f"Monitor muy grande ({size_mb:.1f}MB). Máximo: 100MB"
            )

        logger.info(f"Monitor leído: {size_mb:.2f}MB")

        # Detectar encoding
        file_content = None
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']

        for encoding in encodings:
            try:
                file_content = content.decode(encoding)
                logger.info(f"Monitor decodificado con encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue

        if file_content is None:
            logger.error("No se pudo detectar encoding de Monitor")
            raise HTTPException(
                status_code=400,
                detail="No se pudo leer Monitor. Encoding inválido."
            )

        # Procesar Monitor
        try:
            processor = MonitorProcessor()
            df_monitor = processor.procesar(file_content)
            logger.info(f"Monitor procesado: {len(df_monitor)} filas")

        except ValueError as e:
            logger.error(f"Error de validación Monitor: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Monitor inválido: {str(e)}"
            )

        except Exception as e:
            logger.error(f"Error procesando Monitor: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error interno procesando Monitor: {str(e)}"
            )

    # ==========================================
    # Procesar OutView (si existe)
    # ==========================================

    if outview is not None:
        logger.info(f"Procesando OutView: {outview.filename}")

        # Validar extensión
        if not outview.filename.endswith('.xlsx'):
            logger.warning(f"Extensión inválida OutView: {outview.filename}")
            raise HTTPException(
                status_code=400,
                detail="Archivo OutView debe ser .xlsx"
            )

        # Leer contenido
        try:
            content = await outview.read()
            logger.info(f"✅ OutView leído exitosamente: {len(content)} bytes")
        except Exception as e:
            logger.error(f"❌ Error leyendo OutView: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error leyendo archivo OutView: {str(e)}"
            )

        # Validar tamaño
        size_mb = len(content) / (1024 * 1024)
        if size_mb > 100:
            logger.warning(f"OutView muy grande: {size_mb:.1f}MB")
            raise HTTPException(
                status_code=400,
                detail=f"OutView muy grande ({size_mb:.1f}MB). Máximo: 100MB"
            )

        logger.info(f"OutView leído: {size_mb:.2f}MB")

        # Procesar OutView
        try:
            processor = OutViewProcessor()
            df_outview = processor.procesar(content)
            logger.info(f"OutView procesado: {len(df_outview)} filas")

        except ValueError as e:
            logger.error(f"Error de validación OutView: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"OutView inválido: {str(e)}"
            )

        except Exception as e:
            logger.error(f"Error procesando OutView: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error interno procesando OutView: {str(e)}"
            )

    # ==========================================
    # Generar Excel Consolidado
    # ==========================================

    try:
        logger.info("🔄 Generando Excel consolidado...")
        excel_output = generar_excel_mougli_completo(
            df_monitor=df_monitor,
            df_outview=df_outview
        )
        logger.info("✅ Excel consolidado generado exitosamente")

    except Exception as e:
        logger.error(f"❌ Error generando Excel consolidado: {e}", exc_info=True)
        logger.error(f"   Tipo de error: {type(e).__name__}")
        logger.error(f"   Args: {e.args}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generando Excel: {str(e)}"
        )

    # ==========================================
    # Retornar Excel
    # ==========================================

    return StreamingResponse(
        excel_output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=SiReset_Mougli.xlsx"
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
            "procesar-monitor": "POST /api/mougli/procesar-monitor",
            "procesar-outview": "POST /api/mougli/procesar-outview",
            "procesar-consolidado": "POST /api/mougli/procesar-consolidado"
        }
    }
