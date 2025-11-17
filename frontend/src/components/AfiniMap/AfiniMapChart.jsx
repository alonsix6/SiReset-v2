import { forwardRef, useMemo } from 'react'
import Plot from 'react-plotly.js'

const AfiniMapChart = forwardRef(({
  data,
  targetName,
  colorBurbujas,
  colorFondo,
  lineaAfinidad
}, ref) => {
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

  // Calcular dominio dinámico basado en los datos reales
  const maxConsumo = Math.max(...visibleData.map(d => d.consumo))
  const minConsumo = Math.min(...visibleData.map(d => d.consumo))
  const maxAfinidad = Math.max(...visibleData.map(d => d.afinidad))
  const minAfinidad = Math.min(...visibleData.map(d => d.afinidad))

  // Calcular dominios con padding del 10%
  const consumoRange = maxConsumo - minConsumo
  const afinidadRange = maxAfinidad - minAfinidad

  const xDomain = [
    Math.max(0, Math.floor(minConsumo - consumoRange * 0.1)),
    Math.ceil(maxConsumo + consumoRange * 0.1)
  ]
  const yDomain = [
    Math.max(0, Math.floor(minAfinidad - afinidadRange * 0.1)),
    Math.ceil(maxAfinidad + afinidadRange * 0.1)
  ]

  // Helper: Verificar si hay colisión con otras burbujas (para posicionar texto)
  const checkCollision = (currentIndex) => {
    const current = visibleData[currentIndex]

    for (let i = 0; i < visibleData.length; i++) {
      if (i === currentIndex) continue

      const other = visibleData[i]
      const dx = Math.abs(other.consumo - current.consumo)
      const dy = Math.abs(other.afinidad - current.afinidad)

      // Normalizar usando los rangos del dominio
      const normalizedDx = (dx / consumoRange) * 100
      const normalizedDy = (dy / afinidadRange) * 100

      // Si está cerca arriba, hay colisión
      if (normalizedDx < 8 && normalizedDy > 0 && normalizedDy < 12) {
        return true
      }
    }
    return false
  }

  // Crear annotations (etiquetas con fondo blanco)
  const annotations = visibleData.map((punto, index) => {
    const hasCollision = checkCollision(index)
    const yOffset = hasCollision ? -25 : 25 // Arriba si hay colisión, abajo si no

    return {
      x: punto.consumo,
      y: punto.afinidad,
      text: punto.nombre,
      showarrow: false,
      font: {
        family: 'Arial, sans-serif',
        size: 10,
        color: '#000000',
        weight: 600
      },
      bgcolor: 'rgba(255, 255, 255, 0.85)',
      bordercolor: '#FFFFFF',
      borderwidth: 2,
      borderpad: 4,
      yshift: yOffset,
      xanchor: 'center',
      yanchor: hasCollision ? 'top' : 'bottom'
    }
  })

  // Preparar datos para el scatter plot
  const scatterData = [{
    x: visibleData.map(d => d.consumo),
    y: visibleData.map(d => d.afinidad),
    mode: 'markers',
    type: 'scatter',
    name: 'Variables',
    marker: {
      size: 18, // Tamaño fijo de burbujas
      color: colorBurbujas,
      opacity: 0.85,
      line: {
        color: '#FFFFFF',
        width: 1.5
      }
    },
    text: visibleData.map(d =>
      `<b>${d.nombre}</b><br>Consumo: ${d.consumo.toFixed(2)}%<br>Afinidad: ${d.afinidad.toFixed(1)}`
    ),
    hovertemplate: '%{text}<extra></extra>',
    showlegend: false
  }]

  // Agregar línea de afinidad si está configurada
  const shapes = lineaAfinidad ? [{
    type: 'line',
    x0: xDomain[0],
    y0: lineaAfinidad,
    x1: xDomain[1],
    y1: lineaAfinidad,
    line: {
      color: '#888888',
      width: 2,
      dash: 'dash'
    }
  }] : []

  // Layout estilo matplotlib
  const layout = {
    plot_bgcolor: colorFondo,
    paper_bgcolor: 'transparent',
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
          size: 16,
          color: '#333333',
          weight: 'bold'
        }
      },
      range: xDomain,
      gridcolor: 'rgba(170, 170, 170, 0.3)',
      gridwidth: 1,
      tickfont: {
        size: 12,
        color: '#666666'
      },
      ticksuffix: '%',
      zeroline: false,
      showline: true,
      linewidth: 1,
      linecolor: '#AAAAAA'
    },
    yaxis: {
      title: {
        text: 'Afinidad',
        font: {
          family: 'Arial, sans-serif',
          size: 16,
          color: '#333333',
          weight: 'bold'
        }
      },
      range: yDomain,
      gridcolor: 'rgba(170, 170, 170, 0.3)',
      gridwidth: 1,
      tickfont: {
        size: 12,
        color: '#666666'
      },
      zeroline: false,
      showline: true,
      linewidth: 1,
      linecolor: '#AAAAAA'
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
    }
  }

  const config = {
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
          config={config}
          style={{ width: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  )
})

AfiniMapChart.displayName = 'AfiniMapChart'

export default AfiniMapChart
