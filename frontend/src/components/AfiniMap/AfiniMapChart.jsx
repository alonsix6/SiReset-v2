import { forwardRef } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
  LabelList
} from 'recharts'

const AfiniMapChart = forwardRef(({
  data,
  targetName,
  colorBurbujas,
  colorFondo,
  lineaAfinidad
}, ref) => {
  // Filtrar solo visibles
  const visibleData = data.filter(d => d.visible)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-reset-black/90 border border-reset-neon p-3 rounded-lg shadow-lg">
          <p className="text-reset-white font-bold mb-2">{data.nombre}</p>
          <div className="space-y-1 text-xs">
            <p className="text-reset-neon">
              <span className="text-reset-gray-light">Consumo:</span>{' '}
              <span className="font-semibold">{data.consumo.toFixed(2)}%</span>
            </p>
            <p className="text-reset-magenta">
              <span className="text-reset-gray-light">Afinidad:</span>{' '}
              <span className="font-semibold">{data.afinidad.toFixed(1)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Helper: Verificar si hay colisión con otras burbujas
  const checkCollision = (x, y, currentIndex, threshold = 35) => {
    // Verificar si la posición (x, y) está muy cerca de otra burbuja
    for (let i = 0; i < visibleData.length; i++) {
      if (i === currentIndex) continue

      const other = visibleData[i]
      const dx = Math.abs(other.consumo - visibleData[currentIndex].consumo)
      const dy = Math.abs(other.afinidad - visibleData[currentIndex].afinidad)

      // Normalizar usando los rangos del dominio
      const consumoRange = xDomain[1] - xDomain[0]
      const afinidadRange = yDomain[1] - yDomain[0]

      const normalizedDx = (dx / consumoRange) * 100
      const normalizedDy = (dy / afinidadRange) * 100

      // Si está cerca arriba, hay colisión
      if (normalizedDx < 8 && normalizedDy > 0 && normalizedDy < 12) {
        return true
      }
    }
    return false
  }

  // Custom label con fondo blanco
  const renderCustomLabel = (props) => {
    const { x, y, index, value, cx, cy, payload } = props

    const centerX = cx !== undefined ? cx : x
    const centerY = cy !== undefined ? cy : y

    if (centerX === undefined || centerY === undefined) {
      return null
    }

    let punto = payload
    if (!punto) {
      punto = visibleData.find((d) => d.nombre === value)
    }

    if (!punto) {
      return null
    }

    // Verificar colisión - si hay colisión, poner abajo
    const hasCollision = checkCollision(centerX, centerY, index)

    // Posición más pegada a la burbuja
    const labelX = centerX
    const labelY = hasCollision ? centerY + 25 : centerY - 12

    return (
      <text
        x={labelX}
        y={labelY}
        fill="#000000"
        fontSize={9}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <tspan
          x={labelX}
          dy="0"
          style={{
            fill: '#000000',
            paintOrder: 'stroke',
            stroke: '#FFFFFF',
            strokeWidth: 3,
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }}
        >
          {punto.nombre}
        </tspan>
      </text>
    )
  }

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

  // Tamaño fijo para todas las burbujas (no calculado)
  const TAMANO_FIJO = 650

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

      {/* Gráfico */}
      <div className="pb-4">
        <ResponsiveContainer width="100%" height={600} style={{ backgroundColor: colorFondo }}>
          <ScatterChart
            margin={{ top: 80, right: 80, bottom: 80, left: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(170, 170, 170, 0.2)"
            />

            <XAxis
              type="number"
              dataKey="consumo"
              name="Consumo"
              domain={xDomain}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 14 }}
            >
              <Label
                value="Consumo (%)"
                position="bottom"
                offset={15}
                style={{ fill: '#AAAAAA', fontSize: 16, fontWeight: 'bold' }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="afinidad"
              name="Afinidad"
              domain={yDomain}
              tickFormatter={(value) => value.toFixed(0)}
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 14 }}
            >
              <Label
                value="Afinidad"
                angle={-90}
                position="left"
                offset={15}
                style={{ fill: '#AAAAAA', fontSize: 16, fontWeight: 'bold' }}
              />
            </YAxis>

            <ZAxis
              type="number"
              range={[TAMANO_FIJO, TAMANO_FIJO]}
              name="Tamaño"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Línea de afinidad de referencia */}
            {lineaAfinidad && (
              <ReferenceLine
                y={lineaAfinidad}
                stroke="#888888"
                strokeDasharray="5 5"
                strokeWidth={2}
                opacity={0.7}
              >
                <Label
                  value={`Afinidad ${lineaAfinidad}`}
                  position="right"
                  style={{ fill: '#888888', fontSize: 12, fontWeight: 'bold' }}
                />
              </ReferenceLine>
            )}

            {/* Scatter de variables */}
            <Scatter
              name="Variables"
              data={visibleData}
              fill={colorBurbujas}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorBurbujas}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  opacity={0.85}
                />
              ))}
              <LabelList
                dataKey="nombre"
                content={renderCustomLabel}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

AfiniMapChart.displayName = 'AfiniMapChart'

export default AfiniMapChart
