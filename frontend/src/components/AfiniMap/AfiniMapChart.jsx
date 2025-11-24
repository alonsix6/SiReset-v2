import { forwardRef } from 'react'
import Plot from 'react-plotly.js'

// ========== FUNCIONES AUXILIARES ==========

/**
 * Calcula ticks "limpios" para un eje
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {number} cantidadTicks - Cantidad aproximada de ticks deseados
 * @returns {number[]} Array de valores para ticks
 */
const calcularTicks = (min, max, cantidadTicks = 8) => {
  const rango = max - min
  const step_raw = rango / (cantidadTicks - 1)

  // Encontrar step "limpio" (5, 10, 20, 50, 100, etc.)
  const magnitude = Math.pow(10, Math.floor(Math.log10(step_raw)))
  const normalized = step_raw / magnitude

  let step
  if (normalized <= 1) step = magnitude
  else if (normalized <= 2) step = 2 * magnitude
  else if (normalized <= 5) step = 5 * magnitude
  else step = 10 * magnitude

  // Generar ticks
  const ticks = []
  const start = Math.floor(min / step) * step
  let current = start

  while (current <= max) {
    if (current >= min) {
      ticks.push(current)
    }
    current += step
  }

  // Asegurar que incluimos el max si está cerca
  if (ticks[ticks.length - 1] < max && (max - ticks[ticks.length - 1]) > step * 0.1) {
    ticks.push(Math.ceil(max / step) * step)
  }

  return ticks
}

/**
 * Calcula las líneas de referencia para dividir en 4 cuadrantes
 * @param {Array} data - Array de datos con consumo y afinidad
 * @returns {Object} Objeto con lineaVertical y lineaHorizontal
 */
const calcularLineasReferencia = (data) => {
  if (!data || data.length === 0) {
    return { lineaVertical: null, lineaHorizontal: null }
  }

  const consumos = data.map(d => d.consumo).sort((a, b) => a - b)
  const afinidades = data.map(d => d.afinidad).sort((a, b) => a - b)

  // Mediana de consumos (línea vertical)
  const medianConsumo = consumos.length % 2 === 0
    ? (consumos[consumos.length / 2 - 1] + consumos[consumos.length / 2]) / 2
    : consumos[Math.floor(consumos.length / 2)]

  // Línea horizontal: mediana si min >= 100, sino 100
  const minAfinidad = Math.min(...afinidades)
  let lineaHorizontal

  if (minAfinidad >= 100) {
    lineaHorizontal = afinidades.length % 2 === 0
      ? (afinidades[afinidades.length / 2 - 1] + afinidades[afinidades.length / 2]) / 2
      : afinidades[Math.floor(afinidades.length / 2)]
  } else {
    lineaHorizontal = 100
  }

  return {
    lineaVertical: medianConsumo,
    lineaHorizontal: lineaHorizontal
  }
}

/**
 * Detecta colisiones entre labels usando distancia euclidiana
 * @param {Array} labels - Array de objetos con x, y, index
 * @param {Array} xDomain - Rango [min, max] del eje X
 * @param {Array} yDomain - Rango [min, max] del eje Y
 * @param {number} threshold - Distancia mínima sin colisión
 * @returns {Set} Set de índices que tienen colisiones
 */
const detectarColisiones = (labels, xDomain, yDomain, threshold = 8) => {
  const colisiones = new Set()

  const xRange = xDomain[1] - xDomain[0]
  const yRange = yDomain[1] - yDomain[0]

  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const dx = Math.abs(labels[i].x - labels[j].x) / xRange * 100
      const dy = Math.abs(labels[i].y - labels[j].y) / yRange * 100

      const distancia = Math.sqrt(dx * dx + dy * dy)

      if (distancia < threshold) {
        colisiones.add(i)
        colisiones.add(j)
      }
    }
  }

  return colisiones
}

/**
 * Calcula posiciones inteligentes para labels evitando colisiones
 * @param {Array} data - Array de datos
 * @param {Array} xDomain - Rango del eje X
 * @param {Array} yDomain - Rango del eje Y
 * @param {Object} config - Configuración de offsets
 * @returns {Array} Array de configuraciones de annotations
 */
