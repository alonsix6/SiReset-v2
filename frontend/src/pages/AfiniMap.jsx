import { useState, useEffect } from 'react'
import { Upload, Download, Loader, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function AfiniMap({ user }) {
  // Estados principales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  // Datos del Excel procesado
  const [targetName, setTargetName] = useState('')
  const [variables, setVariables] = useState([])

  // Imagen del gráfico
  const [graficoUrl, setGraficoUrl] = useState('')
  const [generandoGrafico, setGenerandoGrafico] = useState(false)

  // Configuración
  const [topN, setTopN] = useState(10)
  const [ordenarPor, setOrdenarPor] = useState('consumo') // 'consumo' | 'afinidad'
  const [lineaAfinidad, setLineaAfinidad] = useState(110)
  const [colorBurbujas, setColorBurbujas] = useState('#cf3b4d')
  const [colorFondo, setColorFondo] = useState('#fff2f4')

  // ========== PROCESAMIENTO EXCEL (EN FRONTEND - COMO THE BOX) ==========

  const processExcelData = (jsonData) => {
    setLoading(true)
    setError('')

    try {
      // 1. Extraer target de Fila 5 (índice 4), Columna D (índice 3)
      const target = jsonData[4]?.[3] || 'Target no especificado'
      setTargetName(String(target).trim())

      const extractedVariables = []

      // 2. Procesar desde fila 8 (índice 7)
      for (let i = 7; i < jsonData.length; i++) {
        const row = jsonData[i]
        const tipoMetrica = row[1] // Columna B

        // Verificar si es una fila "Vert%"
        if (tipoMetrica === 'Vert%') {
          // Verificar que la siguiente fila sea "Afinidad"
          const nextRow = jsonData[i + 1]
          if (nextRow && nextRow[1] === 'Afinidad') {
            const nombre = row[0] || ''  // Columna A
            const consumoRaw = row[3]    // Columna D
            const afinidadRaw = nextRow[3] // Columna D de siguiente fila

            // Convertir consumo (puede ser "48.1%" o 0.481)
            let consumo = 0
            if (typeof consumoRaw === 'string' && consumoRaw.includes('%')) {
              consumo = parseFloat(consumoRaw.replace('%', '')) / 100
            } else if (typeof consumoRaw === 'number') {
              consumo = consumoRaw
            } else if (typeof consumoRaw === 'string') {
              consumo = parseFloat(consumoRaw)
            }

            // Convertir afinidad
            const afinidad = parseFloat(afinidadRaw)

            // Solo agregar si valores válidos y consumo > 0
            if (!isNaN(consumo) && !isNaN(afinidad) && consumo > 0 && nombre) {
              extractedVariables.push({
                nombre: String(nombre).trim(),
                consumo: consumo,
                afinidad: afinidad,
                visible: true
              })
            }

            i++  // Saltar la fila de Afinidad ya procesada
          }
        }
      }

      if (extractedVariables.length === 0) {
        setError('No se encontraron variables válidas en el Excel. Verifica la estructura TGI.')
        setLoading(false)
        return
      }

      setVariables(extractedVariables)
      setLoading(false)

      // Generar gráfico inicial
      setTimeout(() => {
        actualizarGrafico(extractedVariables)
      }, 100)

    } catch (err) {
      console.error('Error procesando Excel:', err)
      setError(`Error procesando el archivo: ${err.message}`)
      setLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar extensión
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

        // Leer la primera hoja (no importa el nombre)
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
      setError('Error leyendo el archivo')
      setLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const handleClearFile = () => {
    setFileName('')
    setVariables([])
    setTargetName('')
    setGraficoUrl('')
    setError('')
  }

  // ========== COMPUTED VALUES ==========

  const variablesOrdenadas = () => {
    if (!variables.length) return []

    let vars = [...variables]

    // Ordenar
    if (ordenarPor === 'consumo') {
      vars.sort((a, b) => b.consumo - a.consumo)
    } else {
      vars.sort((a, b) => b.afinidad - a.afinidad)
    }

    // Aplicar Top N
    const limit = topN === variables.length ? variables.length : topN
    return vars.slice(0, limit)
  }

  const variablesVisibles = variables.filter(v => v.visible).length

  // ========== GENERACIÓN DE GRÁFICO ==========

  const actualizarGrafico = async (varsToUse = null) => {
    const vars = varsToUse || variablesOrdenadas()
    const visibles = vars.filter(v => v.visible)

    if (visibles.length < 2) {
      setGraficoUrl('')
      return
    }

    setGenerandoGrafico(true)
    setError('')

    try {
      const config = {
        variables: visibles,
        target_name: targetName,
        linea_afinidad: lineaAfinidad,
        color_burbujas: colorBurbujas,
        color_fondo: colorFondo
      }

      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/afinimap/generar-grafico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })  // Token opcional
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`Error generando gráfico: ${response.statusText}`)
      }

      const blob = await response.blob()

      // Revocar URL anterior si existe
      if (graficoUrl) {
        URL.revokeObjectURL(graficoUrl)
      }

      const newUrl = URL.createObjectURL(blob)
      setGraficoUrl(newUrl)

    } catch (err) {
      console.error('Error generando gráfico:', err)
      setError(err.message || 'Error generando el gráfico')
    } finally {
      setGenerandoGrafico(false)
    }
  }

  const toggleVariable = (index) => {
    const newVars = [...variables]
    newVars[index].visible = !newVars[index].visible
    setVariables(newVars)
  }

  const toggleTodas = () => {
    const todasVisibles = variablesVisibles === variables.length
    const newVars = variables.map(v => ({ ...v, visible: !todasVisibles }))
    setVariables(newVars)
  }

  const descargarPNG = () => {
    if (!graficoUrl) return

    const a = document.createElement('a')
    a.href = graficoUrl
    const fecha = new Date().toISOString().split('T')[0]
    a.download = `afinimap_${targetName}_${fecha}.png`
    a.click()
  }

  // Actualizar gráfico cuando cambian los controles
  useEffect(() => {
    if (variables.length > 0) {
      actualizarGrafico()
    }
  }, [topN, ordenarPor, lineaAfinidad, colorBurbujas, colorFondo])

  // Actualizar gráfico cuando cambian visibilidad de variables
  useEffect(() => {
    if (variables.length > 0) {
      const timer = setTimeout(() => {
        actualizarGrafico()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [variables])

  // ========== RENDER (estilo The Box) ==========

  return (
    <div className="section-reset">
      <div className="container-reset max-w-7xl">

        {/* Header - Igual que The Box */}
        <div className="mb-8 animate-fade-in-up">
          <span className="text-reset-neon text-xs uppercase font-semibold tracking-wider">
            // HERRAMIENTA DE ANÁLISIS
          </span>
          <h1 className="font-display text-4xl lg:text-6xl text-reset-white mt-2">
            AFINI<span className="text-gradient-neon">MAP</span>
          </h1>
          <p className="text-reset-gray-light text-lg mt-2">
            Mapas de afinidad TGI - Scatter plots de consumo y afinidad
          </p>
        </div>

        {/* Alert de error */}
        {error && (
          <div className="alert-error mb-6 animate-fade-in">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Grid principal - 1 columna sidebar + 3 columnas gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR - Controles (1 columna) */}
          <div className="lg:col-span-1 space-y-4">

            {/* Upload */}
            <div className="card-reset-shadow animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="text-reset-neon" size={20} />
                <h3 className="text-lg font-display text-reset-white">
                  Subir Excel TGI
                </h3>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="block w-full text-sm text-reset-white
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:bg-reset-neon file:text-reset-black
                            file:font-semibold file:uppercase file:text-xs file:tracking-wider
                            hover:file:bg-opacity-80
                            file:cursor-pointer
                            cursor-pointer
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-reset-gray-medium rounded-lg p-2 border border-reset-gray-light/20"
                />
              </div>

              {fileName && (
                <div className="mt-3 flex items-center justify-between p-2 bg-reset-gray-dark rounded-lg border border-reset-neon/30">
                  <span className="text-xs text-reset-neon truncate">{fileName}</span>
                  <button
                    onClick={handleClearFile}
                    className="text-xs text-reset-gray-light hover:text-reset-white ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Target detectado */}
            {targetName && (
              <div className="card-reset-shadow bg-reset-neon/10 border border-reset-neon animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-reset-neon text-lg">🎯</span>
                  <h3 className="text-sm font-display text-reset-neon uppercase">
                    Target Detectado
                  </h3>
                </div>
                <p className="text-reset-white font-semibold">{targetName}</p>
                <p className="text-xs text-reset-gray-light mt-1">
                  {variables.length} variables encontradas
                </p>
              </div>
            )}

            {/* Controles de visualización */}
            {variables.length > 0 && (
              <>
                <div className="card-reset-shadow animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-reset-cyan text-lg">⚙️</span>
                    <h3 className="text-lg font-display text-reset-white">
                      Configuración
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Top N */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-reset-cyan">
                        Mostrar Top N
                      </label>
                      <select
                        value={topN}
                        onChange={(e) => setTopN(Number(e.target.value))}
                        className="w-full bg-reset-gray-medium border border-reset-gray-light/20 rounded-lg px-3 py-2 text-reset-white focus:outline-none focus:border-reset-cyan"
                      >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={15}>Top 15</option>
                        <option value={20}>Top 20</option>
                        <option value={variables.length}>Todas ({variables.length})</option>
                      </select>
                    </div>

                    {/* Ordenar */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-reset-cyan">
                        Ordenar por
                      </label>
                      <select
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                        className="w-full bg-reset-gray-medium border border-reset-gray-light/20 rounded-lg px-3 py-2 text-reset-white focus:outline-none focus:border-reset-cyan"
                      >
                        <option value="consumo">Consumo ↓</option>
                        <option value="afinidad">Afinidad ↓</option>
                      </select>
                    </div>

                    {/* Línea afinidad */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-reset-purple">
                        Línea de afinidad base
                      </label>
                      <input
                        type="number"
                        value={lineaAfinidad}
                        onChange={(e) => setLineaAfinidad(Number(e.target.value))}
                        className="w-full bg-reset-gray-medium border border-reset-gray-light/20 rounded-lg px-3 py-2 text-reset-white focus:outline-none focus:border-reset-purple"
                        min="50"
                        max="200"
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de variables */}
                <div className="card-reset-shadow animate-fade-in-up">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-reset-magenta text-lg">📊</span>
                      <h3 className="text-lg font-display text-reset-white">
                        Variables
                      </h3>
                    </div>
                    <span className="text-xs text-reset-magenta font-semibold">
                      {variablesVisibles} visibles
                    </span>
                  </div>

                  <button
                    onClick={toggleTodas}
                    className="w-full mb-3 px-3 py-2 bg-reset-gray-dark hover:bg-reset-gray-medium border border-reset-magenta/30 rounded-lg text-sm text-reset-magenta font-semibold transition-all"
                  >
                    {variablesVisibles === variables.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>

                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {variablesOrdenadas().map((v, i) => {
                      const originalIndex = variables.findIndex(
                        variable => variable.nombre === v.nombre
                      )
                      return (
                        <label
                          key={i}
                          className="flex items-start gap-2 p-2 hover:bg-reset-gray-medium rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={v.visible}
                            onChange={() => toggleVariable(originalIndex)}
                            className="mt-1 accent-reset-neon"
                          />
                          <div className="flex-1 text-sm">
                            <p className="text-reset-white font-medium leading-tight">{v.nombre}</p>
                            <p className="text-xs text-reset-gray-light">
                              {(v.consumo * 100).toFixed(1)}% • Aff: {v.afinidad.toFixed(0)}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Personalización de colores */}
                <div className="card-reset-shadow animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-reset-purple text-lg">🎨</span>
                    <h3 className="text-lg font-display text-reset-white">
                      Estilo
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Color burbujas */}
                    <div>
                      <label className="block text-xs text-reset-gray-light mb-1">
                        Color burbujas
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={colorBurbujas}
                          onChange={(e) => setColorBurbujas(e.target.value)}
                          className="h-9 w-14 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorBurbujas}
                          onChange={(e) => setColorBurbujas(e.target.value)}
                          className="flex-1 bg-reset-gray-medium border border-reset-gray-light/20 rounded-lg px-2 py-1 text-sm text-reset-white focus:outline-none focus:border-reset-purple"
                        />
                      </div>
                    </div>

                    {/* Color fondo */}
                    <div>
                      <label className="block text-xs text-reset-gray-light mb-1">
                        Color fondo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={colorFondo}
                          onChange={(e) => setColorFondo(e.target.value)}
                          className="h-9 w-14 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorFondo}
                          onChange={(e) => setColorFondo(e.target.value)}
                          className="flex-1 bg-reset-gray-medium border border-reset-gray-light/20 rounded-lg px-2 py-1 text-sm text-reset-white focus:outline-none focus:border-reset-purple"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón descarga */}
                <button
                  onClick={descargarPNG}
                  disabled={generandoGrafico || !graficoUrl || variablesVisibles < 2}
                  className="btn-primary w-full animate-fade-in-up flex items-center justify-center gap-2"
                >
                  {generandoGrafico ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Descargar PNG</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* MAIN - Gráfico (3 columnas) */}
          <div className="lg:col-span-3">
            <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

              {/* Loading */}
              {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <Loader className="animate-spin text-reset-neon mx-auto mb-4" size={48} />
                    <p className="text-reset-white text-lg font-semibold">
                      Procesando archivo TGI...
                    </p>
                    <p className="text-reset-gray-light text-sm mt-2">
                      Extrayendo variables de consumo y afinidad
                    </p>
                  </div>
                </div>

              /* Estado inicial */
              ) : variables.length === 0 ? (
                <div className="flex items-center justify-center h-[600px] text-reset-gray-light">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-display text-reset-white mb-2">
                      Comienza cargando tus datos TGI
                    </h3>
                    <p className="text-sm mb-6">
                      Sube un archivo Excel TGI de Kantar Ibope Media para generar el mapa de afinidad
                    </p>

                    {/* Requisitos del archivo */}
                    <div className="p-4 bg-reset-gray-dark rounded-lg border border-reset-cyan/30 text-left">
                      <p className="text-xs text-reset-cyan font-semibold mb-2 uppercase tracking-wider">
                        📋 Estructura del Excel TGI:
                      </p>
                      <ul className="text-xs space-y-1 text-reset-gray-light">
                        <li>• <strong>Formato:</strong> .xlsx o .xls</li>
                        <li>• <strong>Hoja:</strong> Cualquier nombre (se lee la primera hoja activa)</li>
                        <li>• <strong>Fila 5, Columna D:</strong> Nombre del target</li>
                        <li>• <strong>Desde fila 8:</strong> Pares de filas con Vert% y Afinidad</li>
                        <li className="pt-2 text-reset-neon">
                          • Cada variable ocupa 2 filas:
                          <br />
                          &nbsp;&nbsp;→ Fila N: [Nombre] | "Vert%" | Consumo%
                          <br />
                          &nbsp;&nbsp;→ Fila N+1: [vacío] | "Afinidad" | Índice
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

              /* Gráfico */
              ) : (
                <>
                  {graficoUrl && !generandoGrafico ? (
                    <img
                      src={graficoUrl}
                      alt="AfiniMap"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : generandoGrafico ? (
                    <div className="flex items-center justify-center h-[600px]">
                      <div className="text-center">
                        <Loader className="animate-spin text-reset-neon mx-auto mb-4" size={48} />
                        <p className="text-reset-white text-lg font-semibold">
                          Generando gráfico...
                        </p>
                        <p className="text-reset-gray-light text-sm mt-2">
                          {variablesVisibles} variables • {targetName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[600px] text-reset-gray-light">
                      <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Selecciona al menos 2 variables para generar el gráfico</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info adicional */}
            {variables.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-neon/20 animate-fade-in">
                  <div className="text-center">
                    <p className="text-reset-neon text-3xl font-display">
                      {variablesVisibles}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Variables visibles
                    </p>
                  </div>
                </div>
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-cyan/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="text-center">
                    <p className="text-reset-cyan text-3xl font-display">
                      {variables.length}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Total detectadas
                    </p>
                  </div>
                </div>
                <div className="card-reset bg-reset-gray-dark/50 border border-reset-purple/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-center">
                    <p className="text-reset-purple text-3xl font-display">
                      {targetName.substring(0, 12)}{targetName.length > 12 ? '...' : ''}
                    </p>
                    <p className="text-reset-gray-light text-sm mt-1">
                      Target
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
