# backend/app/processors/afinimap_processor.py
"""
Procesador de AfiniMap - Generador de Mapas de Afinidad TGI

Procesa archivos Excel TGI de Kantar Ibope Media y genera scatter plots
de burbujas mostrando la relación entre Consumo % (eje X) y Afinidad (eje Y).
"""

import io
import logging
from typing import List, Dict, Any, Optional
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
                        "consumo": 0.481,
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
        - Fila N: Col A: "Nombre" | Col B: "Vert%" | Col D: "48.1%"
        - Fila N+1: Col A: [vacío] | Col B: "Afinidad" | Col D: "133"

        Args:
            target_column_idx: Índice de la columna del target (default 3 = Col D)

        Returns:
            Lista de diccionarios con estructura:
            [
                {
                    "nombre": "Variable X",
                    "consumo": 0.481,
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
                                    "consumo": consumo,
                                    "afinidad": afinidad,
                                    "visible": True
                                })
                                logger.debug(
                                    f"Variable extraída: {nombre} | "
                                    f"Consumo: {consumo:.3f} | Afinidad: {afinidad:.1f}"
                                )

                            i += 2  # Saltar par procesado
                            continue

            except Exception as e:
                logger.warning(f"Error procesando fila {i}: {e}")

            i += 1

        return variables

    def _convertir_consumo(self, valor: Any) -> Optional[float]:
        """
        Convierte consumo a float (maneja formato % o decimal)

        Ejemplos:
        - "48.1%" → 0.481
        - "0.481" → 0.481
        - 0.481 → 0.481

        Args:
            valor: Valor a convertir

        Returns:
            Float entre 0 y 1, o None si no se puede convertir
        """
        try:
            if pd.isna(valor):
                return None

            if isinstance(valor, str):
                valor = valor.strip()
                # Si tiene %, remover y dividir entre 100
                if '%' in valor:
                    return float(valor.replace('%', '')) / 100
                else:
                    return float(valor)
            else:
                return float(valor)

        except (ValueError, TypeError):
            logger.warning(f"No se pudo convertir consumo: {valor}")
            return None

    def _convertir_afinidad(self, valor: Any) -> Optional[float]:
        """
        Convierte afinidad a float

        Args:
            valor: Valor a convertir

        Returns:
            Float, o None si no se puede convertir
        """
        try:
            if pd.isna(valor):
                return None
            return float(valor)
        except (ValueError, TypeError):
            logger.warning(f"No se pudo convertir afinidad: {valor}")
            return None


def generar_afinimap_matplotlib(
    variables: List[Dict[str, Any]],
    target_name: str,
    linea_afinidad: float = 110.0,
    color_burbujas: str = '#cf3b4d',
    color_fondo: str = '#fff2f4'
) -> io.BytesIO:
    """
    Genera imagen PNG del AfiniMap usando matplotlib

    Crea un scatter plot de burbujas mostrando:
    - Eje X: Consumo % (0-100%)
    - Eje Y: Afinidad (índice)
    - Tamaño burbuja: Proporcional al consumo
    - Línea horizontal: Afinidad base (default 110)

    Args:
        variables: Lista de diccionarios con nombre, consumo, afinidad
        target_name: Nombre del target (para título)
        linea_afinidad: Valor Y de la línea horizontal base
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
    consumos = np.array([v['consumo'] for v in variables])
    afinidades = np.array([v['afinidad'] for v in variables])

    # Configurar tamaño de figura
    plt.figure(figsize=(14, 9))
    ax = plt.gca()
    ax.set_facecolor(color_fondo)

    # Scatter plot con burbujas
    scatter = plt.scatter(
        x=consumos,
        y=afinidades,
        s=consumos * 1500,  # Tamaño proporcional al consumo
        color=color_burbujas,
        alpha=0.9,
        edgecolors='white',
        linewidth=1.2,
        zorder=2
    )

    # Etiquetas en cada burbuja
    for i, nombre in enumerate(nombres):
        # Acortar si es muy largo
        label = nombre if len(nombre) <= 35 else nombre[:32] + '...'

        plt.annotate(
            label,
            xy=(consumos[i], afinidades[i]),
            xytext=(0, 10),
            textcoords='offset points',
            ha='center',
            fontsize=9,
            bbox=dict(
                boxstyle='round,pad=0.3',
                fc='white',
                alpha=0.95,
                lw=0.5,
                edgecolor='lightgray'
            ),
            zorder=3
        )

    # Línea horizontal de afinidad base
    plt.axhline(
        y=linea_afinidad,
        color='#333333',
        linestyle='--',
        linewidth=1.0,
        alpha=0.8,
        zorder=1,
        label=f'Afinidad base ({int(linea_afinidad)})'
    )

    # Configurar ejes
    plt.xlabel('Porcentaje de Consumo (%)', fontsize=12, labelpad=10)
    plt.ylabel('Índice de Afinidad (Aff.)', fontsize=12, labelpad=10)
    plt.title(f'AfiniMap - {target_name}', fontsize=14, fontweight='bold', pad=20)

    # Formatear eje X como porcentaje
    x_min = max(0, consumos.min() * 0.9)
    x_max = min(1, consumos.max() * 1.1)
    x_ticks = np.linspace(x_min, x_max, 8)
    plt.xticks(x_ticks, [f'{int(x*100)}%' for x in x_ticks])
    plt.xlim(x_min, x_max)

    # Formatear eje Y
    y_min = max(50, afinidades.min() - 10)
    y_max = afinidades.max() + 20
    plt.ylim(y_min, y_max)

    # Grid sutil
    plt.grid(True, alpha=0.2, zorder=0, linestyle=':', linewidth=0.5)

    # Leyenda
    plt.legend(loc='upper right', fontsize=10)

    # Guardar a BytesIO
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(
        buf,
        format='png',
        dpi=300,
        bbox_inches='tight',
        facecolor='white'
    )
    buf.seek(0)
    plt.close()

    logger.info("Gráfico generado exitosamente")

    return buf
