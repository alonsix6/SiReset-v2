# backend/app/processors/afinimap_processor.py
"""
Procesador de AfiniMap - Generador de Mapas de Afinidad TGI

Procesa archivos Excel TGI de Kantar Ibope Media y genera scatter plots
de burbujas mostrando la relación entre Consumo % (eje X) y Afinidad (eje Y).
"""

import io
import logging
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Backend sin GUI para servidores
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

logger = logging.getLogger('afinimap.processor')


class AfinimapProcessor:
    """
    Procesador de archivos Excel TGI para AfiniMap

    Extrae variables con consumo y afinidad desde formato TGI específico
    y genera visualizaciones de scatter plot con burbujas.
    """

    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.target_name: str = ""
        self.variables: List[Dict[str, Any]] = []

    def procesar_excel(self, excel_content: bytes) -> Dict[str, Any]:
        """
        Procesa Excel TGI y extrae metadatos de variables

        Estructura esperada del Excel:
        - Fila 1: "Nuevo Informe" (título, ignorar)
        - Fila 2: Metadata (ignorar)
        - Fila 3: "Base" (ignorar)
        - Fila 4: [vacía]
        - Fila 5: HEADERS → Col A: [vacío] | Col B: "Elementos" | Col C: "TOTAL" | Col D: "[NOMBRE_TARGET]"
        - Fila 6: TOTAL baseline → Col B: "Vert%" | Col C: "100.0%" | Col D: "100.0%"
        - Fila 7: TOTAL baseline → Col B: "Afinidad" | Col C: "100" | Col D: "100"
        - Fila 8+: DATOS REALES (variables a procesar)

        Args:
            excel_content: Bytes del archivo Excel

        Returns:
            {
                "target_name": "Nombre del target",
                "variables": [
                    {
                        "nombre": "Variable X",
                        "consumo": 48.1,  # Porcentaje (0-100)
                        "afinidad": 133.0,
                        "visible": true
                    },
                    ...
                ]
            }

        Raises:
            ValueError: Si el formato del Excel no es válido
        """
        logger.info("Iniciando procesamiento de Excel TGI")

        # 1. Leer Excel
        try:
            self.df = pd.read_excel(io.BytesIO(excel_content), header=None)
            logger.info(f"Excel leído: {self.df.shape[0]} filas x {self.df.shape[1]} columnas")
        except Exception as e:
            logger.error(f"Error leyendo Excel: {e}")
            raise ValueError(f"No se pudo leer el archivo Excel: {str(e)}")

        # 2. Validar estructura mínima
        if self.df.shape[0] < 8 or self.df.shape[1] < 4:
            raise ValueError(
                f"Excel con formato inválido. "
                f"Se esperan al menos 8 filas y 4 columnas, "
                f"se encontraron {self.df.shape[0]} filas y {self.df.shape[1]} columnas."
            )

        # 3. Extraer target_name de Fila 5 (índice 4), Col D (índice 3)
        try:
            self.target_name = str(self.df.iloc[4, 3]).strip()
            logger.info(f"Target detectado: {self.target_name}")
        except Exception as e:
            logger.warning(f"Error extrayendo target_name: {e}. Usando 'Target' por defecto.")
            self.target_name = "Target"

        # 4. Procesar variables desde fila 8 (índice 7)
        self.variables = self._procesar_variables_tgi(target_column_idx=3)

        logger.info(f"Procesamiento completado: {len(self.variables)} variables extraídas")

        return {
            "target_name": self.target_name,
            "variables": self.variables
        }

    def _procesar_variables_tgi(self, target_column_idx: int = 3) -> List[Dict[str, Any]]:
        """
        Procesa variables TGI desde el DataFrame

        Cada variable ocupa 2 filas consecutivas:
        - Fila N: Col A: "Nombre" | Col B: "Vert%" | Col D: "48.1%" o 0.481
        - Fila N+1: Col A: [vacío] | Col B: "Afinidad" | Col D: "133" o 1.33

        Args:
            target_column_idx: Índice de la columna del target (default 3 = Col D)

        Returns:
            Lista de diccionarios con estructura:
            [
                {
                    "nombre": "Variable X",
                    "consumo": 48.1,  # Porcentaje (0-100)
                    "afinidad": 133.0,
                    "visible": True
                },
                ...
            ]
        """
        variables = []
        start_row = 7  # Fila 8 (índice 7)

        i = start_row
        while i < len(self.df):
            try:
                # Verificar si es inicio de par (Vert%)
                tipo_metrica = str(self.df.iloc[i, 1]).strip()

                if tipo_metrica == "Vert%":
                    # Verificar que siguiente fila sea "Afinidad"
                    if i + 1 < len(self.df):
                        siguiente_metrica = str(self.df.iloc[i + 1, 1]).strip()

                        if siguiente_metrica == "Afinidad":
                            # Extraer datos
                            nombre = str(self.df.iloc[i, 0]).strip()
                            consumo_raw = self.df.iloc[i, target_column_idx]
                            afinidad_raw = self.df.iloc[i + 1, target_column_idx]

                            # Limpiar y convertir
                            consumo = self._convertir_consumo(consumo_raw)
                            afinidad = self._convertir_afinidad(afinidad_raw)

                            # Solo agregar si valores válidos
                            if consumo is not None and afinidad is not None and consumo > 0:
                                variables.append({
                                    "nombre": nombre,
                                    "consumo": consumo,  # Ya en porcentaje (0-100)
                                    "afinidad": afinidad,
                                    "visible": True
                                })
                                logger.debug(
                                    f"Variable extraída: {nombre} | "
                                    f"Consumo: {consumo:.2f}% | Afinidad: {afinidad:.1f}"
                                )

                            i += 2  # Saltar par procesado
                            continue

            except Exception as e:
                logger.warning(f"Error procesando fila {i}: {e}")

            i += 1

        return variables

    def _convertir_consumo(self, valor: Any) -> Optional[float]:
        """
        Convierte consumo a porcentaje (0-100)

        Ejemplos:
        - "48.1%" → 48.1
        - "0.481" → 48.1
        - 0.481 → 48.1

        Args:
            valor: Valor a convertir

        Returns:
            Float entre 0 y 100, o None si no se puede convertir
        """
        try:
            if pd.isna(valor):
                return None

            if isinstance(valor, str):
                valor = valor.strip()
                # Si tiene %, remover y retornar como float
                if '%' in valor:
                    return float(valor.replace('%', ''))
                else:
                    # Si es decimal (< 1), multiplicar por 100
                    val = float(valor)
                    if val > 0 and val < 1:
                        return val * 100
                    return val
            else:
                # Si es decimal (< 1), multiplicar por 100
                val = float(valor)
                if val > 0 and val < 1:
                    return val * 100
                return val

        except (ValueError, TypeError):
            logger.warning(f"No se pudo convertir consumo: {valor}")
            return None

    def _convertir_afinidad(self, valor: Any) -> Optional[float]:
        """
        Convierte afinidad a float

        Maneja formatos decimales (1.33 → 133)

        Args:
            valor: Valor a convertir

        Returns:
            Float, o None si no se puede convertir
        """
        try:
            if pd.isna(valor):
                return None

            val = float(valor)
            # Si afinidad viene como decimal (< 10), multiplicar por 100
            if val > 0 and val < 10:
                return val * 100
            return val

        except (ValueError, TypeError):
            logger.warning(f"No se pudo convertir afinidad: {valor}")
            return None


