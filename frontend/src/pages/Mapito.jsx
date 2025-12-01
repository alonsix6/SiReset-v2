import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toCanvas } from 'html-to-image'

// Componente para ajustar el zoom del mapa
function FitBounds({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])

  return null
}

// Función utilitaria para recortar canvas (fuera del componente para reutilización)
const cropCanvas = (sourceCanvas) => {
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true })
  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
  const pixels = imageData.data

  let minX = sourceCanvas.width
  let minY = sourceCanvas.height
  let maxX = 0
  let maxY = 0

  // Encontrar los límites del contenido no transparente
  for (let y = 0; y < sourceCanvas.height; y++) {
    for (let x = 0; x < sourceCanvas.width; x++) {
      const index = (y * sourceCanvas.width + x) * 4
      const alpha = pixels[index + 3]

      // Detectar píxeles no transparentes
      if (alpha > 10) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // Agregar margen de seguridad
  const margin = 20
  minX = Math.max(0, minX - margin)
  minY = Math.max(0, minY - margin)
  maxX = Math.min(sourceCanvas.width - 1, maxX + margin)
  maxY = Math.min(sourceCanvas.height - 1, maxY + margin)

  const croppedWidth = maxX - minX + 1
  const croppedHeight = maxY - minY + 1

  // Crear nuevo canvas con el tamaño recortado
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = croppedWidth
  croppedCanvas.height = croppedHeight
  const croppedCtx = croppedCanvas.getContext('2d')

  // Copiar la región recortada
  croppedCtx.drawImage(
    sourceCanvas,
    minX, minY, croppedWidth, croppedHeight,
    0, 0, croppedWidth, croppedHeight
  )

  return croppedCanvas
}

export default function Mapito({ user }) {
  // Estado del mapa
  const [nivel, setNivel] = useState('regiones')
  const [geoData, setGeoData] = useState(null)
  const [selectedRegions, setSelectedRegions] = useState([])
  const [availableRegions, setAvailableRegions] = useState([])
  const [availableProvinces, setAvailableProvinces] = useState([])
  const [selectedProvinces, setSelectedProvinces] = useState([])
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState('')

  // Estado de colores y estilos
  const [colorGeneral, setColorGeneral] = useState('#713030')
  const [colorSelected, setColorSelected] = useState('#5F48C6')
  const [colorBorder, setColorBorder] = useState('#000000')
  const [grosorBorde, setGrosorBorde] = useState(0.8)
  const [showBorders, setShowBorders] = useState(true)
  const [showBasemap, setShowBasemap] = useState(true)
  const [includeContext, setIncludeContext] = useState(false)  // Incluir mapa completo para contexto
  const [showExportMenu, setShowExportMenu] = useState(false)  // Controlar dropdown de exportar
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)  // Feedback visual de copiado

  // Refs
  const mapRef = useRef(null)
  const copyFeedbackTimeoutRef = useRef(null)

  // Bounds para fitBounds
  const [mapBounds, setMapBounds] = useState(null)

  // Cargar datos GeoJSON según el nivel
  useEffect(() => {
    loadGeoData()
  }, [nivel, selectedProvinces])

  // Cargar lista de regiones disponibles
  useEffect(() => {
    fetch('/data/gadm41_PER_1.json')
      .then(res => res.json())
      .then(data => {
        const regions = data.features.map(f => f.properties.NAME_1).sort()
        setAvailableRegions(regions)
      })
      .catch(err => console.error('Error cargando regiones:', err))
  }, [])

  // Cargar provincias cuando se selecciona una región
  useEffect(() => {
    if (selectedRegions.length > 0 && (nivel === 'provincias' || nivel === 'distritos')) {
      fetch('/data/gadm41_PER_2.json')
        .then(res => res.json())
        .then(data => {
          const provinces = data.features
            .filter(f => selectedRegions.includes(f.properties.NAME_1))
            .map(f => ({
              name: f.properties.NAME_2,
              region: f.properties.NAME_1
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
          setAvailableProvinces(provinces)
        })
        .catch(err => console.error('Error cargando provincias:', err))
    } else {
      setAvailableProvinces([])
    }
  }, [selectedRegions, nivel])

  // Cargar distritos cuando se seleccionan provincias
  useEffect(() => {
    if (selectedProvinces.length > 0 && nivel === 'distritos') {
      fetch('/data/gadm41_PER_3.json')
        .then(res => res.json())
        .then(data => {
          const districts = data.features
            .filter(f => selectedProvinces.some(p =>
              p.region === f.properties.NAME_1 && p.name === f.properties.NAME_2
            ))
            .map(f => ({
              name: f.properties.NAME_3,
              province: f.properties.NAME_2,
              region: f.properties.NAME_1
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
          setAvailableDistricts(districts)
        })
        .catch(err => console.error('Error cargando distritos:', err))
    } else {
      setAvailableDistricts([])
    }
  }, [selectedProvinces, nivel])

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-dropdown-container')) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Cleanup de timeout de feedback al desmontar
  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current)
      }
    }
  }, [])

  const loadGeoData = async () => {
    setLoading(true)
    setError(null)

    try {
      let filename
      let data

      switch (nivel) {
        case 'regiones':
          filename = 'gadm41_PER_1.json'
          break
        case 'provincias':
          filename = 'gadm41_PER_2.json'
          break
        case 'distritos':
          // Solo cargar distritos de las provincias seleccionadas
          if (selectedProvinces.length === 0) {
            setGeoData(null)
            setLoading(false)
            return
          }
          filename = 'gadm41_PER_3.json'
          break
        default:
          filename = 'gadm41_PER_1.json'
      }

      const response = await fetch(`/data/${filename}`)
      if (!response.ok) throw new Error('Error cargando datos del mapa')

      data = await response.json()

      // Filtrar distritos solo de las provincias seleccionadas
      if (nivel === 'distritos' && selectedProvinces.length > 0) {
        data.features = data.features.filter(f =>
          selectedProvinces.some(p =>
            p.region === f.properties.NAME_1 && p.name === f.properties.NAME_2
          )
        )
      }

      setGeoData(data)

      // Calcular bounds solo de las áreas seleccionadas o todas
      calculateBounds(data)

    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateBounds = (data) => {
    if (!data || data.features.length === 0) return

    const allCoords = []
    data.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          allCoords.push([coord[1], coord[0]]) // Leaflet usa [lat, lng]
        })
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            allCoords.push([coord[1], coord[0]])
          })
        })
      }
    })

    if (allCoords.length > 0) {
      const lats = allCoords.map(c => c[0])
      const lngs = allCoords.map(c => c[1])
      setMapBounds([
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ])
    }
  }

  // Función para determinar si un feature está seleccionado
  const isSelected = (feature) => {
    const props = feature.properties

    switch (nivel) {
      case 'regiones':
        return selectedRegions.includes(props.NAME_1)
      case 'provincias':
        return selectedProvinces.some(p =>
          p.region === props.NAME_1 && p.name === props.NAME_2
        )
      case 'distritos':
        return selectedDistricts.some(d =>
          d.region === props.NAME_1 &&
          d.province === props.NAME_2 &&
          d.name === props.NAME_3
        )
      default:
        return false
    }
  }

  // Estilo de cada feature
  const getFeatureStyle = (feature) => {
    const selected = isSelected(feature)
    return {
      fillColor: selected ? colorSelected : colorGeneral,
      fillOpacity: selected ? 0.95 : 0.85,
      color: showBorders ? colorBorder : (selected ? colorSelected : colorGeneral),
      weight: showBorders ? grosorBorde : 0,
    }
  }

  // Handler para cada feature
  const onEachFeature = (feature, layer) => {
    const props = feature.properties
    let tooltipContent = ''

    if (props.NAME_1) tooltipContent += `<strong>Región:</strong> ${props.NAME_1}<br/>`
    if (props.NAME_2) tooltipContent += `<strong>Provincia:</strong> ${props.NAME_2}<br/>`
    if (props.NAME_3) tooltipContent += `<strong>Distrito:</strong> ${props.NAME_3}`

    if (tooltipContent) {
      layer.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'custom-tooltip'
      })
    }

    // Click handler para seleccionar/deseleccionar
    layer.on('click', () => {
      if (nivel === 'regiones') {
        const regionName = props.NAME_1
        setSelectedRegions(prev =>
          prev.includes(regionName)
            ? prev.filter(r => r !== regionName)
            : [...prev, regionName]
        )
      } else if (nivel === 'provincias') {
        const province = { region: props.NAME_1, name: props.NAME_2 }
        setSelectedProvinces(prev => {
          const exists = prev.some(p => p.region === province.region && p.name === province.name)
          return exists
            ? prev.filter(p => !(p.region === province.region && p.name === province.name))
            : [...prev, province]
        })
      } else if (nivel === 'distritos') {
        const district = { region: props.NAME_1, province: props.NAME_2, name: props.NAME_3 }
        setSelectedDistricts(prev => {
          const exists = prev.some(d =>
            d.region === district.region &&
            d.province === district.province &&
            d.name === district.name
          )
          return exists
            ? prev.filter(d => !(
                d.region === district.region &&
                d.province === district.province &&
                d.name === district.name
              ))
            : [...prev, district]
        })
      }
    })

    // Hover effects
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: grosorBorde + 1,
        fillOpacity: 1
      })
    })

    layer.on('mouseout', () => {
      layer.setStyle(getFeatureStyle(feature))
    })
  }

  /**
   * Función compartida para generar imagen del mapa
   * NOTA: No incluye tiles del mapa base para evitar problemas CORS
   * El mapa base se ve en la previsualización pero la exportación es solo polígonos
   */
  const generateMapImage = async () => {
    // Validación inicial
    if (!geoData) {
      throw new Error('No hay datos del mapa cargados')
    }

    const selectedFeatures = geoData.features.filter(f => isSelected(f))
    if (selectedFeatures.length === 0) {
      throw new Error('Por favor selecciona al menos un área para exportar')
    }

    // Crear datos solo con features seleccionados
    const selectedData = {
      type: 'FeatureCollection',
      features: selectedFeatures
    }

    // Calcular bounds para determinar tamaño óptimo del canvas
    const selectedGeoJson = L.geoJSON(selectedData)
    const boundsSource = includeContext ? L.geoJSON(geoData) : selectedGeoJson
    const bounds = boundsSource.getBounds()
    const southwest = bounds.getSouthWest()
    const northeast = bounds.getNorthEast()

    console.log('📏 Calculando canvas basado en:', includeContext ? 'TODO Perú (contexto completo)' : 'Solo selección')

    // Calcular dimensiones aproximadas en grados
    const latDiff = Math.abs(northeast.lat - southwest.lat)
    const lngDiff = Math.abs(northeast.lng - southwest.lng)

    // Determinar orientación y tamaño base
    const aspectRatio = lngDiff / latDiff
    let canvasWidth, canvasHeight

    // Base de 2000px para el lado más largo (reducido para mejor rendimiento)
    const baseSize = 2000
    const safetyMargin = 1.4

    if (aspectRatio > 1) {
      canvasWidth = Math.round(baseSize * aspectRatio * safetyMargin)
      canvasHeight = Math.round(baseSize * safetyMargin)
    } else {
      canvasHeight = Math.round(baseSize * safetyMargin)
      canvasWidth = Math.round(baseSize * aspectRatio * safetyMargin)
    }

    // Asegurar mínimo de 1000px y máximo de 4000px
    canvasWidth = Math.max(1000, Math.min(4000, canvasWidth))
    canvasHeight = Math.max(1000, Math.min(4000, canvasHeight))

    console.log('📐 Tamaño del canvas:', { width: canvasWidth, height: canvasHeight })

    let tempDiv = null
    let tempMap = null
    let cleanupFunctions = []

    try {
      // Paso 1: Crear contenedor (10%)
      setExportProgress(10)
      setExportStatus('Preparando canvas...')

      tempDiv = document.createElement('div')
      tempDiv.id = `mapito-export-${Date.now()}`
      tempDiv.style.width = `${canvasWidth}px`
      tempDiv.style.height = `${canvasHeight}px`
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '0'
      tempDiv.style.top = '0'
      tempDiv.style.opacity = '0.01'
      tempDiv.style.zIndex = '-9999'
      // Fondo blanco si showBasemap, transparente si no
      tempDiv.style.backgroundColor = showBasemap ? '#f8f9fa' : 'transparent'
      tempDiv.style.pointerEvents = 'none'
      tempDiv.style.overflow = 'hidden'

      document.body.appendChild(tempDiv)
      cleanupFunctions.push(() => {
        if (tempDiv && tempDiv.parentNode) {
          document.body.removeChild(tempDiv)
        }
      })

      // Paso 2: Crear mapa (30%)
      setExportProgress(30)
      setExportStatus('Inicializando mapa...')

      // Usar SVG (preferCanvas: false) - más confiable para captura sin tiles
      tempMap = L.map(tempDiv.id, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: false  // SVG es más confiable sin tiles
      }).setView([-9.2, -75.0], 5)

      cleanupFunctions.push(() => {
        if (tempMap) {
          try {
            tempMap.off()
            tempMap.remove()
          } catch (e) {
            console.error('Error limpiando mapa:', e)
          }
        }
      })

      tempMap.invalidateSize()

      const leafletContainer = tempMap.getContainer()
      if (!leafletContainer) {
        throw new Error('Leaflet.getContainer() devolvió null')
      }

      // Establecer fondo del contenedor
      leafletContainer.style.backgroundColor = showBasemap ? '#f8f9fa' : 'transparent'

      // NO agregamos TileLayer - esto evita completamente el problema CORS
      // El mapa base solo se ve en la previsualización

      // Paso 3: Agregar GeoJSON (50%)
      setExportProgress(50)
      setExportStatus('Renderizando áreas...')

      const dataToRender = includeContext ? geoData : selectedData

      L.geoJSON(dataToRender, {
        style: (feature) => {
          if (includeContext) {
            const selected = isSelected(feature)
            return {
              fillColor: selected ? colorSelected : colorGeneral,
              fillOpacity: selected ? 0.95 : 0.85,
              color: showBorders ? colorBorder : (selected ? colorSelected : colorGeneral),
              weight: showBorders ? grosorBorde : 0
            }
          } else {
            return {
              fillColor: colorSelected,
              fillOpacity: 0.95,
              color: showBorders ? colorBorder : colorSelected,
              weight: showBorders ? grosorBorde : 0
            }
          }
        }
      }).addTo(tempMap)

      // Paso 4: Ajustar bounds (70%)
      setExportProgress(70)
      setExportStatus('Ajustando vista...')

      const fitBoundsSource = includeContext ? L.geoJSON(geoData) : L.geoJSON(selectedData)
      const fitBounds = fitBoundsSource.getBounds()

      tempMap.fitBounds(fitBounds, {
        padding: [150, 150],
        maxZoom: 18
      })

      tempMap.invalidateSize()

      // Paso 5: Esperar renderizado (80%)
      setExportProgress(80)
      setExportStatus('Esperando renderizado...')

      // Dar tiempo para que SVG se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      tempMap.invalidateSize()

      // Paso 6: Capturar imagen (90%)
      setExportProgress(90)
      setExportStatus('Capturando imagen...')

      const containerToCapture = tempMap.getContainer()
      if (!containerToCapture) {
        throw new Error('El contenedor desapareció')
      }

      console.log('📸 Capturando:', {
        width: containerToCapture.offsetWidth,
        height: containerToCapture.offsetHeight
      })

      // Capturar con toCanvas - ahora sin tiles no hay problema CORS
      const canvas = await toCanvas(containerToCapture, {
        quality: 1.0,
        pixelRatio: 2,  // Mayor resolución
        backgroundColor: showBasemap ? '#f8f9fa' : null,
        cacheBust: true,
        skipFonts: true,
        width: canvasWidth,
        height: canvasHeight
      })

      console.log('🎨 Canvas generado:', {
        width: canvas.width,
        height: canvas.height
      })

      // Paso 7: Optimizar (95%)
      setExportProgress(95)
      setExportStatus('Optimizando imagen...')

      const finalCanvas = showBasemap ? canvas : cropCanvas(canvas)

      // Cleanup
      cleanupFunctions.forEach(fn => {
        try { fn() } catch (e) { console.error('Cleanup error:', e) }
      })

      setExportProgress(100)
      setExportStatus('¡Completado!')

      return finalCanvas

    } catch (error) {
      cleanupFunctions.forEach(fn => {
        try { fn() } catch (e) { console.error('Cleanup error:', e) }
      })
      throw error
    }
  }

  // Exportar a PNG - Usa generateMapImage()
  const exportToPng = async () => {
    if (exporting) return  // Prevenir múltiples exportaciones simultáneas

    setExporting(true)
    setExportProgress(0)
    setExportStatus('Iniciando exportación...')

    try {
      const canvas = await generateMapImage()

      // Convertir a PNG y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Error generando blob de imagen')
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `mapa-peru-${nivel}-${Date.now()}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        setExporting(false)
        setExportProgress(0)
        setExportStatus('')
      }, 'image/png')

    } catch (err) {
      console.error('Error exportando mapa:', err)

      let errorMessage = 'Error al exportar el mapa. '
      if (err.message.includes('selecciona')) {
        errorMessage = err.message
      } else if (err.message.includes('Leaflet')) {
        errorMessage += 'Problema renderizando el mapa.'
      } else if (err.message.includes('imagen')) {
        errorMessage += 'Problema capturando la imagen.'
      } else {
        errorMessage += 'Por favor, intenta nuevamente.'
      }

      alert(errorMessage)
      setExporting(false)
      setExportProgress(0)
      setExportStatus('')
    }
  }

  // Copiar mapa al portapapeles - Usa generateMapImage()
  const copyToClipboard = async () => {
    // Verificar soporte del navegador
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      alert('Tu navegador no soporta copiar imágenes al portapapeles. Por favor, usa la opción de descargar.')
      return
    }

    if (exporting) return  // Prevenir múltiples exportaciones simultáneas

    setExporting(true)
    setExportProgress(0)
    setExportStatus('Iniciando copia...')

    try {
      const canvas = await generateMapImage()

      // Convertir a blob y copiar al portapapeles
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Error generando blob de imagen')
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])

          // Mostrar feedback de éxito
          setShowCopyFeedback(true)

          // Limpiar timeout anterior si existe
          if (copyFeedbackTimeoutRef.current) {
            clearTimeout(copyFeedbackTimeoutRef.current)
          }

          // Programar nuevo timeout
          copyFeedbackTimeoutRef.current = setTimeout(() => {
            setShowCopyFeedback(false)
            copyFeedbackTimeoutRef.current = null
          }, 3000)

          // Cerrar el menú dropdown
          setShowExportMenu(false)

        } catch (clipboardErr) {
          console.error('Error copiando al portapapeles:', clipboardErr)
          throw new Error('No se pudo copiar al portapapeles. Por favor, intenta descargar el mapa.')
        } finally {
          setExporting(false)
          setExportProgress(0)
          setExportStatus('')
        }
      }, 'image/png')

    } catch (err) {
      console.error('Error copiando mapa:', err)

      let errorMessage = 'Error al copiar el mapa. '
      if (err.message.includes('selecciona')) {
        errorMessage = err.message
      } else if (err.message.includes('portapapeles')) {
        errorMessage = err.message
      } else if (err.message.includes('Leaflet')) {
        errorMessage += 'Problema renderizando el mapa.'
      } else if (err.message.includes('imagen')) {
        errorMessage += 'Problema capturando la imagen.'
      } else {
        errorMessage += 'Por favor, intenta nuevamente.'
      }

      alert(errorMessage)
      setExporting(false)
      setExportProgress(0)
      setExportStatus('')
    }
  }

  // Limpiar selecciones
  const clearSelections = () => {
    setSelectedRegions([])
    setSelectedProvinces([])
    setSelectedDistricts([])
  }

  // Resetear colores a valores por defecto
  const resetColors = () => {
    setColorGeneral('#713030')
    setColorSelected('#5F48C6')
    setColorBorder('#000000')
    setGrosorBorde(0.8)
    setShowBorders(true)
    setShowBasemap(true)
    setIncludeContext(false)
  }

  return (
    <div className="section-reset">
      <div className="container-reset max-w-full px-4">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <div className="inline-block mb-2">
            <span className="text-reset-neon text-xs sm:text-sm font-bold uppercase tracking-wider">
              // MÓDULO DE MAPAS INTERACTIVOS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-reset-white mb-2 leading-tight">
            <span className="text-gradient-neon">MAPITO</span>
          </h1>
          <p className="text-reset-gray-light text-base">
            Crea y personaliza mapas de Perú - Exporta en PNG
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-4">
            {/* Nivel de Mapa */}
            <div className="card-reset-shadow animate-fade-in-up">
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide flex items-center">
                <span className="text-reset-neon mr-2">📊</span>
                Nivel del Mapa
              </h3>
              <select
                value={nivel}
                onChange={(e) => {
                  setNivel(e.target.value)
                  clearSelections()
                }}
                className="w-full bg-reset-gray-dark border border-reset-gray-medium rounded-reset px-3 py-2 text-reset-white focus:outline-none focus:border-reset-neon"
              >
                <option value="regiones">Regiones</option>
                <option value="provincias">Provincias</option>
                <option value="distritos">Distritos</option>
              </select>
            </div>

            {/* Selecciones */}
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide flex items-center">
                <span className="text-reset-cyan mr-2">📍</span>
                Selecciones
              </h3>

              {nivel === 'regiones' && (
                <div>
                  <label className="text-reset-gray-light text-sm mb-2 block">
                    Regiones ({selectedRegions.length} seleccionadas)
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {availableRegions.map(region => (
                      <label key={region} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-reset-gray-dark p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRegions([...selectedRegions, region])
                            } else {
                              setSelectedRegions(selectedRegions.filter(r => r !== region))
                            }
                          }}
                          className="form-checkbox text-reset-neon"
                        />
                        <span className="text-reset-gray-light">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {nivel === 'provincias' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-reset-gray-light text-sm mb-2 block">
                      Regiones base
                    </label>
                    <select
                      multiple
                      value={selectedRegions}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        setSelectedRegions(selected)
                        setSelectedProvinces([])
                      }}
                      className="w-full bg-reset-gray-dark border border-reset-gray-medium rounded-reset px-3 py-2 text-reset-white focus:outline-none focus:border-reset-neon text-sm"
                      size="4"
                    >
                      {availableRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <p className="text-xs text-reset-gray-light mt-1">Mantén Ctrl/Cmd para seleccionar múltiples</p>
                  </div>

                  {availableProvinces.length > 0 && (
                    <div>
                      <label className="text-reset-gray-light text-sm mb-2 block">
                        Provincias ({selectedProvinces.length})
                      </label>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {availableProvinces.map(prov => (
                          <label key={`${prov.region}-${prov.name}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-reset-gray-dark p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedProvinces.some(p => p.region === prov.region && p.name === prov.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProvinces([...selectedProvinces, prov])
                                } else {
                                  setSelectedProvinces(selectedProvinces.filter(p =>
                                    !(p.region === prov.region && p.name === prov.name)
                                  ))
                                }
                              }}
                              className="form-checkbox text-reset-neon"
                            />
                            <span className="text-reset-gray-light text-xs">{prov.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {nivel === 'distritos' && (
                <div className="space-y-3">
                  <div className="bg-reset-gray-dark border border-reset-cyan rounded p-2 mb-3">
                    <p className="text-reset-cyan text-xs">
                      💡 Primero selecciona regiones, luego provincias y finalmente los distritos
                    </p>
                  </div>

                  <div>
                    <label className="text-reset-gray-light text-sm mb-2 block">
                      1. Regiones base
                    </label>
                    <select
                      multiple
                      value={selectedRegions}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        setSelectedRegions(selected)
                        setSelectedProvinces([])
                        setSelectedDistricts([])
                      }}
                      className="w-full bg-reset-gray-dark border border-reset-gray-medium rounded-reset px-3 py-2 text-reset-white focus:outline-none focus:border-reset-neon text-sm"
                      size="3"
                    >
                      {availableRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {availableProvinces.length > 0 && (
                    <div>
                      <label className="text-reset-gray-light text-sm mb-2 block">
                        2. Provincias ({selectedProvinces.length})
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {availableProvinces.map(prov => (
                          <label key={`${prov.region}-${prov.name}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-reset-gray-dark p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedProvinces.some(p => p.region === prov.region && p.name === prov.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProvinces([...selectedProvinces, prov])
                                } else {
                                  setSelectedProvinces(selectedProvinces.filter(p =>
                                    !(p.region === prov.region && p.name === prov.name)
                                  ))
                                  // Limpiar distritos de esta provincia
                                  setSelectedDistricts(selectedDistricts.filter(d =>
                                    !(d.region === prov.region && d.province === prov.name)
                                  ))
                                }
                              }}
                              className="form-checkbox text-reset-neon"
                            />
                            <span className="text-reset-gray-light text-xs">{prov.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableDistricts.length > 0 && (
                    <div>
                      <label className="text-reset-gray-light text-sm mb-2 block">
                        3. Distritos ({selectedDistricts.length})
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {availableDistricts.map(dist => (
                          <label key={`${dist.region}-${dist.province}-${dist.name}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-reset-gray-dark p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedDistricts.some(d =>
                                d.region === dist.region &&
                                d.province === dist.province &&
                                d.name === dist.name
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDistricts([...selectedDistricts, dist])
                                } else {
                                  setSelectedDistricts(selectedDistricts.filter(d =>
                                    !(d.region === dist.region &&
                                      d.province === dist.province &&
                                      d.name === dist.name)
                                  ))
                                }
                              }}
                              className="form-checkbox text-reset-neon"
                            />
                            <span className="text-reset-gray-light text-xs">{dist.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProvinces.length === 0 && selectedRegions.length > 0 && (
                    <p className="text-reset-yellow text-xs mt-2">
                      ⚠️ Selecciona al menos una provincia para ver los distritos
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={clearSelections}
                className="mt-3 w-full px-3 py-2 bg-reset-gray-dark border border-reset-gray-medium text-reset-gray-light rounded-reset hover:border-reset-red hover:text-reset-red transition-colors text-sm"
              >
                Limpiar Selecciones
              </button>
            </div>

            {/* Colores */}
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide flex items-center">
                <span className="text-reset-purple mr-2">🎨</span>
                Personalización
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-reset-gray-light text-sm mb-1 block">Color General</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={colorGeneral}
                      onChange={(e) => setColorGeneral(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorGeneral}
                      onChange={(e) => setColorGeneral(e.target.value)}
                      className="flex-1 bg-reset-gray-dark border border-reset-gray-medium rounded px-2 py-1 text-reset-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-reset-gray-light text-sm mb-1 block">Color Seleccionado</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={colorSelected}
                      onChange={(e) => setColorSelected(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorSelected}
                      onChange={(e) => setColorSelected(e.target.value)}
                      className="flex-1 bg-reset-gray-dark border border-reset-gray-medium rounded px-2 py-1 text-reset-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-reset-gray-light text-sm mb-1 block">Color Bordes</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={colorBorder}
                      onChange={(e) => setColorBorder(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorBorder}
                      onChange={(e) => setColorBorder(e.target.value)}
                      className="flex-1 bg-reset-gray-dark border border-reset-gray-medium rounded px-2 py-1 text-reset-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-reset-gray-light text-sm mb-1 block">
                    Grosor de Borde ({grosorBorde}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={grosorBorde}
                    onChange={(e) => setGrosorBorde(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showBorders"
                    checked={showBorders}
                    onChange={(e) => setShowBorders(e.target.checked)}
                    className="form-checkbox text-reset-neon"
                  />
                  <label htmlFor="showBorders" className="text-reset-gray-light text-sm cursor-pointer">
                    Mostrar Bordes
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showBasemap"
                    checked={showBasemap}
                    onChange={(e) => setShowBasemap(e.target.checked)}
                    className="form-checkbox text-reset-neon"
                  />
                  <label htmlFor="showBasemap" className="text-reset-gray-light text-sm cursor-pointer">
                    Mostrar Mapa Base
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeContext"
                    checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)}
                    className="form-checkbox text-reset-neon"
                  />
                  <label htmlFor="includeContext" className="text-reset-gray-light text-sm cursor-pointer">
                    Incluir Mapa Completo
                  </label>
                </div>

                <button
                  onClick={resetColors}
                  className="w-full px-3 py-2 bg-reset-gray-dark border border-reset-gray-medium text-reset-gray-light rounded-reset hover:border-reset-purple hover:text-reset-purple transition-colors text-sm"
                >
                  Resetear Colores
                </button>
              </div>
            </div>

            {/* Exportar */}
            <div className="card-reset-shadow animate-fade-in-up relative export-dropdown-container" style={{ animationDelay: '0.15s' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || !geoData || exporting}
                className="w-full px-4 py-3 bg-gradient-to-r from-reset-neon to-green-400 text-reset-black font-bold rounded-reset hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>{exporting ? '⏳ Exportando...' : '⬇️ Exportar Mapa'}</span>
                {!exporting && <span className="text-sm">▼</span>}
              </button>

              {/* Progress bar durante exportación */}
              {exporting && exportProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-reset-gray-dark rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-reset-neon to-green-400 h-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-reset-cyan text-xs mt-1 text-center">
                    {exportStatus} {exportProgress}%
                  </p>
                </div>
              )}

              {/* Dropdown menu */}
              {showExportMenu && !exporting && (
                <div className="absolute left-0 right-0 mt-2 bg-reset-gray-dark border border-reset-gray-medium rounded-reset shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={exportToPng}
                    className="w-full px-3 py-2 text-left text-reset-white hover:bg-reset-gray-medium transition-colors flex items-center space-x-2 border-b border-reset-gray-medium text-sm"
                  >
                    <span>📥</span>
                    <span className="font-semibold text-reset-neon">Descargar PNG</span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="w-full px-3 py-2 text-left text-reset-white hover:bg-reset-gray-medium transition-colors flex items-center space-x-2 text-sm"
                  >
                    <span>📋</span>
                    <span className="font-semibold text-reset-cyan">Copiar al Portapapeles</span>
                  </button>
                </div>
              )}

              <div className="mt-2 space-y-1">
                <p className="text-reset-gray-light text-xs text-center">
                  {includeContext ? '🗺️ Exportará el mapa completo' : 'Solo exportará las áreas seleccionadas'}
                </p>
                <p className="text-reset-cyan text-xs text-center">
                  {showBasemap ? '📍 Con mapa base' : '✨ Fondo transparente'}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-reset-gray-light text-xs space-y-2">
                <p><strong className="text-reset-neon">Tip:</strong> Haz clic en el mapa para seleccionar</p>
                <p><strong className="text-reset-cyan">Zoom:</strong> Scroll del mouse o botones +/-</p>
                <p><strong className="text-reset-purple">Pan:</strong> Arrastra el mapa</p>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="lg:col-span-3">
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-full" style={{ height: '700px' }}>
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-reset-neon text-lg">Cargando mapa...</div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-reset-red">Error: {error}</div>
                  </div>
                )}

                {nivel === 'distritos' && selectedProvinces.length === 0 && !loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🗺️</div>
                      <div className="text-reset-gray-light">
                        Selecciona regiones y provincias para ver los distritos
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !error && geoData && (nivel !== 'distritos' || selectedProvinces.length > 0) && (
                  <MapContainer
                    center={[-9.2, -75.0]}
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                    className="rounded-reset"
                  >
                    {showBasemap && (
                      <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                      />
                    )}

                    <GeoJSON
                      key={`${nivel}-${selectedRegions.join(',')}-${selectedProvinces.map(p => p.name).join(',')}-${selectedDistricts.map(d => d.name).join(',')}-${colorGeneral}-${colorSelected}-${colorBorder}-${grosorBorde}-${showBorders}`}
                      data={geoData}
                      style={getFeatureStyle}
                      onEachFeature={onEachFeature}
                    />

                    {mapBounds && <FitBounds bounds={mapBounds} />}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback visual de copiado exitoso */}
      {showCopyFeedback && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
          <div className="bg-gradient-to-r from-reset-neon to-green-400 text-reset-black px-5 py-3 rounded-reset shadow-2xl flex items-center space-x-2 border-2 border-reset-neon">
            <span className="text-xl">✅</span>
            <div className="font-bold text-base">¡Mapa copiado al portapapeles!</div>
          </div>
        </div>
      )}

      {/* CSS personalizado para tooltips */}
      <style>{`
        .custom-tooltip {
          background-color: rgba(26, 26, 26, 0.95) !important;
          border: 1px solid #00FF94 !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-control-zoom a {
          background-color: #1a1a1a !important;
          color: #00FF94 !important;
          border: 1px solid #2a2a2a !important;
        }

        .leaflet-control-zoom a:hover {
          background-color: #2a2a2a !important;
          color: #00FF94 !important;
        }

        .leaflet-control-attribution {
          background-color: rgba(26, 26, 26, 0.8) !important;
          color: #888 !important;
        }

        .leaflet-control-attribution a {
          color: #00FF94 !important;
        }
      `}</style>
    </div>
  )
}
