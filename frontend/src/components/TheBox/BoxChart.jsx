import { forwardRef, useState, useEffect, useRef } from 'react'
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

  // Estado para almacenar posiciones de labels y líneas conectoras
  const [labelPositions, setLabelPositions] = useState({})
  const [connectorLines, setConnectorLines] = useState([])
  const chartRef = useRef(null)

  // Función para calcular el ancho aproximado del texto
  const getTextWidth = (text, fontSize) => {
    // Aproximación: cada caracter ocupa ~0.6 * fontSize en ancho
    return text.length * fontSize * 0.6
  }

  // Función para detectar si dos rectángulos se solapan
  const checkOverlap = (rect1, rect2, padding = 5) => {
    return !(
      rect1.right + padding < rect2.left ||
      rect1.left - padding > rect2.right ||
      rect1.bottom + padding < rect2.top ||
      rect1.top - padding > rect2.bottom
    )
  }

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
        const radius1 = Math.sqrt(bubble1.tamano / 5000) * 0.08 // Factor ajustado para el dominio
        const radius2 = Math.sqrt(bubble2.tamano / 5000) * 0.08

        // Si las burbujas se solapan o están muy cerca
        if (distance < (radius1 + radius2) * 1.2) {
          overlaps.push({
            nombre1: bubble1.nombre,
            nombre2: bubble2.nombre,
            CONS1: bubble1.CONS,
            HC1: bubble1.HC,
            CONS2: bubble2.CONS,
            HC2: bubble2.HC
          })
        }
      }
    }

    // Por ahora, solo marcamos las burbujas que tienen overlaps
    // No creamos líneas conectoras aún (implementación simplificada)
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
  const getDisplacedPosition = (punto) => {
    // Buscar si esta burbuja tiene overlaps
    const overlap = connectorLines.find(
      o => o.nombre1 === punto.nombre || o.nombre2 === punto.nombre
    )

    if (!overlap) {
      return { x: 0, y: 0 } // Sin desplazamiento
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
      return { x: 0, y: -25 }
    }

    // Normalizar y escalar el desplazamiento
    const normalX = dx / distance
    const normalY = dy / distance

    // Desplazar en píxeles (aproximado)
    return {
      x: normalX * 35,
      y: normalY * 35
    }
  }

  // Custom label para cada punto - centrado por defecto, desplazado si hay overlap
  const renderCustomLabel = (props) => {
    const { x, y, value, cx, cy, payload } = props

    // Usar cx, cy si están disponibles (coordenadas del centro), sino x, y
    let centerX = cx !== undefined ? cx : x
    let centerY = cy !== undefined ? cy : y

    // Si no hay coordenadas, no renderizar
    if (centerX === undefined || centerY === undefined) {
      return null
    }

    // Obtener el punto de datos
    let punto = payload
    if (!punto) {
      punto = [...dataOnline, ...dataOffline].find((d) => d.nombre === value)
    }

    if (!punto) {
      return null
    }

    const isHighlighted = punto.nombre === highlightedMedio
    const hasOverlapping = hasOverlap(punto.nombre)

    // Calcular desplazamiento si hay overlap
    const displacement = hasOverlapping ? getDisplacedPosition(punto) : { x: 0, y: 0 }

    const fontSize = isHighlighted ? 13 : 10
    const strokeWidth = 0.3

    // Color de la burbuja para la línea conectora
    const bubbleColor = punto.tipo === 'online' ? colorOnline : colorOffline

    return (
      <g>
        {/* Línea conectora si el texto está desplazado */}
        {hasOverlapping && (
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + displacement.x}
            y2={centerY + displacement.y}
            stroke={isHighlighted ? highlightColor : bubbleColor}
            strokeWidth={1.5}
            strokeDasharray="3,3"
            opacity={0.7}
            style={{ pointerEvents: 'none' }}
          />
        )}

        <text
          x={centerX + displacement.x}
          y={centerY + displacement.y}
          fill={isHighlighted ? highlightColor : (colorTexto || '#FFFFFF')}
          fontSize={fontSize}
          fontWeight={isHighlighted ? 'bold' : '600'}
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="#000000"
          strokeWidth={strokeWidth}
          paintOrder="stroke"
          style={{ pointerEvents: 'none' }}
        >
          {punto.nombre}
        </text>
      </g>
    )
  }

  // Componente para renderizar marcadores triangulares con las escalas del chart
  const OverlapMarkers = ({ xScale, yScale }) => {
    if (!xScale || !yScale || connectorLines.length === 0) return null

    const markers = []
    const processedBubbles = new Set()
    const allData = [...dataOnline, ...dataOffline]

    connectorLines.forEach((overlap, index) => {
      // Obtener datos de ambas burbujas
      const bubble1 = allData.find(m => m.nombre === overlap.nombre1)
      const bubble2 = allData.find(m => m.nombre === overlap.nombre2)

      if (!bubble1 || !bubble2) return

      // Convertir coordenadas de datos a píxeles
      const x1 = xScale(bubble1.CONS)
      const y1 = yScale(bubble1.HC)
      const x2 = xScale(bubble2.CONS)
      const y2 = yScale(bubble2.HC)

      // Calcular ángulo entre las burbujas en coordenadas de píxeles
      const dx = x2 - x1
      const dy = y2 - y1
      const angle = Math.atan2(dy, dx)

      // Colores de las burbujas
      const color1 = bubble1.tipo === 'online' ? colorOnline : colorOffline
      const color2 = bubble2.tipo === 'online' ? colorOnline : colorOffline

      // Radio aproximado de las burbujas en píxeles (basado en el tamaño)
      const radius1 = Math.sqrt(bubble1.tamano / Math.PI) * 0.8
      const radius2 = Math.sqrt(bubble2.tamano / Math.PI) * 0.8

      // Solo agregar marcador si no lo hemos procesado
      if (!processedBubbles.has(bubble1.nombre)) {
        // Posición del marcador en el borde de la burbuja 1 (opuesto a burbuja 2)
        const markerAngle = angle + Math.PI // Opuesto
        const markerX = x1 + Math.cos(markerAngle) * radius1 * 1.15
        const markerY = y1 + Math.sin(markerAngle) * radius1 * 1.15

        // Tamaño del triángulo
        const triangleSize = 8

        markers.push(
          <g key={`marker-${index}-1`}>
            {/* Triángulo apuntando hacia la burbuja */}
            <path
              d={`M ${markerX} ${markerY}
                  L ${markerX + Math.cos(markerAngle + 2.6) * triangleSize} ${markerY + Math.sin(markerAngle + 2.6) * triangleSize}
                  L ${markerX + Math.cos(markerAngle - 2.6) * triangleSize} ${markerY + Math.sin(markerAngle - 2.6) * triangleSize}
                  Z`}
              fill={color1}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              opacity={0.95}
            />
          </g>
        )
        processedBubbles.add(bubble1.nombre)
      }

      if (!processedBubbles.has(bubble2.nombre)) {
        // Posición del marcador en el borde de la burbuja 2 (opuesto a burbuja 1)
        const markerAngle = angle // Apunta hacia burbuja 1
        const markerX = x2 + Math.cos(markerAngle) * radius2 * 1.15
        const markerY = y2 + Math.sin(markerAngle) * radius2 * 1.15

        // Tamaño del triángulo
        const triangleSize = 8

        markers.push(
          <g key={`marker-${index}-2`}>
            {/* Triángulo apuntando hacia la burbuja */}
            <path
              d={`M ${markerX} ${markerY}
                  L ${markerX + Math.cos(markerAngle + 2.6) * triangleSize} ${markerY + Math.sin(markerAngle + 2.6) * triangleSize}
                  L ${markerX + Math.cos(markerAngle - 2.6) * triangleSize} ${markerY + Math.sin(markerAngle - 2.6) * triangleSize}
                  Z`}
              fill={color2}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              opacity={0.95}
            />
          </g>
        )
        processedBubbles.add(bubble2.nombre)
      }
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
