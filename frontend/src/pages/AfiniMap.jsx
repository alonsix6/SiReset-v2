import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Download, Loader, Upload, FileSpreadsheet, X, RefreshCw } from 'lucide-react'
import axios from 'axios'

import AfiniMapControls from '../components/AfiniMap/AfiniMapControls'
import VariableSelector from '../components/AfiniMap/VariableSelector'
import ColorCustomizer from '../components/AfiniMap/ColorCustomizer'

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8000'

export default function AfiniMap({ user }) {
  // Estados principales
  const [fileName, setFileName] = useState('')
  const [targetName, setTargetName] = useState('')
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [graphImage, setGraphImage] = useState(null)
  const [generatingGraph, setGeneratingGraph] = useState(false)

  // Estados de configuración
  const [topN, setTopN] = useState(10)
  const [ordenarPor, setOrdenarPor] = useState('consumo')
  const [lineaAfinidad, setLineaAfinidad] = useState(110)
  const [colorBurbujas, setColorBurbujas] = useState('#cf3b4d')
  const [colorFondo, setColorFondo] = useState('#fff2f4')

  // Ref para exportar
  const chartRef = useRef(null)

  // ========== PROCESAMIENTO EXCEL (EN FRONTEND) ==========

  const processExcelData = (jsonData) => {
    setLoading(true)
    setError('')

    try {
      // Extraer target de D5
      const target = jsonData[4]?.[3]
      if (!target) {
        setError('No se encontró el nombre del Target en celda D5. Verifica la estructura del archivo TGI.')
        setLoading(false)
        return
      }
      setTargetName(String(target).trim())

      const extractedVariables = []

      // Procesar desde fila 8 en adelante
      for (let i = 7; i < jsonData.length; i++) {
        const row = jsonData[i]

        if (row[1] === 'Vert%') {
          const nombre = row[0]
          let consumoRaw = row[3]
          let consumo = 0

          if (typeof consumoRaw === 'number') {
            consumo = consumoRaw
          } else if (typeof consumoRaw === 'string') {
            consumo = parseFloat(consumoRaw)
          }

          // Mantener consumo en formato decimal (0-1) para el backend
          // NO convertir a porcentaje aquí

          const nextRow = jsonData[i + 1]
          if (nextRow && nextRow[1] === 'Afinidad') {
            let afinidadRaw = nextRow[3]
            let afinidad = parseFloat(afinidadRaw)

            // Afinidad se mantiene como está (no se multiplica)

            if (!isNaN(consumo) && !isNaN(afinidad) && consumo > 0 && nombre) {
              extractedVariables.push({
                nombre: String(nombre).trim(),
                consumo: consumo,
                afinidad: afinidad,
                visible: true
              })
            }

            i++
          }
        }
      }

      if (extractedVariables.length === 0) {
        setError('No se encontraron variables válidas en el Excel. Verifica la estructura TGI.')
        setLoading(false)
        return
      }

      console.log('Variables extraídas del Excel:', extractedVariables.length)
      console.log('Primera variable:', extractedVariables[0])

      setVariables(extractedVariables)
      setTopN(Math.min(10, extractedVariables.length))
      setLoading(false)

      // Generar gráfico automáticamente
      generarGrafico(extractedVariables, String(target).trim())
    } catch (err) {
      console.error('Error procesando Excel:', err)
      setError(`Error procesando el archivo: ${err.message}`)
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor sube un archivo Excel (.xlsx o .xls)')
      return
    }

    setFileName(file.name)
    setLoading(true)
    setError('')
    setGraphImage(null)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })

        processExcelData(jsonData)
      } catch (err) {
        console.error('Error leyendo Excel:', err)
        setError('Error leyendo el archivo Excel. Verifica que sea un formato válido.')
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
    setVariables([])
    setTargetName('')
    setError('')
    setGraphImage(null)
  }

  const handleToggleVariable = (nombreVariable) => {
    const updatedVariables = variables.map(variable =>
      variable.nombre === nombreVariable
        ? { ...variable, visible: !variable.visible }
        : variable
    )
    setVariables(updatedVariables)

    // Regenerar gráfico si hay cambios
    if (updatedVariables.length > 0) {
      generarGrafico(updatedVariables, targetName)
    }
  }

  const handleToggleAll = () => {
    const allVisible = variables.every(v => v.visible)
    const updatedVariables = variables.map(variable => ({
      ...variable,
      visible: !allVisible
    }))
    setVariables(updatedVariables)

    // Regenerar gráfico
    if (updatedVariables.length > 0) {
      generarGrafico(updatedVariables, targetName)
    }
  }

  // ========== GENERAR GRÁFICO CON MATPLOTLIB BACKEND ==========

  const generarGrafico = async (
    vars = variables,
    target = targetName,
    customTopN = null,
    customOrdenarPor = null,
    customLineaAfinidad = null
  ) => {
    setGeneratingGraph(true)
    setError('')

    try {
      // Usar valores custom o del estado
      const topNActual = customTopN !== null ? customTopN : topN
      const ordenarPorActual = customOrdenarPor !== null ? customOrdenarPor : ordenarPor
      const lineaAfinidadActual = customLineaAfinidad !== null ? customLineaAfinidad : lineaAfinidad

      // Filtrar y ordenar variables
      const varsOrdenadas = [...vars]

      if (ordenarPorActual === 'consumo') {
        varsOrdenadas.sort((a, b) => b.consumo - a.consumo)
      } else {
        varsOrdenadas.sort((a, b) => b.afinidad - a.afinidad)
      }

      const limit = topNActual === vars.length ? vars.length : topNActual
      let varsParaGrafico = varsOrdenadas.slice(0, limit).filter(v => v.visible)

      // VALIDACIÓN: Filtrar solo variables con datos válidos
      varsParaGrafico = varsParaGrafico.filter(v => {
        const isValid = (
          v.nombre &&
          typeof v.consumo === 'number' &&
          typeof v.afinidad === 'number' &&
          !isNaN(v.consumo) &&
          !isNaN(v.afinidad) &&
          v.consumo > 0 &&
          v.afinidad > 0
        )
        if (!isValid) {
          console.warn('Variable inválida filtrada:', v)
        }
        return isValid
      })

      if (varsParaGrafico.length < 2) {
        setGraphImage(null)
        setGeneratingGraph(false)
        if (varsParaGrafico.length === 0) {
          setError('No hay variables válidas para mostrar. Verifica los datos del Excel.')
        }
        return
      }

      console.log('Enviando al backend:', {
        variables: varsParaGrafico.length,
        target_name: target,
        linea_afinidad: lineaAfinidadActual
      })

      // Llamar al backend para generar el gráfico
      const response = await axios.post(
        `${API_URL}/api/afinimap/generar-grafico`,
        {
          variables: varsParaGrafico,
          target_name: target,
          linea_afinidad: lineaAfinidadActual,
          color_burbujas: colorBurbujas,
          color_fondo: colorFondo
        },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Crear URL del blob para mostrar la imagen
      const imageUrl = URL.createObjectURL(response.data)
      setGraphImage(imageUrl)
      setGeneratingGraph(false)
    } catch (err) {
      console.error('Error generando gráfico:', err)

      // Mostrar error específico si está disponible
      let errorMsg = 'Error generando el gráfico. Intenta de nuevo.'

      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data)

        // Si es un blob error, intentar leerlo como texto
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text()
            const errorData = JSON.parse(text)
            errorMsg = errorData.detail || errorMsg
          } catch (e) {
            console.error('No se pudo parsear error blob')
          }
        } else if (err.response.data?.detail) {
          errorMsg = err.response.data.detail
        }
      }

      setError(errorMsg)
      setGeneratingGraph(false)
    }
  }

  // Actualizar configuración sin regenerar automáticamente
  const handleTopNChange = (newTopN) => {
    setTopN(newTopN)
  }

  const handleOrdenarPorChange = (newOrdenar) => {
    setOrdenarPor(newOrdenar)
  }

  const handleLineaAfinidadChange = (newLinea) => {
    setLineaAfinidad(newLinea)
  }

  const handleColorBurbujasChange = (newColor) => {
    setColorBurbujas(newColor)
  }

  const handleColorFondoChange = (newColor) => {
    setColorFondo(newColor)
  }

  // Actualizar gráfico manualmente
  const handleActualizarGrafico = () => {
    generarGrafico(variables, targetName, topN, ordenarPor, lineaAfinidad)
  }

  const handleExport = async () => {
    if (!graphImage) return

    setExporting(true)

    try {
      // Descargar la imagen actual
      const response = await fetch(graphImage)
      const blob = await response.blob()

      const link = document.createElement('a')
      link.download = `afinimap-${targetName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      link.href = URL.createObjectURL(blob)
      link.click()

      setExporting(false)
    } catch (err) {
      console.error('Error exportando imagen:', err)
      setError('Error al exportar la imagen')
      setExporting(false)
    }
  }

  // ========== COMPUTED VALUES ==========

  const variablesOrdenadas = () => {
    if (!variables.length) return []

    let vars = [...variables]

    if (ordenarPor === 'consumo') {
      vars.sort((a, b) => b.consumo - a.consumo)
    } else {
      vars.sort((a, b) => b.afinidad - a.afinidad)
    }

    const limit = topN === variables.length ? variables.length : topN
    return vars.slice(0, limit)
  }

  const dataParaGrafico = variablesOrdenadas()

  // ========== RENDER ==========

  return (
    <div className="section-reset">
      <div className="container-reset max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <span className="text-reset-neon text-xs uppercase font-semibold tracking-wider">
            // ANÁLISIS TGI KANTAR IBOPE MEDIA
          </span>
          <h1 className="font-display text-4xl lg:text-6xl text-reset-white mt-2">
            AFINI<span className="text-gradient-magenta">MAP</span>
          </h1>
          <p className="text-reset-gray-light text-lg mt-2">
            Mapas de afinidad - Scatter plots de consumo y afinidad
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
            <div className="card-reset-shadow animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="text-reset-neon" size={20} />
                <h3 className="text-lg font-display text-reset-white">
                  Archivo TGI
                </h3>
              </div>

              {!fileName ? (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-reset-gray-light/30 rounded-lg cursor-pointer hover:border-reset-neon/50 hover:bg-reset-gray-dark/30 transition-all">
                  <Upload className="text-reset-cyan mb-3" size={32} />
                  <span className="text-sm text-reset-white font-semibold mb-1">
                    Subir archivo Excel
                  </span>
                  <span className="text-xs text-reset-gray-light text-center">
                    Formato TGI (.xlsx o .xls)
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-reset-gray-dark/50 rounded-lg border border-reset-neon/20">
                    <FileSpreadsheet className="text-reset-neon flex-shrink-0" size={18} />
                    <span className="text-sm text-reset-white truncate flex-1">
                      {fileName}
                    </span>
                    <button
                      onClick={handleClearFile}
                      className="text-reset-magenta hover:text-reset-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {targetName && (
                    <div className="p-3 bg-reset-cyan/10 rounded-lg border border-reset-cyan/20">
                      <span className="text-xs text-reset-cyan uppercase font-semibold">Target:</span>
                      <p className="text-sm text-reset-white font-semibold mt-1">{targetName}</p>
                    </div>
                  )}

                  {variables.length > 0 && (
                    <div className="p-3 bg-reset-neon/10 rounded-lg border border-reset-neon/20">
                      <span className="text-xs text-reset-neon uppercase font-semibold">Variables:</span>
                      <p className="text-sm text-reset-white font-semibold mt-1">
                        {variables.length} detectadas
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Configuración */}
            {variables.length > 0 && (
              <AfiniMapControls
                topN={topN}
                onTopNChange={handleTopNChange}
                ordenarPor={ordenarPor}
                onOrdenarPorChange={handleOrdenarPorChange}
                lineaAfinidad={lineaAfinidad}
                onLineaAfinidadChange={handleLineaAfinidadChange}
                totalVariables={variables.length}
                disabled={loading || generatingGraph}
              />
            )}

            {/* Variables a Mostrar */}
            {variables.length > 0 && (
              <VariableSelector
                variables={dataParaGrafico}
                onToggleVariable={handleToggleVariable}
                onToggleAll={handleToggleAll}
              />
            )}
          </div>

          {/* Main Content - Gráfico */}
          <div className="lg:col-span-3 space-y-4">
            {loading || generatingGraph ? (
              <div className="card-reset-shadow flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <Loader className="animate-spin text-reset-cyan mx-auto mb-4" size={48} />
                  <p className="text-reset-white font-semibold">
                    {loading ? 'Procesando Excel...' : 'Generando gráfico...'}
                  </p>
                </div>
              </div>
            ) : variables.length > 0 ? (
              <>
                {/* Gráfico */}
                <div className="card-reset-shadow animate-fade-in">
                  {graphImage ? (
                    <div ref={chartRef} className="w-full">
                      <img
                        src={graphImage}
                        alt={`AfiniMap - ${targetName}`}
                        className="w-full h-auto"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[600px] text-reset-gray-light">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-lg font-semibold">No hay datos para visualizar</p>
                        <p className="text-sm mt-2">Selecciona al menos 2 variables visibles</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personalización de Colores (DEBAJO DEL GRÁFICO) */}
                <ColorCustomizer
                  colorBurbujas={colorBurbujas}
                  onColorBurbujasChange={handleColorBurbujasChange}
                  colorFondo={colorFondo}
                  onColorFondoChange={handleColorFondoChange}
                  disabled={loading || generatingGraph}
                />

                {/* Botón Actualizar Gráfico */}
                <div className="flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleActualizarGrafico}
                    disabled={loading || generatingGraph}
                    className="btn-primary-large group"
                  >
                    <RefreshCw size={20} className={generatingGraph ? 'animate-spin' : ''} />
                    <span>Actualizar Gráfico</span>
                  </button>
                </div>

                {/* Botón Export */}
                <div className="flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleExport}
                    disabled={exporting || !graphImage}
                    className="btn-primary-large group"
                  >
                    {exporting ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Exportando...</span>
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>Descargar PNG</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="card-reset-shadow flex items-center justify-center min-h-[600px]">
                <div className="text-center text-reset-gray-light">
                  <FileSpreadsheet className="mx-auto mb-4 opacity-50" size={64} />
                  <h3 className="text-xl font-display text-reset-white mb-2">
                    No hay datos cargados
                  </h3>
                  <p className="text-sm">
                    Sube un archivo Excel TGI para comenzar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
