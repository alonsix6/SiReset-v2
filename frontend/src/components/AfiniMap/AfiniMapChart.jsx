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

    // Posición arriba de la burbuja
    const labelX = centerX
    const labelY = centerY - 20

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

  // Calcular dominio dinámico
  const maxConsumo = Math.max(...visibleData.map(d => d.consumo))
  const maxAfinidad = Math.max(...visibleData.map(d => d.afinidad))

  const xDomain = [0, Math.ceil(maxConsumo / 10) * 10 + 10]
  const yDomain = [0, Math.ceil(maxAfinidad / 50) * 50 + 50]

  // Normalizar tamaños [200-1200]
  const consumos = visibleData.map(d => d.consumo)
  const minConsumo = Math.min(...consumos)
  const maxConsumoNorm = Math.max(...consumos)

  const dataConTamano = visibleData.map(d => ({
    ...d,
    tamano: ((d.consumo - minConsumo) / (maxConsumoNorm - minConsumo)) * 1000 + 200
  }))

  return (
    <div ref={ref} className="w-full" style={{ backgroundColor: colorFondo }}>
      {/* Título */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-display text-reset-white mb-2">
          Mapa de Afinidad TGI
        </h2>
        {targetName && (
          <p className="text-reset-cyan text-lg font-semibold">
            Target: {targetName}
          </p>
        )}
      </div>

      {/* Gráfico */}
      <div className="pb-6">
        <ResponsiveContainer width="100%" height={600}>
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
                offset={40}
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
                offset={40}
                style={{ fill: '#AAAAAA', fontSize: 16, fontWeight: 'bold' }}
              />
            </YAxis>

            <ZAxis
              type="number"
              dataKey="tamano"
              range={[200, 1200]}
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
              data={dataConTamano}
              fill={colorBurbujas}
            >
              {dataConTamano.map((entry, index) => (
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
