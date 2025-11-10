import { forwardRef } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label
} from 'recharts'

const BoxChart = forwardRef(({
  data,
  targetName,
  colorOnline,
  colorOffline,
  highlightedMedio,
  highlightColor,
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
              <span>ATP:</span>{' '}
              <span className="font-semibold">{(data.ATP * 100).toFixed(2)}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom label para cada punto
  const renderLabel = (props) => {
    const { x, y, payload } = props
    return (
      <text
        x={x}
        y={y - 10}
        fill={payload.nombre === highlightedMedio ? highlightColor : '#FFFFFF'}
        fontSize={payload.nombre === highlightedMedio ? 14 : 12}
        fontWeight={payload.nombre === highlightedMedio ? 'bold' : 'normal'}
        textAnchor="middle"
      >
        {payload.nombre}
      </text>
    )
  }

  // Custom legend
  const renderLegend = () => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1.5 rounded"
            style={{ backgroundColor: colorOnline }}
          />
          <span className="text-reset-white text-sm font-semibold">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1.5 rounded"
            style={{ backgroundColor: colorOffline }}
          />
          <span className="text-reset-white text-sm font-semibold">Offline (ATL)</span>
        </div>
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
            stroke="#AAAAAA"
            tick={{ fill: '#AAAAAA', fontSize: 14 }}
          >
            <Label
              value="Consumo (%)"
              position="bottom"
              offset={40}
              style={{ fill: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="HC"
            name="High Consumers"
            domain={[0, 0.5]}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            stroke="#AAAAAA"
            tick={{ fill: '#AAAAAA', fontSize: 14 }}
          >
            <Label
              value="High Consumers (%)"
              angle={-90}
              position="left"
              offset={40}
              style={{ fill: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            />
          </YAxis>

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
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada */}
      {renderLegend()}

      {/* Labels de medios */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={60}>
          <ScatterChart
            margin={{ top: 0, right: 20, bottom: 0, left: 60 }}
          >
            <XAxis
              type="number"
              dataKey="CONS"
              domain={[0, 0.7]}
              hide
            />
            <YAxis
              type="number"
              dataKey="HC"
              domain={[0, 0.5]}
              hide
            />
            <Scatter
              data={data.filter(d => d.visible)}
              shape={renderLabel}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

BoxChart.displayName = 'BoxChart'

export default BoxChart