const calcularPosicionLabels = (data, xDomain, yDomain, config) => {
  const xRange = xDomain[1] - xDomain[0]
  const yRange = yDomain[1] - yDomain[0]

  // Preparar labels básicos
  const labels = data.map((punto, index) => ({
    x: punto.consumo,
    y: punto.afinidad,
    index: index,
    nombre: punto.nombre
  }))

  // Detectar colisiones
  const colisiones = detectarColisiones(labels, xDomain, yDomain, 8)

  // Generar annotations
  return labels.map((label, index) => {
    const xRelativo = (label.x - xDomain[0]) / xRange

    // Determinar alineación horizontal según posición X
    let xanchor = 'center'
    let xshift = 0

    if (xRelativo < 0.15) {
      xanchor = 'left'
      xshift = 5
    } else if (xRelativo > 0.85) {
      xanchor = 'right'
      xshift = -5
    }

    // Determinar offset Y según colisiones
    let yshift = config.labelOffsetY || 25

    // Si hay colisión, alternar arriba/abajo
    if (colisiones.has(index)) {
      // Alternar basado en índice para distribuir
      yshift = index % 2 === 0 ? -yshift : yshift
    }

    return {
      x: label.x,
      y: label.y,
      text: label.nombre,
      showarrow: false,
      font: {
        family: config.labelFont || 'Arial, sans-serif',
        size: config.labelSize || 10,
        color: config.labelColor || '#000000',
        weight: 600
      },
      bgcolor: config.labelBgColor || 'rgba(255, 255, 255, 0.9)',
      bordercolor: config.labelBorderColor || '#FFFFFF',
      borderwidth: 2,
      borderpad: 4,
      yshift: yshift,
      xshift: xshift,
      xanchor: xanchor,
      yanchor: yshift > 0 ? 'bottom' : 'top'
    }
  })
}

// ========== CONFIGURACIÓN POR DEFECTO ==========

const defaultConfig = {
  // Burbujas
  bubbleColor: '#cf3b4d',
  bubbleOpacity: 0.85,
  bubbleSize: 18,
  bubbleBorderColor: '#FFFFFF',
  bubbleBorderWidth: 1.5,

  // Ejes
  axisColor: '#333333',
  axisLineColor: '#AAAAAA',
  tickColor: '#666666',
  tickSize: 12,

  // Grid
  gridColor: 'rgba(170, 170, 170, 0.3)',
  gridWidth: 1,

  // Fondo
  backgroundColor: '#fff2f4',
  paperColor: 'transparent',

  // Líneas de referencia
  refLineColor: '#888888',
  refLineWidth: 2,
  refLineStyle: 'dash', // 'dash', 'dot', 'solid'

  // Títulos
  titleColor: '#333333',
  titleSize: 16,
  labelColor: '#000000',
  labelSize: 10,
  labelFont: 'Arial, sans-serif',
  labelOffsetY: 25,
  labelBgColor: 'rgba(255, 255, 255, 0.9)',
  labelBorderColor: '#FFFFFF',

  // Otros
  showLegend: false,
  cantidadTicks: 8
}

// ========== COMPONENTE PRINCIPAL ==========

