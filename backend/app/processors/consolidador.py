"""
Consolidador de Monitor y OutView

Une datos de Monitor (ATL) y OutView (OOH) en una única hoja consolidada
con 27 columnas híbridas.

Características:
- Mapeo de columnas simples y híbridas
- Ordenamiento por FECHA y MARCA
- Validaciones de calidad de datos
"""

import logging
import pandas as pd
from typing import Optional

logger = logging.getLogger('mougli.consolidador')


# ==========================================
# CONSTANTES DE MAPEO
# ==========================================

# Orden EXACTO de las 27 columnas consolidadas
COLUMNAS_CONSOLIDADO = [
    'FECHA',
    'AÑO',
    'MES',
    'SEMANA',
    'MEDIO',
    'MARCA',
    'PRODUCTO',
    'VERSIÓN',
    'DURACIÓN',
    'TIPO ELEMENTO',
    'TIME / Q VERSIONES',
    'EMISORA / DISTRITO',
    'PROGRAMA / AVENIDA',
    'BREAK / CALLE',
    'POS. SPOT / ORIENTACIÓN',
    'INVERSIÓN REAL',
    'SECTOR',
    'CATEGORÍA',
    'ÍTEM',
    'AGENCIA',
    'ANUNCIANTE',
    'REGIÓN',
    'ANCHO / LATITUD',
    'ALTO / LONGITUD',
    'GEN / +1 SUPERFICIE',
    'Q ELEMENTOS',
    'EDITORA / PROVEEDOR'
]

# Mapeo de columnas simples de Monitor a Consolidado
MAPEO_SIMPLE_MONITOR = {
    'DIA': 'FECHA',
    'AÑO': 'AÑO',
    'MES': 'MES',
    'SEMANA': 'SEMANA',
    'MEDIO': 'MEDIO',
    'MARCA': 'MARCA',
    'PRODUCTO': 'PRODUCTO',
    'VERSION': 'VERSIÓN',
    'DURACION': 'DURACIÓN',
    'SECTOR': 'SECTOR',
    'CATEGORIA': 'CATEGORÍA',
    'ITEM': 'ÍTEM',
    'AGENCIA': 'AGENCIA',
    'ANUNCIANTE': 'ANUNCIANTE',
    'REGION/ÁMBITO': 'REGIÓN',
    'INVERSION': 'INVERSIÓN REAL'
}

# Mapeo de columnas simples de OutView a Consolidado
MAPEO_SIMPLE_OUTVIEW = {
    'Fecha': 'FECHA',
    'AÑO': 'AÑO',
    'MES': 'MES',
    'SEMANA': 'SEMANA',
    'Medio': 'MEDIO',
    'Marca': 'MARCA',
    'Producto': 'PRODUCTO',
    'Versión': 'VERSIÓN',
    'Tipo Elemento': 'TIPO ELEMENTO',
    'Sector': 'SECTOR',
    'Categoría': 'CATEGORÍA',
    'Item': 'ÍTEM',
    'Agencia': 'AGENCIA',
    'Anunciante': 'ANUNCIANTE',
    'Región': 'REGIÓN',
    'Tarifa Real ($)': 'INVERSIÓN REAL'
}

# Mapeo de columnas híbridas de Monitor (lado izquierdo del /)
MAPEO_HIBRIDO_MONITOR = {
    'HORA': 'TIME / Q VERSIONES',
    'EMISORA/SITE': 'EMISORA / DISTRITO',
    'PROGRAMA/TIPO DE SITE': 'PROGRAMA / AVENIDA',
    'BREAK': 'BREAK / CALLE',
    'POS. SPOT': 'POS. SPOT / ORIENTACIÓN',
    'ANCHO': 'ANCHO / LATITUD',
    'ALTO': 'ALTO / LONGITUD',
    'GENERO': 'GEN / +1 SUPERFICIE',
    'EDITORA': 'EDITORA / PROVEEDOR'
}

# Mapeo de columnas híbridas de OutView (lado derecho del /)
MAPEO_HIBRIDO_OUTVIEW = {
    'Q versiones por elemento Mes': 'TIME / Q VERSIONES',
    'Distrito': 'EMISORA / DISTRITO',
    'Avenida': 'PROGRAMA / AVENIDA',
    'Nro Calle/Cuadra': 'BREAK / CALLE',
    'Orientación de Vía': 'POS. SPOT / ORIENTACIÓN',
    'Latitud': 'ANCHO / LATITUD',
    'Longitud': 'ALTO / LONGITUD',
    '+1 Superficie': 'GEN / +1 SUPERFICIE',
    'Proveedor': 'EDITORA / PROVEEDOR',
    'Conteo mensual': 'Q ELEMENTOS'
}


