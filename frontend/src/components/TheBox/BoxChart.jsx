import { forwardRef, useState, useEffect } from 'react'
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
  LabelList,
  Customized
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

  // Estado para almacenar overlaps detectados
  const [connectorLines, setConnectorLines] = useState([])

  // Detectar burbujas que se solapan y necesitan indicadores
  const detectOverlappingBubbles = () => {
    const allData = [...dataOnline, ...dataOffline]
    if (allData.length === 0) {
      setConnectorLines([])
      return
    }

    const overlaps = []

    // Revisar todas las parejas de burbujas
    for (let i = 0; i < allData.length; i++) {
      for (let j = i + 1; j < allData.length; j++) {
        const bubble1 = allData[i]
        const bubble2 = allData[j]

        // Calcular distancia entre centros
        const dx = bubble2.CONS - bubble1.CONS
        const dy = bubble2.HC - bubble1.HC
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Estimar radios de las burbujas (aproximación basada en ZAxis range)
        // range es [1500, 5000], el radio visual es proporcional a sqrt(tamano)
        const radius1 = Math.sqrt(bubble1.tamano / 5000) * 0.08
        const radius2 = Math.sqrt(bubble2.tamano / 5000) * 0.08

        // Solo detectar si REALMENTE se solapan (distancia menor que la suma de radios)
        if (distance < (radius1 + radius2) * 0.95) {
          overlaps.push({
            nombre1: bubble1.nombre,
            nombre2: bubble2.nombre,
            CONS1: bubble1.CONS,
            HC1: bubble1.HC,
            CONS2: bubble2.CONS,
            HC2: bubble2.HC,
            bubble1: bubble1,
            bubble2: bubble2
          })
        }
      }
    }

    setConnectorLines(overlaps)
  }

  // Efecto para detectar overlaps cuando cambien los datos
  useEffect(() => {
    detectOverlappingBubbles()
  }, [data, dataOnline.length, dataOffline.length, highlightedMedio])

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

  // Verificar si una burbuja tiene overlaps
  const hasOverlap = (nombreMedio) => {
    return connectorLines.some(
      overlap => overlap.nombre1 === nombreMedio || overlap.nombre2 === nombreMedio
    )
  }

  // Calcular posición desplazada para label cuando hay overlap
  const getDisplacedPosition = (punto, centerX, centerY) => {
    // Buscar si esta burbuja tiene overlaps
    const overlap = connectorLines.find(
      o => o.nombre1 === punto.nombre || o.nombre2 === punto.nombre
    )

    if (!overlap) {
      return { x: 30, y: 35, hasDisplacement: false } // Posición normal
    }

    // Determinar la otra burbuja con la que se solapa
    const isFirst = overlap.nombre1 === punto.nombre
    const otherCONS = isFirst ? overlap.CONS2 : overlap.CONS1
    const otherHC = isFirst ? overlap.HC2 : overlap.HC1

    // Calcular vector de separación (alejarse de la otra burbuja)
    const dx = punto.CONS - otherCONS
    const dy = punto.HC - otherHC
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 0.001) {
      // Si están muy cerca, desplazar hacia arriba
      return { x: 30, y: -40, hasDisplacement: true }
    }

    // Normalizar y escalar el desplazamiento
    const normalX = dx / distance
    const normalY = dy / distance

    // Desplazar más cuando hay overlap
    return {
      x: 30 + normalX * 50,
      y: 35 + normalY * 50,
      hasDisplacement: true
    }
  }

  // Custom label para cada punto - centrado en la burbuja
  const renderCustomLabel = (props) => {
    // LabelList pasa diferentes props según el tipo de chart
    // Para Scatter, tenemos x, y, index, value, cx, cy, etc.
    const { x, y, index, value, cx, cy, payload } = props

    // Usar cx, cy si están disponibles (coordenadas del centro), sino x, y
    const centerX = cx !== undefined ? cx : x
    const centerY = cy !== undefined ? cy : y

    // Si no hay coordenadas, no renderizar
    if (centerX === undefined || centerY === undefined) {
      return null
    }

    // Obtener el punto de datos - puede venir en payload o buscar por value
    let punto = payload
    if (!punto) {
      punto = [...dataOnline, ...dataOffline].find((d) => d.nombre === value)
    }

    if (!punto) {
      return null
    }

    const isHighlighted = punto.nombre === highlightedMedio

    // Calcular desplazamiento (normal o extra si hay overlap)
    const displacement = getDisplacedPosition(punto, centerX, centerY)
    const adjustedX = centerX + displacement.x
    const adjustedY = centerY + displacement.y

    // Color de la burbuja para la línea conectora
    const bubbleColor = punto.tipo === 'online' ? colorOnline : colorOffline

    return (
      <g>
        {/* Línea conectora si el texto está desplazado por overlap */}
        {displacement.hasDisplacement && (
          <line
            x1={centerX + 30}
            y1={centerY + 35}
            x2={adjustedX}
            y2={adjustedY}
            stroke={isHighlighted ? highlightColor : bubbleColor}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.6}
            style={{ pointerEvents: 'none' }}
          />
        )}

        <text
          x={adjustedX}
          y={adjustedY}
          fill={isHighlighted ? highlightColor : (colorTexto || '#FFFFFF')}
          fontSize={isHighlighted ? 13 : 10}
          fontWeight={isHighlighted ? 'bold' : '600'}
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="#000000"
          strokeWidth={0.3}
          paintOrder="stroke"
          style={{ pointerEvents: 'none' }}
        >
          {punto.nombre}
        </text>
      </g>
    )
  }

  // Componente para renderizar marcadores triangulares cuando burbujas se solapan
  const OverlapMarkers = (props) => {
    const { xScale, yScale, xAxisMap, yAxisMap } = props

    // Obtener las escalas correctas
    const xScaleFunc = xScale || (xAxisMap && xAxisMap[0]?.scale)
    const yScaleFunc = yScale || (yAxisMap && yAxisMap[0]?.scale)

    if (!xScaleFunc || !yScaleFunc || connectorLines.length === 0) return null

    const markers = []

    connectorLines.forEach((overlap, index) => {
      const bubble1 = overlap.bubble1
      const bubble2 = overlap.bubble2

      if (!bubble1 || !bubble2) return

      // Convertir coordenadas de datos a píxeles
      const x1 = xScaleFunc(bubble1.CONS)
      const y1 = yScaleFunc(bubble1.HC)
      const x2 = xScaleFunc(bubble2.CONS)
      const y2 = yScaleFunc(bubble2.HC)

      // Calcular ángulo entre las burbujas
      const dx = x2 - x1
      const dy = y2 - y1
      const angle = Math.atan2(dy, dx)

      // Colores de las burbujas
      const color1 = bubble1.tipo === 'online' ? colorOnline : colorOffline
      const color2 = bubble2.tipo === 'online' ? colorOnline : colorOffline

      // Calcular radio de burbujas en píxeles (el ZAxis range es [1500, 5000])
      // Recharts usa sqrt del valor para el radio
      const getRadius = (tamano) => {
        // Normalizar el tamaño dentro del rango [1500, 5000]
        const normalized = (tamano - 1500) / (5000 - 1500)
        // Radio base y máximo (aproximados basados en el comportamiento de Recharts)
        const minRadius = 20
        const maxRadius = 50
        return minRadius + normalized * (maxRadius - minRadius)
      }

      const radius1 = getRadius(bubble1.tamano)
      const radius2 = getRadius(bubble2.tamano)

      // Marcador 1: en el borde de bubble1, lado opuesto a bubble2
      const markerAngle1 = angle + Math.PI
      const markerX1 = x1 + Math.cos(markerAngle1) * (radius1 + 8)
      const markerY1 = y1 + Math.sin(markerAngle1) * (radius1 + 8)

      // Tamaño del triángulo
      const triangleSize = 10

      markers.push(
        <g key={`marker-${index}-1`}>
          {/* Triángulo apuntando hacia la burbuja */}
          <path
            d={`M ${markerX1} ${markerY1}
                L ${markerX1 + Math.cos(markerAngle1 + 2.6) * triangleSize} ${markerY1 + Math.sin(markerAngle1 + 2.6) * triangleSize}
                L ${markerX1 + Math.cos(markerAngle1 - 2.6) * triangleSize} ${markerY1 + Math.sin(markerAngle1 - 2.6) * triangleSize}
                Z`}
            fill={color1}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </g>
      )

      // Marcador 2: en el borde de bubble2, lado opuesto a bubble1
      const markerAngle2 = angle
      const markerX2 = x2 + Math.cos(markerAngle2) * (radius2 + 8)
      const markerY2 = y2 + Math.sin(markerAngle2) * (radius2 + 8)

      markers.push(
        <g key={`marker-${index}-2`}>
          {/* Triángulo apuntando hacia la burbuja */}
          <path
            d={`M ${markerX2} ${markerY2}
                L ${markerX2 + Math.cos(markerAngle2 + 2.6) * triangleSize} ${markerY2 + Math.sin(markerAngle2 + 2.6) * triangleSize}
                L ${markerX2 + Math.cos(markerAngle2 - 2.6) * triangleSize} ${markerY2 + Math.sin(markerAngle2 - 2.6) * triangleSize}
                Z`}
            fill={color2}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </g>
      )
    })

    return <g className="overlap-markers">{markers}</g>
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
          margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
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
            range={[1500, 5000]}
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

          {/* Marcadores para burbujas que se solapan */}
          <Customized component={OverlapMarkers} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada */}
      {renderLegend()}
    </div>
  )
})

BoxChart.displayName = 'BoxChart'

export default BoxChart