const AfiniMapChart = forwardRef(({
  data,
  targetName,
  colorBurbujas,
  colorFondo,
  lineaAfinidad,
  config = {}
}, ref) => {
  // Merge config con defaults
  const finalConfig = { ...defaultConfig, ...config }

  // Sobrescribir con props directos si existen
  if (colorBurbujas) finalConfig.bubbleColor = colorBurbujas
  if (colorFondo) finalConfig.backgroundColor = colorFondo

  // Filtrar solo visibles
  const visibleData = data.filter(d => d.visible)

  if (visibleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-reset-gray-light">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-semibold">No hay datos para visualizar</p>
          <p className="text-sm mt-2">Selecciona al menos 2 variables para ver el mapa</p>
        </div>
      </div>
    )
  }

  // ========== CALCULAR DOMINIOS DINÁMICOS ==========

  const maxConsumo = Math.max(...visibleData.map(d => d.consumo))
  const minConsumo = Math.min(...visibleData.map(d => d.consumo))
  const maxAfinidad = Math.max(...visibleData.map(d => d.afinidad))
  const minAfinidad = Math.min(...visibleData.map(d => d.afinidad))

  // Padding del 10%
  const consumoRange = maxConsumo - minConsumo
  const afinidadRange = maxAfinidad - minAfinidad

  const xDomain = [
    Math.max(0, Math.floor(minConsumo - consumoRange * 0.1)),
    Math.ceil(maxConsumo + consumoRange * 0.1)
  ]

  // Y mínimo siempre >= 100
  const yDomain = [
    Math.max(100, Math.floor(minAfinidad - afinidadRange * 0.1)),
    Math.ceil(maxAfinidad + afinidadRange * 0.1)
  ]

  // ========== CALCULAR TICKS DINÁMICOS ==========

  const xTicks = calcularTicks(xDomain[0], xDomain[1], finalConfig.cantidadTicks)
  const yTicks = calcularTicks(yDomain[0], yDomain[1], finalConfig.cantidadTicks)

  // ========== CALCULAR LÍNEAS DE REFERENCIA ==========

  const { lineaVertical, lineaHorizontal } = calcularLineasReferencia(visibleData)

  // ========== CALCULAR POSICIONES DE LABELS ==========

  const annotations = calcularPosicionLabels(visibleData, xDomain, yDomain, finalConfig)

  // ========== PREPARAR DATOS PARA SCATTER ==========

  const scatterData = [{
    x: visibleData.map(d => d.consumo),
    y: visibleData.map(d => d.afinidad),
    mode: 'markers',
    type: 'scatter',
    name: 'Variables',
    marker: {
      size: visibleData.map(d => d.tamano || finalConfig.bubbleSize),
      color: finalConfig.bubbleColor,
      opacity: finalConfig.bubbleOpacity,
      line: {
        color: finalConfig.bubbleBorderColor,
        width: finalConfig.bubbleBorderWidth
      }
    },
    text: visibleData.map(d =>
      `<b>${d.nombre}</b><br>Consumo: ${d.consumo.toFixed(2)}%<br>Afinidad: ${d.afinidad.toFixed(1)}`
    ),
    hovertemplate: '%{text}<extra></extra>',
    showlegend: false
  }]

  // ========== PREPARAR SHAPES (LÍNEAS DE REFERENCIA) ==========

  const shapes = []

  // Línea vertical (mediana consumo)
  if (lineaVertical !== null) {
    shapes.push({
      type: 'line',
      x0: lineaVertical,
      y0: yDomain[0],
      x1: lineaVertical,
      y1: yDomain[1],
      line: {
        color: finalConfig.refLineColor,
        width: finalConfig.refLineWidth,
        dash: finalConfig.refLineStyle
      }
    })
  }

  // Línea horizontal (mediana afinidad o 100)
  if (lineaHorizontal !== null) {
    shapes.push({
      type: 'line',
      x0: xDomain[0],
      y0: lineaHorizontal,
      x1: xDomain[1],
      y1: lineaHorizontal,
      line: {
        color: finalConfig.refLineColor,
        width: finalConfig.refLineWidth,
        dash: finalConfig.refLineStyle
      }
    })
  }

  // Línea de afinidad personalizada (si se proporciona)
  if (lineaAfinidad && lineaAfinidad !== lineaHorizontal) {
    shapes.push({
      type: 'line',
      x0: xDomain[0],
      y0: lineaAfinidad,
      x1: xDomain[1],
      y1: lineaAfinidad,
      line: {
        color: '#666666',
        width: 1.5,
        dash: 'dot'
      }
    })
  }

  // ========== LAYOUT ESTILO MATPLOTLIB ==========

  const layout = {
    plot_bgcolor: finalConfig.backgroundColor,
    paper_bgcolor: finalConfig.paperColor,
    width: undefined,
    height: 600,
    autosize: true,
    margin: {
      l: 80,
      r: 60,
      t: 60,
      b: 80
    },
    xaxis: {
      title: {
        text: 'Consumo (%)',
        font: {
          family: 'Arial, sans-serif',
          size: finalConfig.titleSize,
          color: finalConfig.titleColor,
          weight: 'bold'
        }
      },
      range: xDomain,
      tickmode: 'array',
      tickvals: xTicks,
      ticktext: xTicks.map(v => `${v.toFixed(0)}%`),
      gridcolor: finalConfig.gridColor,
      gridwidth: finalConfig.gridWidth,
      tickfont: {
        size: finalConfig.tickSize,
        color: finalConfig.tickColor
      },
      zeroline: false,
      showline: true,
      linewidth: 1,
      linecolor: finalConfig.axisLineColor
    },
    yaxis: {
      title: {
        text: 'Afinidad',
        font: {
          family: 'Arial, sans-serif',
          size: finalConfig.titleSize,
          color: finalConfig.titleColor,
          weight: 'bold'
        }
      },
      range: yDomain,
      tickmode: 'array',
      tickvals: yTicks,
      ticktext: yTicks.map(v => v.toFixed(0)),
      gridcolor: finalConfig.gridColor,
      gridwidth: finalConfig.gridWidth,
      tickfont: {
        size: finalConfig.tickSize,
        color: finalConfig.tickColor
      },
      zeroline: false,
      showline: true,
      linewidth: 1,
      linecolor: finalConfig.axisLineColor
    },
    annotations: annotations,
    shapes: shapes,
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: 'rgba(0, 0, 0, 0.9)',
      bordercolor: '#00F0FF',
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#FFFFFF'
      }
    },
    showlegend: finalConfig.showLegend
  }

  const plotConfig = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <div ref={ref} className="w-full" style={{ backgroundColor: 'transparent' }}>
      {/* Target */}
      {targetName && (
        <div className="text-center py-4">
          <p className="text-reset-cyan text-lg font-semibold">
            Target: {targetName}
          </p>
        </div>
      )}

      {/* Gráfico Plotly */}
      <div className="pb-4">
        <Plot
          data={scatterData}
          layout={layout}
          config={plotConfig}
          style={{ width: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  )
})

AfiniMapChart.displayName = 'AfiniMapChart'

export default AfiniMapChart