# ========== FUNCIONES AUXILIARES PARA MATPLOTLIB ==========

def calcular_ticks(min_val: float, max_val: float, cantidad_ticks: int = 8) -> np.ndarray:
    """
    Calcula ticks "limpios" para un eje (5, 10, 20, 50, 100, etc.)

    Args:
        min_val: Valor mínimo
        max_val: Valor máximo
        cantidad_ticks: Cantidad aproximada de ticks deseados

    Returns:
        Array numpy con valores para ticks
    """
    rango = max_val - min_val
    step_raw = rango / (cantidad_ticks - 1)

    # Encontrar step "limpio"
    magnitude = 10 ** np.floor(np.log10(step_raw))
    normalized = step_raw / magnitude

    if normalized <= 1:
        step = magnitude
    elif normalized <= 2:
        step = 2 * magnitude
    elif normalized <= 5:
        step = 5 * magnitude
    else:
        step = 10 * magnitude

    # Generar ticks
    start = np.floor(min_val / step) * step
    ticks = []
    current = start

    while current <= max_val:
        if current >= min_val:
            ticks.append(current)
        current += step

    # Asegurar que incluimos el max si está cerca
    if len(ticks) > 0 and ticks[-1] < max_val and (max_val - ticks[-1]) > step * 0.1:
        ticks.append(np.ceil(max_val / step) * step)

    return np.array(ticks)


