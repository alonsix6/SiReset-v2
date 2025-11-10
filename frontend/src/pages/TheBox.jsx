import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { toPng } from 'html-to-image'
import { Download, Loader } from 'lucide-react'

import FileUploader from '../components/TheBox/FileUploader'
import ChartControls from '../components/TheBox/ChartControls'
import MediaSelector from '../components/TheBox/MediaSelector'
import BoxChart from '../components/TheBox/BoxChart'

export default function TheBox() {
  // Estados principales
  const [fileName, setFileName] = useState('')
  const [targetName, setTargetName] = useState('')
  const [mediosData, setMediosData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  // Estados de controles
  const [analysisType, setAnalysisType] = useState('all') // 'all', 'online', 'offline'
  const [colorOnline, setColorOnline] = useState('#0dff66')
  const [colorOffline, setColorOffline] = useState('#00ffff')
  const [highlightedMedio, setHighlightedMedio] = useState('')
  const [highlightColor, setHighlightColor] = useState('#FF0080')

  // Medias para líneas de referencia
  const [meanCONS, setMeanCONS] = useState(null)
  const [meanHC, setMeanHC] = useState(null)

  // Ref para exportar
  const chartRef = useRef(null)

  // ========== FUNCIONES DE PROCESAMIENTO ==========

  const clasificarMedio = (medio) => {
    const medioLower = medio.toLowerCase().trim()
    const mediosOnline = [
      'whatsapp', 'gmail', 'google', 'facebook', 'youtube',
      'instagram', 'tik tok', 'tiktok', 'x', 'pinterest',
      'linkedin', 'snapchat', 'spotify', 'podcast', 'twitch',
      'diario online', 'radio online', 'tv online'
    ]
    return mediosOnline.some(m => medioLower.includes(m)) ? 'online' : 'offline'
  }

  const determinarTipoATP = (medio) => {
    const medioLower = medio.toLowerCase().trim()

    // TV (abierta y paga) → "ATP TV general"
    if (medioLower.includes('tv paga') || medioLower.includes('tv abierta')) {
      return 'TV general'
    }

    // Redes Sociales → "ATP Internet Social Media"
    const redesSociales = [
      'facebook', 'instagram', 'tiktok', 'tik tok', 'whatsapp',
      'youtube', 'x', 'pinterest', 'linkedin', 'snapchat'
    ]
    if (redesSociales.some(red => medioLower.includes(red))) {
      return 'Internet Social Media'
    }

    // Internet (resto de medios online que no son RRSS) → "ATP Internet"
    const mediosInternet = [
      'gmail', 'google', 'podcast', 'spotify', 'twitch',
      'diario online', 'radio online', 'tv online'
    ]
    if (mediosInternet.some(m => medioLower.includes(m))) {
      return 'Internet'
    }

    // Medios tradicionales offline
    if (medioLower.includes('radio') && !medioLower.includes('online')) {
      return 'Radio'
    }
    if (medioLower.includes('ooh')) {
      return 'OOH'
    }
    if (medioLower.includes('cine')) {
      return 'Cine'
    }
    if (medioLower.includes('diario') && !medioLower.includes('online')) {
      return 'Diario'
    }

    // Por defecto
    return null
  }

  const normalizarTamanos = (medios) => {
    const tamanos = medios.map(m => m.tamanoRaw)
    const min = Math.min(...tamanos)
    const max = Math.max(...tamanos)

    return medios.map(medio => ({
      ...medio,
      tamano: ((medio.tamanoRaw - min) / (max - min)) * 1000 + 200
    }))
  }

  const calcularMedias = (medios) => {
    const visibleMedios = medios.filter(m => m.visible)
    if (visibleMedios.length === 0) {
      setMeanCONS(null)
      setMeanHC(null)
      return
    }

    const sumCONS = visibleMedios.reduce((acc, m) => acc + m.CONS, 0)
    const sumHC = visibleMedios.reduce((acc, m) => acc + m.HC, 0)

    setMeanCONS(sumCONS / visibleMedios.length)
    setMeanHC(sumHC / visibleMedios.length)
  }

  const processExcelData = (jsonData) => {
    setLoading(true)
    setError('')

    try {
      // Extraer target de D5 (row 4, col 3)
      const target = jsonData[4]?.[3] || 'Target no especificado'
      setTargetName(String(target).trim())

      // Primero, buscar y guardar todos los valores de ATP disponibles
      const atpValues = {}
      jsonData.forEach((row) => {
        const cell = row[0]
        if (typeof cell === 'string' && cell.toUpperCase().startsWith('ATP ')) {
          const tipoATP = cell.substring(4).trim()
          const valorATP = row[3]
          if (valorATP !== undefined && valorATP !== null && !isNaN(valorATP)) {
            // Guardar con el nombre original y también normalizado
            atpValues[tipoATP] = Number(valorATP)
            atpValues[tipoATP.toUpperCase()] = Number(valorATP)
            atpValues[tipoATP.toLowerCase()] = Number(valorATP)
          }
        }
      })

      console.log('ATP Values encontrados:', atpValues)

      const medios = []

      // Buscar filas que empiecen con "HC "
      jsonData.forEach((row, i) => {
        const cell = row[0]
        if (typeof cell === 'string' && cell.startsWith('HC ')) {
          const medio = cell.substring(3).trim()

          // HC está en la misma fila, columna D (index 3)
          const hc = row[3]

          // Afinidad está en la siguiente fila, columna D
          const afinidad = jsonData[i + 1]?.[3]

          // Buscar CONS en otra fila
          const consPrefix = `CONS ${medio}`
          let cons = null

          for (let j = 0; j < jsonData.length; j++) {
            if (typeof jsonData[j][0] === 'string' && jsonData[j][0].trim() === consPrefix) {
              cons = jsonData[j][3]
              break
            }
          }

          // Validar que HC, CONS y Afinidad existen
          if (
            hc !== undefined && hc !== null && !isNaN(hc) &&
            afinidad !== undefined && afinidad !== null && !isNaN(afinidad) &&
            cons !== undefined && cons !== null && !isNaN(cons)
          ) {
            const tipo = clasificarMedio(medio)

            // Determinar qué tipo de ATP usar para este medio
            const tipoATP = determinarTipoATP(medio)
            let atp = null

            // Intentar leer ATP del Excel
            if (tipoATP) {
              // Buscar variaciones del nombre (case-insensitive)
              const posiblesNombres = [
                tipoATP,                          // "TV general", "Internet Social Media", "Internet"
                tipoATP.toUpperCase(),            // "TV GENERAL", "INTERNET SOCIAL MEDIA", "INTERNET"
                tipoATP.toLowerCase(),            // "tv general", "internet social media", "internet"
                // También intentar con "ATP " prefijo por si acaso
                `ATP ${tipoATP}`,
                `atp ${tipoATP.toLowerCase()}`
              ]

              for (const nombre of posiblesNombres) {
                if (atpValues[nombre] !== undefined) {
                  atp = atpValues[nombre]
                  console.log(`✓ ATP encontrado para ${medio}: ${nombre} = ${atp}`)
                  break
                }
              }
            }

            // Si no encontró ATP en Excel, usar valores por defecto
            if (atp === null) {
              const medioLower = medio.toLowerCase()
              if (medioLower.includes('tv paga') || medioLower.includes('tv abierta')) {
                atp = 41.34
              } else if (['facebook', 'instagram', 'tiktok', 'whatsapp', 'youtube', 'x', 'pinterest', 'linkedin', 'snapchat'].some(red => medioLower.includes(red))) {
                atp = 39.45
              } else if (tipo === 'online') {
                atp = 17.74
              } else {
                atp = 27.35
              }
              console.warn(`Usando ATP por defecto para ${medio}: ${atp}`)
            }

            // Fórmula correcta: 40% ATP + 60% Afinidad
            const tamanoRaw = (0.4 * atp) + (0.6 * afinidad)

            medios.push({
              nombre: medio,
              HC: Number(hc),
              CONS: Number(cons),
              Afinidad: Number(afinidad),
              tipo: tipo,
              ATP: Number(atp),
              tipoATP: tipoATP || 'Por defecto',
              tamanoRaw: tamanoRaw,
              tamano: 0, // Se calculará después de normalizar
              visible: true
            })
          }
        }
      })

      if (medios.length === 0) {
        setError('No se encontraron datos válidos en el archivo. Verifica el formato.')
        setLoading(false)
        return
      }

      // Normalizar tamaños
      const mediosNormalizados = normalizarTamanos(medios)

      // Ordenar alfabéticamente
      mediosNormalizados.sort((a, b) => a.nombre.localeCompare(b.nombre))

      setMediosData(mediosNormalizados)
      calcularMedias(mediosNormalizados)

      setLoading(false)
    } catch (err) {
      console.error('Error procesando Excel:', err)
      setError(`Error al procesar el archivo: ${err.message}`)
      setLoading(false)
    }
  }

  // ========== HANDLERS ==========

  const handleFileUpload = (file) => {
    setFileName(file.name)
    setLoading(true)
    setError('')

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Verificar que existe el sheet "THE NEW BOX"
        if (!workbook.SheetNames.includes('THE NEW BOX')) {
          setError('El archivo no contiene una hoja llamada "THE NEW BOX"')
          setLoading(false)
          return
        }

        const worksheet = workbook.Sheets['THE NEW BOX']
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })

        processExcelData(jsonData)
      } catch (err) {
        console.error('Error leyendo archivo:', err)
        setError(`Error al leer el archivo: ${err.message}`)
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Error al leer el archivo')
      setLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const handleClearFile = () => {
    setFileName('')
    setTargetName('')
    setMediosData([])
    setError('')
    setMeanCONS(null)
    setMeanHC(null)
    setHighlightedMedio('')
  }

  const handleToggleMedio = (nombreMedio) => {
    const updatedMedios = mediosData.map(medio =>
      medio.nombre === nombreMedio
        ? { ...medio, visible: !medio.visible }
        : medio
    )
    setMediosData(updatedMedios)
    calcularMedias(updatedMedios)

    // Si el medio resaltado se oculta, limpiar resalte
    if (highlightedMedio === nombreMedio) {
      const medio = updatedMedios.find(m => m.nombre === nombreMedio)
      if (!medio.visible) {
        setHighlightedMedio('')
      }
    }
  }

  const handleToggleAll = () => {
    const allVisible = mediosData.every(m => m.visible)
    const updatedMedios = mediosData.map(medio => ({
      ...medio,
      visible: !allVisible
    }))
    setMediosData(updatedMedios)
    calcularMedias(updatedMedios)

    if (!allVisible === false) {
      setHighlightedMedio('')
    }
  }

  const handleExport = async () => {
    if (!chartRef.current) return

    setExporting(true)

    try {
      // Esperar un momento para que el gráfico se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 500))

      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: 'transparent',
        pixelRatio: 2,
        quality: 1
      })

      // Descargar imagen
      const link = document.createElement('a')
      link.download = `the-box-${targetName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      setExporting(false)
    } catch (err) {
      console.error('Error exportando imagen:', err)
      setError('Error al exportar la imagen')
      setExporting(false)
    }
  }

  // ========== DATOS FILTRADOS ==========

  const getFilteredData = () => {
    if (analysisType === 'all') {
      return mediosData
    } else if (analysisType === 'online') {
      return mediosData.filter(m => m.tipo === 'online')
    } else if (analysisType === 'offline') {
      return mediosData.filter(m => m.tipo === 'offline')
    }
    return mediosData
  }

  const filteredData = getFilteredData()

  // ========== RENDER ==========

  return (
    <div className="section-reset">
      <div className="container-reset max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <span className="text-reset-neon text-xs uppercase font-semibold tracking-wider">
            // HERRAMIENTA DE ANÁLISIS
          </span>
          <h1 className="font-display text-4xl lg:text-6xl text-reset-white mt-2">
            THE <span className="text-gradient-neon">BOX</span>
          </h1>
          <p className="text-reset-gray-light text-lg mt-2">
            Generador de gráficos de afinidad y consumo de medios
          </p>
        </div>

        {/* Alert de error */}
        {error && (
          <div className="alert-error mb-6 animate-fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Controles */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upload */}
            <FileUploader
              onFileUpload={handleFileUpload}
              fileName={fileName}
              onClear={handleClearFile}
            />

            {/* Controles */}
            <ChartControls
              analysisType={analysisType}
              onAnalysisTypeChange={setAnalysisType}
              colorOnline={colorOnline}
              colorOffline={colorOffline}
              onColorOnlineChange={setColorOnline}
              onColorOfflineChange={setColorOffline}
              highlightedMedio={highlightedMedio}
              onHighlightChange={setHighlightedMedio}
              highlightColor={highlightColor}
              onHighlightColorChange={setHighlightColor}
              medios={filteredData}
              disabled={mediosData.length === 0}
            />

            {/* Selector de medios */}
            <MediaSelector
              medios={filteredData}
              onToggleMedio={handleToggleMedio}
              onToggleAll={handleToggleAll}
            />

            {/* Botón export */}
            {mediosData.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting || filteredData.filter(m => m.visible).length === 0}
                className="btn-primary w-full animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                {exporting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={18} />
                    Descargar PNG
                  </>
                )}
              </button>
            )}
          </div>

          {/* Main - Gráfico */}
          <div className="lg:col-span-3">
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <Loader className="animate-spin text-reset-neon mx-auto mb-4" size={48} />
                    <p className="text-reset-white text-lg font-semibold">
                      Procesando archivo...
                    </p>
                    <p className="text-reset-gray-light text-sm mt-2">
                      Esto puede tomar unos segundos
                    </p>
                  </div>
                </div>
              ) : mediosData.length === 0 ? (
                <div className="flex items-center justify-center h-[600px] text-reset-gray-light">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-display text-reset-white mb-2">
                      Comienza cargando tus datos
                    </h3>
                    <p className="text-sm">
                      Sube un archivo Excel con formato TGI para generar el gráfico de afinidad y consumo de medios
                    </p>
                    <div className="mt-6 p-4 bg-reset-gray-dark rounded-lg border border-reset-cyan/30 text-left">
                      <p className="text-xs text-reset-cyan font-semibold mb-2">
                        📋 Requisitos del archivo:
                      </p>
                      <ul className="text-xs space-y-1 text-reset-gray-light">
                        <li>• Formato: .xlsx o .xls</li>
                        <li>• Hoja: "THE NEW BOX"</li>
                        <li>• Celda D5: Nombre del target</li>
                        <li>• Filas: HC [medio], CONS [medio]</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <BoxChart
                  ref={chartRef}
                  data={filteredData}
                  targetName={targetName}
                  colorOnline={colorOnline}
                  colorOffline={colorOffline}
                  highlightedMedio={highlightedMedio}
                  highlightColor={highlightColor}
                  meanCONS={meanCONS}
                  meanHC={meanHC}
                />
              )}
            </div>

            {/* Info adicional */}
            {mediosData.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-neon/20 animate-fade-in">
                  <div className="text-center">
                    <p className="text-reset-neon text-3xl font-display">
                      {filteredData.filter(m => m.visible).length}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Medios visibles
                    </p>
                  </div>
                </div>
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-cyan/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="text-center">
                    <p className="text-reset-cyan text-3xl font-display">
                      {filteredData.filter(m => m.tipo === 'online').length}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Medios online
                    </p>
                  </div>
                </div>
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-purple/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-center">
                    <p className="text-reset-purple text-3xl font-display">
                      {filteredData.filter(m => m.tipo === 'offline').length}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Medios ATL
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
