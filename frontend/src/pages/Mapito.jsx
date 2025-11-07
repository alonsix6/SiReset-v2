import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

  // Estado de colores y estilos
  const [colorGeneral, setColorGeneral] = useState('#713030')
  const [colorSelected, setColorSelected] = useState('#5F48C6')
  const [colorBorder, setColorBorder] = useState('#000000')
  const [grosorBorde, setGrosorBorde] = useState(0.8)
  const [showBorders, setShowBorders] = useState(true)
  const [showBasemap, setShowBasemap] = useState(true)
  const [includeContext, setIncludeContext] = useState(false)  // Incluir mapa completo para contexto

  // Refs
  const mapRef = useRef(null)

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

  // Exportar a PNG - Solo las áreas seleccionadas, sin el resto del mapa
  const exportToPng = async () => {
    if (!mapRef.current || !geoData) return

    setExporting(true)

    try {
      // Obtener features seleccionados
      const selectedFeatures = geoData.features.filter(f => isSelected(f))

      if (selectedFeatures.length === 0) {
        alert('Por favor selecciona al menos un área para exportar')
        setExporting(false)
        return
      }

      // Crear datos solo con features seleccionados
      const selectedData = {
        type: 'FeatureCollection',
        features: selectedFeatures
      }

      // Crear un contenedor temporal más grande para evitar cortes
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '2400px'
      tempDiv.style.height = '2400px'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.backgroundColor = showBasemap ? '#ffffff' : 'transparent'
      document.body.appendChild(tempDiv)

      // Crear mapa temporal
      const tempMap = L.map(tempDiv, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: false
      }).setView([-9.2, -75.0], 5)

      // Asegurar que el contenedor de Leaflet tenga fondo transparente
      const leafletContainer = tempDiv.querySelector('.leaflet-container')
      if (leafletContainer && !showBasemap) {
        leafletContainer.style.backgroundColor = 'transparent'
      }

      // Si showBasemap está activo, agregar el mapa base
      if (showBasemap) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(tempMap)
      }

      // Agregar GeoJSON según el contexto
      const dataToRender = includeContext ? geoData : selectedData

      const geoJsonLayer = L.geoJSON(dataToRender, {
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

      // Ajustar vista - VOLVER A LA LÓGICA SIMPLE QUE FUNCIONABA
      const bounds = geoJsonLayer.getBounds()
      const padding = showBasemap ? [100, 100] : [50, 50]  // Padding moderado
      tempMap.fitBounds(bounds, {
        padding: padding,
        maxZoom: 18
      })

      // Esperar a que se carguen los tiles si el basemap está activo
      if (showBasemap) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Importar html2canvas dinámicamente
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default

      // Capturar el mapa completo
      const canvas = await html2canvas(tempDiv, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: showBasemap ? '#ffffff' : null,
        scale: 1,  // Escala 1 porque el div ya es grande
        logging: false,
        width: 2400,
        height: 2400
      })

      // Función para recortar el canvas eliminando áreas transparentes
      const cropCanvas = (sourceCanvas) => {
        const ctx = sourceCanvas.getContext('2d')
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

      // Recortar solo si no hay basemap (para optimizar tamaño)
      const finalCanvas = showBasemap ? canvas : cropCanvas(canvas)

      // Convertir a PNG y descargar
      finalCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `mapa-peru-${nivel}-${Date.now()}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)

        // Limpiar
        tempMap.remove()
        document.body.removeChild(tempDiv)
        setExporting(false)
      }, 'image/png')

    } catch (err) {
      console.error('Error exportando mapa:', err)
      alert('Error al exportar el mapa. Por favor, intenta nuevamente.')
      setExporting(false)
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
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <button
                onClick={exportToPng}
                disabled={loading || !geoData || exporting}
                className="w-full px-4 py-3 bg-gradient-to-r from-reset-neon to-green-400 text-reset-black font-bold rounded-reset hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? '⏳ Exportando...' : '📥 Descargar PNG'}
              </button>
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
                    ref={mapRef}
                    center={[-9.2, -75.0]}
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                    className="rounded-reset"
                  >
                    {showBasemap && (
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
