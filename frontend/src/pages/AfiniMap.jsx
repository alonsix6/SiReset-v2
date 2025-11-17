import { useState, useEffect } from 'react'
import { Upload, Download, Loader, AlertCircle, CheckCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function AfiniMap({ user }) {
  // Estados principales
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Datos del Excel procesado
  const [targetName, setTargetName] = useState('')
  const [variables, setVariables] = useState([])
  const [datosListos, setDatosListos] = useState(false)

  // Imagen del gráfico
  const [graficoUrl, setGraficoUrl] = useState('')
  const [generandoGrafico, setGenerandoGrafico] = useState(false)

  // Configuración
  const [topN, setTopN] = useState(10)
  const [ordenarPor, setOrdenarPor] = useState('consumo') // 'consumo' | 'afinidad'
  const [lineaAfinidad, setLineaAfinidad] = useState(110)
  const [colorBurbujas, setColorBurbujas] = useState('#cf3b4d')
  const [colorFondo, setColorFondo] = useState('#fff2f4')

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

  // ========== FUNCIONES ==========

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar extensión
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor sube un archivo Excel (.xlsx o .xls)')
      return
    }

    // Validar tamaño (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('Archivo muy grande. Máximo: 50MB')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('excel', file)

      const token = localStorage.getItem('supabase.auth.token')

      const response = await fetch(`${API_URL}/api/afinimap/procesar-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error procesando archivo')
      }

      const data = await response.json()

      setTargetName(data.target_name)
      setVariables(data.variables)
      setDatosListos(true)
      setSuccess(`¡Excel procesado! ${data.variables.length} variables detectadas para target "${data.target_name}"`)

      // Generar gráfico inicial automáticamente
      setTimeout(() => {
        actualizarGrafico(data.variables)
      }, 100)

    } catch (err) {
      console.error('Error subiendo archivo:', err)
      setError(err.message || 'Error procesando el archivo Excel')
      setDatosListos(false)
    } finally {
      setLoading(false)
    }
  }

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

      const token = localStorage.getItem('supabase.auth.token')

      const response = await fetch(`${API_URL}/api/afinimap/generar-grafico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error generando gráfico')
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
    if (datosListos && variables.length > 0) {
      actualizarGrafico()
    }
  }, [topN, ordenarPor, lineaAfinidad, colorBurbujas, colorFondo])

  // Actualizar gráfico cuando cambian visibilidad de variables
  useEffect(() => {
    if (datosListos && variables.length > 0) {
      const timer = setTimeout(() => {
        actualizarGrafico()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [variables])

  // ========== RENDER ==========

  return (
    <div className="min-h-screen bg-reset-black text-reset-white">
      {/* Container principal */}
      <div className="flex h-screen">

        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-96 bg-reset-gray-dark border-r border-reset-gray-medium overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gradient-neon mb-2">AfiniMap</h1>
              <p className="text-sm text-reset-gray-light">
                Generador de Mapas de Afinidad TGI
              </p>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-reset-neon">
                📁 Subir Excel TGI
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="block w-full text-sm text-reset-white
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:bg-reset-neon file:text-reset-black
                            file:font-semibold
                            hover:file:bg-opacity-80
                            file:cursor-pointer
                            cursor-pointer
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-reset-gray-medium rounded-lg p-2"
                />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <Loader className="animate-spin h-8 w-8 text-reset-neon mx-auto" />
                <p className="text-sm text-reset-gray-light mt-2">Procesando Excel...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              </div>
            )}

            {/* Configuración (solo si hay datos) */}
            {datosListos && !loading && (
              <div className="space-y-6">

                {/* Target detectado */}
                <div className="bg-reset-neon bg-opacity-10 border border-reset-neon rounded-lg p-3">
                  <p className="text-sm font-medium text-reset-neon">
                    🎯 Target: {targetName}
                  </p>
                  <p className="text-xs text-reset-gray-light">
                    {variables.length} variables detectadas
                  </p>
                </div>

                {/* Controles */}
                <div className="space-y-4">

                  {/* Top N */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-reset-cyan">
                      Mostrar Top N:
                    </label>
                    <select
                      value={topN}
                      onChange={(e) => setTopN(Number(e.target.value))}
                      className="w-full bg-reset-gray-medium border border-reset-gray-light rounded-lg px-3 py-2 text-reset-white focus:outline-none focus:border-reset-cyan"
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
                    <label className="block text-sm font-medium mb-1 text-reset-cyan">
                      Ordenar por:
                    </label>
                    <select
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                      className="w-full bg-reset-gray-medium border border-reset-gray-light rounded-lg px-3 py-2 text-reset-white focus:outline-none focus:border-reset-cyan"
                    >
                      <option value="consumo">Consumo (mayor a menor)</option>
                      <option value="afinidad">Afinidad (mayor a menor)</option>
                    </select>
                  </div>
                </div>

                {/* Lista de variables */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-reset-magenta">
                      Variables ({variablesVisibles} visibles)
                    </label>
                    <button
                      onClick={toggleTodas}
                      className="text-xs text-reset-cyan hover:underline"
                    >
                      {variablesVisibles === variables.length ? 'Deseleccionar' : 'Seleccionar'} todas
                    </button>
                  </div>

                  <div className="border border-reset-gray-medium rounded-lg max-h-64 overflow-y-auto">
                    {variablesOrdenadas().map((v, i) => {
                      const originalIndex = variables.findIndex(
                        variable => variable.nombre === v.nombre
                      )
                      return (
                        <label
                          key={i}
                          className="flex items-start p-2 hover:bg-reset-gray-medium border-b border-reset-gray-medium last:border-b-0 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={v.visible}
                            onChange={() => toggleVariable(originalIndex)}
                            className="mt-1 mr-2 accent-reset-neon"
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-reset-white">{v.nombre}</p>
                            <p className="text-xs text-reset-gray-light">
                              {(v.consumo * 100).toFixed(1)}% | Aff: {v.afinidad.toFixed(0)}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Estilo */}
                <div>
                  <p className="text-sm font-medium mb-3 text-reset-purple">🎨 Estilo</p>

                  <div className="space-y-3">
                    {/* Línea afinidad */}
                    <div>
                      <label className="block text-xs mb-1 text-reset-gray-light">
                        Línea de afinidad:
                      </label>
                      <input
                        type="number"
                        value={lineaAfinidad}
                        onChange={(e) => setLineaAfinidad(Number(e.target.value))}
                        className="w-full bg-reset-gray-medium border border-reset-gray-light rounded-lg px-2 py-1 text-sm text-reset-white focus:outline-none focus:border-reset-purple"
                        min="50"
                        max="200"
                      />
                    </div>

                    {/* Color burbujas */}
                    <div>
                      <label className="block text-xs mb-1 text-reset-gray-light">
                        Color burbujas:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={colorBurbujas}
                          onChange={(e) => setColorBurbujas(e.target.value)}
                          className="h-8 w-12 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorBurbujas}
                          onChange={(e) => setColorBurbujas(e.target.value)}
                          className="flex-1 bg-reset-gray-medium border border-reset-gray-light rounded-lg px-2 py-1 text-sm text-reset-white focus:outline-none focus:border-reset-purple"
                        />
                      </div>
                    </div>

                    {/* Color fondo */}
                    <div>
                      <label className="block text-xs mb-1 text-reset-gray-light">
                        Color fondo:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={colorFondo}
                          onChange={(e) => setColorFondo(e.target.value)}
                          className="h-8 w-12 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorFondo}
                          onChange={(e) => setColorFondo(e.target.value)}
                          className="flex-1 bg-reset-gray-medium border border-reset-gray-light rounded-lg px-2 py-1 text-sm text-reset-white focus:outline-none focus:border-reset-purple"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón descarga */}
                <button
                  onClick={descargarPNG}
                  disabled={generandoGrafico || !graficoUrl || variablesVisibles < 2}
                  className="w-full bg-gradient-to-r from-reset-neon to-reset-cyan text-reset-black py-3 rounded-lg font-bold
                            hover:opacity-90 transition-opacity
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2"
                >
                  {generandoGrafico ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Descargar PNG
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ÁREA DEL GRÁFICO */}
        <main className="flex-1 p-8 overflow-auto bg-reset-black">

          {/* Estado inicial */}
          {!datosListos && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-reset-gray-light">
                <Upload className="w-24 h-24 mx-auto mb-4 opacity-30" />
                <p className="text-xl">Sube un Excel TGI para empezar</p>
                <p className="text-sm mt-2 opacity-70">
                  Formatos soportados: .xlsx, .xls
                </p>
              </div>
            </div>
          )}

          {/* Gráfico */}
          {datosListos && !loading && (
            <div className="bg-reset-gray-dark rounded-lg shadow-xl p-6 card-reset-shadow">
              {graficoUrl && !generandoGrafico ? (
                <img
                  src={graficoUrl}
                  alt="AfiniMap"
                  className="w-full h-auto rounded-lg"
                />
              ) : generandoGrafico ? (
                <div className="text-center py-24">
                  <Loader className="animate-spin h-12 w-12 text-reset-neon mx-auto" />
                  <p className="text-reset-gray-light mt-4">Generando gráfico...</p>
                </div>
              ) : (
                <div className="text-center py-24 text-reset-gray-light">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona al menos 2 variables para generar el gráfico</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