# ==========================================
# FUNCIÓN PRINCIPAL DE CONSOLIDACIÓN
# ==========================================

def consolidar_monitor_outview(
    df_monitor: pd.DataFrame,
    df_outview: pd.DataFrame
) -> pd.DataFrame:
    """
    Consolida datos de Monitor y OutView en 27 columnas híbridas

    Args:
        df_monitor: DataFrame Monitor procesado (39 columnas)
        df_outview: DataFrame OutView procesado (33 columnas)

    Returns:
        DataFrame consolidado con 27 columnas ordenado por FECHA y MARCA

    Raises:
        ValueError: Si los DataFrames no tienen las columnas esperadas
    """

    logger.info(f"Consolidando Monitor ({len(df_monitor)} filas) + OutView ({len(df_outview)} filas)")

    # ==========================================
    # PASO 1: Preparar Monitor
    # ==========================================

    df_monitor_cons = _preparar_monitor_para_consolidado(df_monitor)
    logger.info(f"Monitor preparado: {len(df_monitor_cons)} filas")

    # ==========================================
    # PASO 2: Preparar OutView
    # ==========================================

    df_outview_cons = _preparar_outview_para_consolidado(df_outview)
    logger.info(f"OutView preparado: {len(df_outview_cons)} filas")

    # ==========================================
    # PASO 3: Concatenar
    # ==========================================

    df_consolidado = pd.concat([
        df_monitor_cons,
        df_outview_cons
    ], ignore_index=True)

    logger.info(f"Consolidado: {len(df_consolidado)} filas totales")

    # ==========================================
    # PASO 4: Ordenar por FECHA y MARCA
    # ==========================================

    df_consolidado = df_consolidado.sort_values(
        ['FECHA', 'MARCA'],
        ascending=[True, True]
    )

    # Resetear índice
    df_consolidado = df_consolidado.reset_index(drop=True)

    # ==========================================
    # PASO 5: Validar
    # ==========================================

    warnings = validar_consolidado(df_consolidado)
    if warnings:
        for warning in warnings:
            logger.warning(f"Validación: {warning}")

    logger.info("Consolidación completada exitosamente")

    return df_consolidado


# ==========================================
# FUNCIONES DE PREPARACIÓN
# ==========================================

def _preparar_monitor_para_consolidado(df_monitor: pd.DataFrame) -> pd.DataFrame:
    """
    Prepara DataFrame Monitor para consolidación

    - Renombra columnas simples
    - Mapea columnas híbridas (lado Monitor)
    - Agrega columnas OutView como vacías
    """

    df = df_monitor.copy()

    # 1. Renombrar columnas simples
    df = df.rename(columns=MAPEO_SIMPLE_MONITOR)

    # 2. Mapear columnas híbridas (lado Monitor del /)
    for col_monitor, col_consolidado in MAPEO_HIBRIDO_MONITOR.items():
        if col_monitor in df.columns:
            df[col_consolidado] = df[col_monitor]
        else:
            logger.warning(f"Columna {col_monitor} no encontrada en Monitor")
            df[col_consolidado] = ''

    # 3. Agregar columnas específicas de OutView (vacías para Monitor)
    df['TIPO ELEMENTO'] = ''
    df['Q ELEMENTOS'] = ''

    # 4. Asegurar que todas las 27 columnas existen
    for col in COLUMNAS_CONSOLIDADO:
        if col not in df.columns:
            df[col] = ''

    # 5. Seleccionar solo las 27 columnas finales
    df = df[COLUMNAS_CONSOLIDADO]

    return df


def _preparar_outview_para_consolidado(df_outview: pd.DataFrame) -> pd.DataFrame:
    """
    Prepara DataFrame OutView para consolidación

    - Renombra columnas simples
    - Mapea columnas híbridas (lado OutView)
    - Agrega columnas Monitor como vacías
    """

    df = df_outview.copy()

    # 1. Renombrar columnas simples
    df = df.rename(columns=MAPEO_SIMPLE_OUTVIEW)

    # 2. Mapear columnas híbridas (lado OutView del /)
    for col_outview, col_consolidado in MAPEO_HIBRIDO_OUTVIEW.items():
        if col_outview in df.columns:
            df[col_consolidado] = df[col_outview]
        else:
            logger.warning(f"Columna {col_outview} no encontrada en OutView")
            df[col_consolidado] = ''

    # 3. Agregar columna específica de Monitor (vacía para OutView)
    df['DURACIÓN'] = ''

    # 4. Asegurar que todas las 27 columnas existen
    for col in COLUMNAS_CONSOLIDADO:
        if col not in df.columns:
            df[col] = ''

    # 5. Seleccionar solo las 27 columnas finales
    df = df[COLUMNAS_CONSOLIDADO]

    return df


