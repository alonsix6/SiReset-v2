import { forwardRef } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
  LabelList
} from 'recharts'

const BoxChart = forwardRef(({
  data,
  targetName,
  colorOnline,
  colorOffline,
  highlightedMedio,
  highlightColor,
  colorTexto,
  colorEjeX,
  colorEjeY,
  meanCONS,
  meanHC
}, ref) => {
  // Separar datos por tipo
  const dataOnline = data.filter(d => d.tipo === 'online' && d.visible)
  const dataOffline = data.filter(d => d.tipo === 'offline' && d.visible)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-reset-black/90 border border-reset-neon p-3 rounded-lg shadow-lg">
          <p className="text-reset-white font-bold mb-2">{data.nombre}</p>
          <div className="space-y-1 text-xs">
            <p className="text-reset-cyan">
              <span className="text-reset-gray-light">Tipo:</span>{' '}
              <span className="font-semibold">{data.tipo}</span>
            </p>
            <p className="text-reset-neon">
              <span className="text-reset-gray-light">Consumo:</span>{' '}
              <span className="font-semibold">{(data.CONS * 100).toFixed(1)}%</span>
            </p>
            <p className="text-reset-purple">
              <span className="text-reset-gray-light">High Consumers:</span>{' '}
              <span className="font-semibold">{(data.HC * 100).toFixed(1)}%</span>
            </p>
            <p className="text-reset-magenta">
              <span className="text-reset-gray-light">Afinidad:</span>{' '}
              <span className="font-semibold">{data.Afinidad.toFixed(1)}</span>
            </p>
            <p className="text-reset-gray-light">
              <span>ATP ({data.tipoATP || 'N/A'}):</span>{' '}
              <span className="font-semibold">{data.ATP.toFixed(2)}</span>
            </p>
            <p className="text-reset-cyan">
              <span className="text-reset-gray-light">Tamaño burbuja:</span>{' '}
              <span className="font-semibold">{data.tamanoRaw.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom label para cada punto - aparece sobre la burbuja
  const renderCustomLabel = (props) => {
    const { x, y, width, height, value, index } = props

    // Obtener el punto de datos correspondiente
    const punto = [...dataOnline, ...dataOffline].find((d, i) => {
      // value contiene el nombre del medio
      return d.nombre === value
    })

    if (!punto) return null

    return (
      <text
        x={x}
        y={y}
        fill={punto.nombre === highlightedMedio ? highlightColor : (colorTexto || '#FFFFFF')}
        fontSize={punto.nombre === highlightedMedio ? 14 : 11}
        fontWeight={punto.nombre === highlightedMedio ? 'bold' : '600'}
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="#000000"
        strokeWidth={0.4}
        paintOrder="stroke"
      >
        {punto.nombre}
      </text>
    )
  }

  // Custom legend - solo muestra tipos de medios activos
  const renderLegend = () => {
    const hasOnline = dataOnline.length > 0
    const hasOffline = dataOffline.length > 0

    // Si no hay medios visibles, no mostrar leyenda
    if (!hasOnline && !hasOffline) return null

    return (
      <div className="flex justify-center gap-6 mt-4">
        {hasOnline && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-1.5 rounded"
              style={{ backgroundColor: colorOnline }}
            />
            <span className="text-reset-white text-sm font-semibold">Online</span>
          </div>
        )}
        {hasOffline && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-1.5 rounded"
              style={{ backgroundColor: colorOffline }}
            />
            <span className="text-reset-white text-sm font-semibold">Offline (ATL)</span>
          </div>
        )}
      </div>
    )
  }

  if (data.length === 0 || data.filter(d => d.visible).length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-reset-gray-light">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-semibold">No hay datos para visualizar</p>
          <p className="text-sm mt-2">Selecciona al menos un medio para ver el gráfico</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="w-full">
      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display text-reset-white mb-2">
          Consumo vs High Consumers
        </h2>
        {targetName && (
          <p className="text-reset-cyan text-lg font-semibold">
            {targetName}
          </p>
        )}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={600}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(170, 170, 170, 0.2)"
          />

          <XAxis
            type="number"
            dataKey="CONS"
            name="Consumo"
            domain={[0, 0.7]}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            stroke={colorEjeX || '#AAAAAA'}
            tick={{ fill: colorEjeX || '#AAAAAA', fontSize: 14 }}
          >
            <Label
              value="Consumo (%)"
              position="bottom"
              offset={40}
              style={{ fill: colorEjeX || '#AAAAAA', fontSize: 16, fontWeight: 'bold' }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="HC"
            name="High Consumers"
            domain={[0, 0.5]}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            stroke={colorEjeY || '#AAAAAA'}
            tick={{ fill: colorEjeY || '#AAAAAA', fontSize: 14 }}
          >
            <Label
              value="High Consumers (%)"
              angle={-90}
              position="left"
              offset={40}
              style={{ fill: colorEjeY || '#AAAAAA', fontSize: 16, fontWeight: 'bold' }}
            />
          </YAxis>

          <ZAxis
            type="number"
            dataKey="tamano"
            range={[200, 1200]}
            name="Tamaño"
          />

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

          {/* Líneas de media */}
          {meanCONS && (
            <ReferenceLine
              x={meanCONS}
              stroke="#888888"
              strokeDasharray="5 5"
              strokeWidth={1}
              opacity={0.5}
            />
          )}
          {meanHC && (
            <ReferenceLine
              y={meanHC}
              stroke="#888888"
              strokeDasharray="5 5"
              strokeWidth={1}
              opacity={0.5}
            />
          )}

          {/* Scatter Online */}
          {dataOnline.length > 0 && (
            <Scatter
              name="Online"
              data={dataOnline}
              fill={colorOnline}
            >
              {dataOnline.map((entry, index) => (
                <Cell
                  key={`cell-online-${index}`}
                  fill={entry.nombre === highlightedMedio ? highlightColor : colorOnline}
                  stroke="#000000"
                  strokeWidth={entry.nombre === highlightedMedio ? 2 : 1}
                  opacity={entry.nombre === highlightedMedio ? 1 : 0.7}
                />
              ))}
              <LabelList
                dataKey="nombre"
                content={renderCustomLabel}
              />
            </Scatter>
          )}

          {/* Scatter Offline */}
          {dataOffline.length > 0 && (
            <Scatter
              name="Offline"
              data={dataOffline}
              fill={colorOffline}
            >
              {dataOffline.map((entry, index) => (
                <Cell
                  key={`cell-offline-${index}`}
                  fill={entry.nombre === highlightedMedio ? highlightColor : colorOffline}
                  stroke="#000000"
                  strokeWidth={entry.nombre === highlightedMedio ? 2 : 1}
                  opacity={entry.nombre === highlightedMedio ? 1 : 0.7}
                />
              ))}
              <LabelList
                dataKey="nombre"
                content={renderCustomLabel}
              />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada */}
      {renderLegend()}
    </div>
  )
})

BoxChart.displayName = 'BoxChart'

export default BoxChart
