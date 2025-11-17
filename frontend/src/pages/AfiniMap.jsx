import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { toPng } from 'html-to-image'
import { Download, Loader, Upload, FileSpreadsheet, X } from 'lucide-react'

import AfiniMapChart from '../components/AfiniMap/AfiniMapChart'
import AfiniMapControls from '../components/AfiniMap/AfiniMapControls'
import VariableSelector from '../components/AfiniMap/VariableSelector'
import ColorCustomizer from '../components/AfiniMap/ColorCustomizer'

export default function AfiniMap({ user }) {
  // Estados principales
  const [fileName, setFileName] = useState('')
  const [targetName, setTargetName] = useState('')
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

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

          // Si el valor está en formato decimal (entre 0 y 1), multiplicar por 100
          // Excel guarda porcentajes como decimales (0.34 en lugar de 34%)
          if (consumo > 0 && consumo < 1) {
            consumo = consumo * 100
          }

          const nextRow = jsonData[i + 1]
          if (nextRow && nextRow[1] === 'Afinidad') {
            let afinidadRaw = nextRow[3]
            let afinidad = parseFloat(afinidadRaw)

            // Afinidad también puede venir como decimal en algunos casos
            if (afinidad > 0 && afinidad < 1) {
              afinidad = afinidad * 100
            }

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

      setVariables(extractedVariables)
      setTopN(Math.min(10, extractedVariables.length))
      setLoading(false)
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
  }

  const handleToggleVariable = (nombreVariable) => {
    const updatedVariables = variables.map(variable =>
      variable.nombre === nombreVariable
        ? { ...variable, visible: !variable.visible }
        : variable
    )
    setVariables(updatedVariables)
  }

  const handleToggleAll = () => {
    const allVisible = variables.every(v => v.visible)
    const updatedVariables = variables.map(variable => ({
      ...variable,
      visible: !allVisible
    }))
    setVariables(updatedVariables)
  }

  const handleExport = async () => {
    if (!chartRef.current) return

    setExporting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: colorFondo,
        pixelRatio: 3,
        quality: 1
      })

      const link = document.createElement('a')
      link.download = `afinimap-${targetName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      link.href = dataUrl
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
                onTopNChange={setTopN}
                ordenarPor={ordenarPor}
                onOrdenarPorChange={setOrdenarPor}
                lineaAfinidad={lineaAfinidad}
                onLineaAfinidadChange={setLineaAfinidad}
                totalVariables={variables.length}
                disabled={loading}
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
            {loading ? (
              <div className="card-reset-shadow flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <Loader className="animate-spin text-reset-cyan mx-auto mb-4" size={48} />
                  <p className="text-reset-white font-semibold">Procesando Excel...</p>
                </div>
              </div>
            ) : variables.length > 0 ? (
              <>
                {/* Gráfico */}
                <div className="card-reset-shadow animate-fade-in">
                  <AfiniMapChart
                    ref={chartRef}
                    data={dataParaGrafico}
                    targetName={targetName}
                    colorBurbujas={colorBurbujas}
                    colorFondo={colorFondo}
                    lineaAfinidad={lineaAfinidad}
                  />
                </div>

                {/* Personalización de Colores (DEBAJO DEL GRÁFICO) */}
                <ColorCustomizer
                  colorBurbujas={colorBurbujas}
                  onColorBurbujasChange={setColorBurbujas}
                  colorFondo={colorFondo}
                  onColorFondoChange={setColorFondo}
                  disabled={loading}
                />

                {/* Botón Export */}
                <div className="flex justify-center animate-fade-in-up">
                  <button
                    onClick={handleExport}
                    disabled={exporting}
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
                        <span>Descargar PNG (300 DPI)</span>
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