# ==========================================
# VALIDACIONES
# ==========================================

def validar_consolidado(df_consolidado: pd.DataFrame) -> list[str]:
    """
    Valida calidad de datos consolidados

    Returns:
        Lista de warnings encontrados (vacía si todo OK)
    """

    warnings = []

    # 1. Número de columnas
    if len(df_consolidado.columns) != 27:
        warnings.append(
            f"Esperadas 27 columnas, encontradas {len(df_consolidado.columns)}"
        )

    # 2. Orden de columnas
    if list(df_consolidado.columns) != COLUMNAS_CONSOLIDADO:
        warnings.append("Orden de columnas incorrecto")

    # 3. Todas las filas tienen FECHA
    fechas_vacias = df_consolidado['FECHA'].isna().sum()
    if fechas_vacias > 0:
        warnings.append(f"{fechas_vacias} filas sin FECHA")

    # 4. Todas las filas tienen MEDIO
    medios_vacios = df_consolidado['MEDIO'].isna().sum()
    if medios_vacios > 0:
        warnings.append(f"{medios_vacios} filas sin MEDIO")

    # 5. Medios válidos
    medios_validos = {'TV', 'CABLE', 'RADIO', 'REVISTA', 'DIARIOS', 'VIA PUBLICA'}
    medios_encontrados = set(df_consolidado['MEDIO'].dropna().unique())
    medios_invalidos = medios_encontrados - medios_validos

    if medios_invalidos:
        warnings.append(f"Medios no válidos: {medios_invalidos}")

    # 6. Inversión >= 0
    inv_negativas = (df_consolidado['INVERSIÓN REAL'] < 0).sum()
    if inv_negativas > 0:
        warnings.append(f"{inv_negativas} filas con INVERSIÓN negativa")

    return warnings


# ==========================================
# METADATOS CONSOLIDADO
# ==========================================

def crear_metadatos_consolidado(df_consolidado: pd.DataFrame) -> pd.DataFrame:
    """
    Genera metadatos para hoja Consolidado (filas 1-8)

    Returns:
        DataFrame con 8 filas:
        - Fila 1: vacía
        - Fila 2: headers (Descripción, Valor)
        - Filas 3-8: metadatos del consolidado
    """

    total_filas = len(df_consolidado)

    # Rango de fechas
    fecha_min = df_consolidado['FECHA'].min()
    fecha_max = df_consolidado['FECHA'].max()

    # Formatear fechas
    if pd.notna(fecha_min) and pd.notna(fecha_max):
        fecha_min_str = pd.to_datetime(fecha_min).strftime('%d/%m/%Y')
        fecha_max_str = pd.to_datetime(fecha_max).strftime('%d/%m/%Y')
        rango_fechas = f"{fecha_min_str} - {fecha_max_str}"
    else:
        rango_fechas = "N/A"

    # Marcas únicas
    marcas_unicas = df_consolidado['MARCA'].nunique()

    # Sectores únicos (primeros 3)
    sectores_unicos = sorted(df_consolidado['SECTOR'].dropna().unique())
    sectores = ', '.join(sectores_unicos[:3])
    if len(sectores_unicos) > 3:
        sectores += '...'

    # Categorías únicas (primeras 5)
    categorias_unicas = sorted(df_consolidado['CATEGORÍA'].dropna().unique())
    categorias = ', '.join(categorias_unicas[:5])
    if len(categorias_unicas) > 5:
        categorias += '...'

    # Regiones únicas
    regiones_unicas = sorted(df_consolidado['REGIÓN'].dropna().unique())
    regiones = ', '.join(regiones_unicas)

    # Crear DataFrame de metadatos
    metadatos = pd.DataFrame([
        ['', ''],  # Fila 1 vacía
        ['Descripción', 'Valor'],  # Fila 2: headers
        ['Filas', total_filas],
        ['Rango de fechas', rango_fechas],
        ['Marcas / Anunciantes', marcas_unicas],
        ['Sectores', sectores],
        ['Categorías', categorias],
        ['Regiones', regiones]
    ])

    return metadatos
