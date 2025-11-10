# backend/app/api/routes/mougli.py
"""
Endpoints para Mougli - Procesamiento Monitor & OutView
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from io import BytesIO
import json

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.processors import mougli_processor as mougli

router = APIRouter()

@router.post("/process")
async def process_mougli(
    monitor_files: Optional[List[UploadFile]] = File(None),
    outview_files: Optional[List[UploadFile]] = File(None),
    factores_json: Optional[str] = Form(None),
    outview_factor: Optional[float] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Procesar archivos Monitor y/o OutView

    - **monitor_files**: Archivos .txt de Monitor (múltiples)
    - **outview_files**: Archivos .csv/.xlsx de OutView (múltiples)
    - **factores_json**: JSON con factores por medio (TV, CABLE, etc.)
    - **outview_factor**: Factor de superficie para OutView

    Retorna archivo Excel con hojas procesadas
    """
    try:
        # Cargar factores
        if factores_json:
            factores = json.loads(factores_json)
        else:
            factores = mougli.load_monitor_factors()

        if outview_factor is None:
            outview_factor = mougli.load_outview_factor()

        # Combinar archivos Monitor
        monitor_buffer = None
        if monitor_files:
            combined = BytesIO()
            for i, file in enumerate(monitor_files):
                content = await file.read()
                if i > 0:
                    combined.write(b"\n")
                combined.write(content)
            combined.seek(0)
            monitor_buffer = combined

        # Procesar primer archivo OutView (o combinar si son múltiples)
        outview_buffer = None
        if outview_files:
            # Por ahora procesamos solo el primero
            # TODO: implementar combinación de múltiples OutView
            first_file = outview_files[0]
            content = await first_file.read()
            outview_buffer = BytesIO(content)
            outview_buffer.name = first_file.filename

        # Procesar con la lógica existente de Mougli
        df_result, xlsx_bytes = mougli.procesar_monitor_outview(
            monitor_buffer,
            outview_buffer,
            factores=factores,
            outview_factor=outview_factor
        )

        # Retornar archivo Excel
        xlsx_bytes.seek(0)
        return StreamingResponse(
            xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": "attachment; filename=SiReset_Mougli.xlsx"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando archivos: {str(e)}"
        )

@router.get("/factores")
async def get_factores(
    current_user: User = Depends(get_current_user)
):
    """
    Obtener factores de conversión actuales
    """
    monitor_factors = mougli.load_monitor_factors()
    outview_factor = mougli.load_outview_factor()

    return {
        "monitor": monitor_factors,
        "outview_factor": outview_factor
    }

@router.post("/factores")
async def update_factores(
    monitor_factors: dict = None,
    outview_factor: float = None,
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar factores de conversión (solo admins y programmers)
    """
    if current_user.role not in ["admin", "programmer"]:
        raise HTTPException(
            status_code=403,
            detail="Solo administradores y programadores pueden actualizar factores"
        )

    if monitor_factors:
        mougli.save_monitor_factors(monitor_factors)

    if outview_factor is not None:
        mougli.save_outview_factor(outview_factor)

    return {
        "message": "Factores actualizados",
        "monitor": monitor_factors or mougli.load_monitor_factors(),
        "outview_factor": outview_factor or mougli.load_outview_factor()
    }

@router.post("/preview")
async def preview_file(
    file: UploadFile = File(...),
    file_type: str = Form(...),  # "monitor" o "outview"
    current_user: User = Depends(get_current_user)
):
    """
    Vista previa de archivo sin procesamiento completo
    Retorna resumen con estadísticas básicas
    """
    try:
        content = await file.read()
        buffer = BytesIO(content)
        buffer.name = file.filename

        if file_type == "monitor":
            df = mougli._read_monitor_txt(buffer)
            es_monitor = True
        else:
            df = mougli._read_out_robusto(buffer)
            es_monitor = False

        # Generar resumen
        resumen = mougli.resumen_mougli(df, es_monitor=es_monitor)

        return {
            "filas": len(df),
            "columnas": len(df.columns),
            "resumen": resumen.to_dict(orient="records"),
            "preview_head": df.head(10).to_dict(orient="records") if not df.empty else []
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error leyendo archivo: {str(e)}"
        )
