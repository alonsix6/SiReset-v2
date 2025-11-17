import { forwardRef, useState, useEffect, useRef } from 'react'
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
  LabelList,
  Customized
} from 'recharts'

const AfiniMapChart = forwardRef(({
  data,
  targetName,
  colorBurbujas,
  highlightedVariable,
  highlightColor,
  colorTexto,
  colorEjeX,
  colorEjeY,
  lineaAfinidad,
  colorFondo
}, ref) => {
  // Filtrar solo variables visibles
  const visibleData = data.filter(d => d.visible)

  // Estado para almacenar overlaps detectados
  const [connectorLines, setConnectorLines] = useState([])

  // Estado para posiciones manuales de labels
  const [manualPositions, setManualPositions] = useState({})
  const [draggingLabel, setDraggingLabel] = useState(null)
  const svgRef = useRef(null)

  // Detectar burbujas que se solapan y necesitan indicadores
  const detectOverlappingBubbles = () => {
    if (visibleData.length === 0) {
      setConnectorLines([])
      return
    }

    const overlaps = []

    // Revisar todas las parejas de burbujas
    for (let i = 0; i < visibleData.length; i++) {
      for (let j = i + 1; j < visibleData.length; j++) {
        const bubble1 = visibleData[i]
        const bubble2 = visibleData[j]

        // Calcular distancia entre centros
        const dx = bubble2.consumo - bubble1.consumo
        const dy = bubble2.afinidad - bubble1.afinidad
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Estimar radios de las burbujas (aproximación basada en ZAxis range)
        // range es [200, 1200], el radio visual es proporcional a sqrt(tamano)
        const radius1 = Math.sqrt(bubble1.tamano / 1200) * 8
        const radius2 = Math.sqrt(bubble2.tamano / 1200) * 8

        // Solo detectar si REALMENTE se solapan
        if (distance < (radius1 + radius2) * 0.95) {
          overlaps.push({
            nombre1: bubble1.nombre,
            nombre2: bubble2.nombre,
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
  }, [data, visibleData.length, highlightedVariable])

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
            <p className="text-reset-cyan">
              <span className="text-reset-gray-light">Tamaño burbuja:</span>{' '}
              <span className="font-semibold">{data.tamano.toFixed(0)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Calcular posición desplazada para label cuando hay overlap - buscar espacio libre
  const getDisplacedPosition = (punto, centerX, centerY) => {
    // Si hay una posición manual guardada, usarla
    if (manualPositions[punto.nombre]) {
      return {
        x: manualPositions[punto.nombre].x,
        y: manualPositions[punto.nombre].y,
        hasDisplacement: true
      }
    }

    // Buscar si esta burbuja tiene overlaps
    const overlap = connectorLines.find(
      o => o.nombre1 === punto.nombre || o.nombre2 === punto.nombre
    )

    if (!overlap) {
      return { x: 0, y: -20, hasDisplacement: false } // Posición normal (arriba de la burbuja)
    }

    // Probar diferentes ángulos para encontrar el espacio más libre
    const testAngles = [0, 45, 90, 135, 180, 225, 270, 315] // Ángulos en grados
    let bestAngle = 270 // Default arriba
    let maxDistance = 0

    testAngles.forEach(angleDeg => {
      const angleRad = (angleDeg * Math.PI) / 180

      // Calcular posición de prueba en coordenadas de datos
      // Necesitamos escalar apropiadamente para el espacio de datos
      const testX = punto.consumo + Math.cos(angleRad) * 5 // 5% de distancia
      const testY = punto.afinidad + Math.sin(angleRad) * 15 // 15 puntos de afinidad

      // Calcular distancia mínima a otras burbujas desde este punto de prueba
      let minDistToOthers = Infinity
      visibleData.forEach(other => {
        if (other.nombre === punto.nombre) return
        const dx = testX - other.consumo
        const dy = testY - other.afinidad
        const dist = Math.sqrt(dx * dx + dy * dy)
        minDistToOthers = Math.min(minDistToOthers, dist)
      })

      // Este ángulo es mejor si está más lejos de otras burbujas
      if (minDistToOthers > maxDistance) {
        maxDistance = minDistToOthers
        bestAngle = angleRad
      }
    })

    // Usar el mejor ángulo encontrado con mayor desplazamiento
    return {
      x: Math.cos(bestAngle) * 50,
      y: Math.sin(bestAngle) * 50,
      hasDisplacement: true
    }
  }

  // Handlers para drag & drop de labels
  const handleLabelMouseDown = (e, punto) => {
    e.stopPropagation()
    e.preventDefault()
    setDraggingLabel({ nombre: punto.nombre, startX: e.clientX, startY: e.clientY })
  }

  // Agregar listeners globales para el drag
  useEffect(() => {
    if (!draggingLabel) return

    const handleMouseMove = (e) => {
      if (!svgRef.current) return

      const svg = svgRef.current.querySelector('.recharts-surface')
      if (!svg) return

      const punto = visibleData.find(d => d.nombre === draggingLabel.nombre)
      if (!punto) return

      // Calcular desplazamiento desde la posición inicial del drag
      const deltaX = e.clientX - draggingLabel.startX
      const deltaY = e.clientY - draggingLabel.startY

      // Obtener posición actual o usar la base
      const currentPos = manualPositions[draggingLabel.nombre] || { x: 0, y: -20 }

      setManualPositions(prev => ({
        ...prev,
        [draggingLabel.nombre]: {
          x: currentPos.x + deltaX,
          y: currentPos.y + deltaY
        }
      }))

      // Actualizar punto de inicio para el próximo movimiento
      setDraggingLabel({ ...draggingLabel, startX: e.clientX, startY: e.clientY })
    }

    const handleMouseUp = () => {
      setDraggingLabel(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingLabel, manualPositions, visibleData])

  // Custom label para cada punto
  const renderCustomLabel = (props) => {
    const { x, y, index, value, cx, cy, payload } = props

    // Usar cx, cy si están disponibles (coordenadas del centro), sino x, y
    const centerX = cx !== undefined ? cx : x
    const centerY = cy !== undefined ? cy : y

    // Si no hay coordenadas, no renderizar
    if (centerX === undefined || centerY === undefined) {
      return null
    }

    // Obtener el punto de datos
    let punto = payload
    if (!punto) {
      punto = visibleData.find((d) => d.nombre === value)
    }

    if (!punto) {
      return null
    }

    const isHighlighted = punto.nombre === highlightedVariable

    // Calcular desplazamiento (normal o extra si hay overlap)
    const displacement = getDisplacedPosition(punto, centerX, centerY)
    const adjustedX = centerX + displacement.x
    const adjustedY = centerY + displacement.y

    const isDragging = draggingLabel?.nombre === punto.nombre

    return (
      <g>
        {/* Línea conectora si el texto está desplazado por overlap */}
        {displacement.hasDisplacement && (
          <line
            x1={centerX}
            y1={centerY - 20}
            x2={adjustedX}
            y2={adjustedY}
            stroke={isHighlighted ? highlightColor : colorBurbujas}
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
          style={{
            cursor: 'move',
            opacity: isDragging ? 0.5 : 1,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleLabelMouseDown(e, punto)}
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
      const x1 = xScaleFunc(bubble1.consumo)
      const y1 = yScaleFunc(bubble1.afinidad)
      const x2 = xScaleFunc(bubble2.consumo)
      const y2 = yScaleFunc(bubble2.afinidad)

      // Calcular ángulo entre las burbujas
      const dx = x2 - x1
      const dy = y2 - y1
      const angle = Math.atan2(dy, dx)

      // Calcular radio de burbujas en píxeles
      const getRadius = (tamano) => {
        // Normalizar el tamaño dentro del rango [200, 1200]
        const normalized = (tamano - 200) / (1200 - 200)
        // Radio base y máximo
        const minRadius = 20
        const maxRadius = 60
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
            fill={colorBurbujas}
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
            fill={colorBurbujas}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </g>
      )
    })

    return <g className="overlap-markers">{markers}</g>
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

  // Calcular dominio dinámico para los ejes basado en los datos
  const maxConsumo = Math.max(...visibleData.map(d => d.consumo))
  const maxAfinidad = Math.max(...visibleData.map(d => d.afinidad))

  // Redondear hacia arriba con margen
  const xDomain = [0, Math.ceil(maxConsumo / 10) * 10 + 10]
  const yDomain = [0, Math.ceil(maxAfinidad / 50) * 50 + 50]

  return (
    <div ref={ref} className="w-full" style={{ backgroundColor: colorFondo }}>
      {/* Título */}
      <div className="text-center mb-6 pt-6">
        <h2 className="text-2xl font-display text-reset-white mb-2">
          Mapa de Afinidad TGI
        </h2>
        {targetName && (
          <p className="text-reset-cyan text-lg font-semibold">
            Target: {targetName}
          </p>
        )}
        {Object.keys(manualPositions).length > 0 && (
          <button
            onClick={() => setManualPositions({})}
            className="mt-3 px-4 py-2 bg-reset-magenta/20 hover:bg-reset-magenta/30 text-reset-magenta border border-reset-magenta rounded-lg text-sm font-semibold transition-colors"
          >
            Resetear posiciones de textos
          </button>
        )}
      </div>

      {/* Gráfico */}
      <div ref={svgRef} className="pb-6">
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
              dataKey="afinidad"
              name="Afinidad"
              domain={yDomain}
              tickFormatter={(value) => value.toFixed(0)}
              stroke={colorEjeY || '#AAAAAA'}
              tick={{ fill: colorEjeY || '#AAAAAA', fontSize: 14 }}
            >
              <Label
                value="Afinidad"
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
                  fill={entry.nombre === highlightedVariable ? highlightColor : colorBurbujas}
                  stroke="#000000"
                  strokeWidth={entry.nombre === highlightedVariable ? 2 : 1}
                  opacity={entry.nombre === highlightedVariable ? 1 : 0.7}
                />
              ))}
              <LabelList
                dataKey="nombre"
                content={renderCustomLabel}
              />
            </Scatter>

            {/* Marcadores para burbujas que se solapan */}
            <Customized component={OverlapMarkers} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})

AfiniMapChart.displayName = 'AfiniMapChart'

export default AfiniMapChart