def calcular_lineas_referencia(consumos: np.ndarray, afinidades: np.ndarray) -> Tuple[float, float]:
    """
    Calcula líneas de referencia para dividir en 4 cuadrantes

    Args:
        consumos: Array de consumos (porcentajes)
        afinidades: Array de afinidades

    Returns:
        Tupla (linea_vertical, linea_horizontal)
        - linea_vertical: mediana de consumos
        - linea_horizontal: mediana de afinidad (si min >= 100) o 100
    """
    # Mediana de consumos (línea vertical)
    linea_vertical = np.median(consumos)

    # Línea horizontal: mediana si min >= 100, sino 100
    min_afinidad = np.min(afinidades)
    if min_afinidad >= 100:
        linea_horizontal = np.median(afinidades)
    else:
        linea_horizontal = 100.0

    return linea_vertical, linea_horizontal


def generar_afinimap_matplotlib(
    variables: List[Dict[str, Any]],
    target_name: str,
    linea_afinidad: float = 110.0,
    color_burbujas: str = '#cf3b4d',
    color_fondo: str = '#fff2f4'
) -> io.BytesIO:
    """
    Genera imagen PNG del AfiniMap usando matplotlib con ticks y referencias dinámicas

    Crea un scatter plot de burbujas mostrando:
    - Eje X: Consumo % (0-100%)
    - Eje Y: Afinidad (índice, mínimo 100)
    - Tamaño burbuja: Fijo (no proporcional)
    - Líneas de referencia: 4 cuadrantes (mediana X, mediana/100 Y)
    - Ticks dinámicos: calculados automáticamente

    Args:
        variables: Lista de diccionarios con nombre, consumo (porcentaje), afinidad
        target_name: Nombre del target (para título)
        linea_afinidad: Valor Y de línea adicional (opcional)
        color_burbujas: Color hex de las burbujas
        color_fondo: Color hex del fondo

    Returns:
        BytesIO con imagen PNG a 300 DPI

    Raises:
        ValueError: Si hay menos de 2 variables visibles
    """
    logger.info(
        f"Generando AfiniMap para {target_name} con {len(variables)} variables"
    )

    # Validar cantidad mínima
    if len(variables) < 2:
        raise ValueError("Se necesitan al menos 2 variables para generar el gráfico")

    # Extraer datos
    nombres = [v['nombre'] for v in variables]
    consumos = np.array([v['consumo'] for v in variables])  # Ya en porcentaje (0-100)
    afinidades = np.array([v['afinidad'] for v in variables])

    # ========== CALCULAR DOMINIOS DINÁMICOS ==========

    # Padding del 10%
    consumo_range = np.max(consumos) - np.min(consumos)
    afinidad_range = np.max(afinidades) - np.min(afinidades)

    x_min = max(0, np.min(consumos) - consumo_range * 0.1)
    x_max = np.max(consumos) + consumo_range * 0.1

    # Y mínimo siempre >= 100
    y_min = max(100, np.min(afinidades) - afinidad_range * 0.1)
    y_max = np.max(afinidades) + afinidad_range * 0.1

    # ========== CALCULAR TICKS DINÁMICOS ==========

    x_ticks = calcular_ticks(x_min, x_max, cantidad_ticks=8)
    y_ticks = calcular_ticks(y_min, y_max, cantidad_ticks=8)

    # ========== CALCULAR LÍNEAS DE REFERENCIA ==========

    linea_vertical, linea_horizontal = calcular_lineas_referencia(consumos, afinidades)

    # ========== CONFIGURAR FIGURA ==========

    plt.figure(figsize=(14, 9))
    ax = plt.gca()
    ax.set_facecolor(color_fondo)

    # ========== LÍNEAS DE REFERENCIA (4 CUADRANTES) ==========

    # Línea vertical (mediana consumo)
    plt.axvline(
        x=linea_vertical,
        color='#888888',
        linestyle='--',
        linewidth=2,
        alpha=0.7,
        zorder=1
    )

    # Línea horizontal (mediana afinidad o 100)
    plt.axhline(
        y=linea_horizontal,
        color='#888888',
        linestyle='--',
        linewidth=2,
        alpha=0.7,
        zorder=1
    )

    # Línea de afinidad personalizada (si se proporciona y es diferente)
    if linea_afinidad and abs(linea_afinidad - linea_horizontal) > 1:
        plt.axhline(
            y=linea_afinidad,
            color='#666666',
            linestyle=':',
            linewidth=1.5,
            alpha=0.6,
            zorder=1
        )

    # ========== SCATTER PLOT CON BURBUJAS ==========

    # Tamaño fijo para todas las burbujas
    TAMANO_BURBUJA = 600

    scatter = plt.scatter(
        x=consumos,
        y=afinidades,
        s=TAMANO_BURBUJA,  # Tamaño fijo
        color=color_burbujas,
        alpha=0.85,
        edgecolors='white',
        linewidth=1.5,
        zorder=2
    )

    # ========== ETIQUETAS CON FONDO BLANCO REDONDEADO ==========

    for i, nombre in enumerate(nombres):
        # Acortar si es muy largo
        label = nombre if len(nombre) <= 35 else nombre[:32] + '...'

        plt.annotate(
            label,
            xy=(consumos[i], afinidades[i]),
            xytext=(0, 12),  # Offset arriba
            textcoords='offset points',
            ha='center',
            fontsize=9,
            fontweight=600,
            bbox=dict(
                boxstyle='round,pad=0.4',
                fc='white',
                alpha=0.9,
                lw=0,
                edgecolor='white'
            ),
            zorder=3
        )

    # ========== CONFIGURAR EJES ==========

    plt.xlabel('Consumo (%)', fontsize=16, fontweight='bold', color='#333333', labelpad=10)
    plt.ylabel('Afinidad', fontsize=16, fontweight='bold', color='#333333', labelpad=10)

    # Aplicar ticks dinámicos
    plt.xticks(x_ticks, [f'{int(x)}%' for x in x_ticks], fontsize=12, color='#666666')
    plt.yticks(y_ticks, [f'{int(y)}' for y in y_ticks], fontsize=12, color='#666666')

    # Aplicar límites
    plt.xlim(x_min, x_max)
    plt.ylim(y_min, y_max)

    # ========== GRID Y ESTILO ==========

    plt.grid(True, alpha=0.3, zorder=0, linestyle='-', linewidth=1, color='rgba(170, 170, 170, 0.3)')

    # Estilo de ejes
    ax.spines['top'].set_visible(True)
    ax.spines['right'].set_visible(True)
    ax.spines['bottom'].set_color('#AAAAAA')
    ax.spines['left'].set_color('#AAAAAA')
    ax.spines['top'].set_color('#AAAAAA')
    ax.spines['right'].set_color('#AAAAAA')

    # ========== TÍTULO ==========

    plt.title(f'Target: {target_name}', fontsize=18, fontweight='bold', color='#00CED1', pad=15)

    # ========== GUARDAR A BytesIO ==========

    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(
        buf,
        format='png',
        dpi=300,
        bbox_inches='tight',
        facecolor=color_fondo
    )
    buf.seek(0)
    plt.close()

    logger.info("Gráfico generado exitosamente con ticks y líneas dinámicas")

    return buf
