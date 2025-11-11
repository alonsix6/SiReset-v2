import { useState } from 'react'
import axios from 'axios'

export default function Mougli({ user }) {
  const [monitorFile, setMonitorFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleMonitorChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar extensión
      if (!file.name.endsWith('.txt')) {
        setError('El archivo debe ser .txt')
        setMonitorFile(null)
        return
      }

      // Validar tamaño (100MB)
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setError(`Archivo muy grande (${sizeMB.toFixed(1)}MB). Máximo: 100MB`)
        setMonitorFile(null)
        return
      }

      setMonitorFile(file)
      setError('')
      setSuccess('')
    }
  }

  const procesarMonitor = async () => {
    if (!monitorFile) {
      setError('Por favor selecciona un archivo Monitor')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('monitor', monitorFile)

      const response = await axios.post(
        '/api/mougli/procesar-monitor',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          responseType: 'blob'
        }
      )

      // Descargar Excel
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Monitor_Procesado.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setSuccess('Archivo procesado exitosamente')
      setMonitorFile(null)
      // Reset file input
      document.getElementById('monitor-input').value = ''

    } catch (err) {
      console.error('Error procesando Monitor:', err)

      if (err.response?.data instanceof Blob) {
        // Convertir Blob a texto para leer el mensaje de error
        const text = await err.response.data.text()
        try {
          const errorData = JSON.parse(text)
          setError(errorData.detail || 'Error procesando archivo')
        } catch {
          setError('Error procesando archivo. Por favor verifica el formato.')
        }
      } else {
        setError(err.response?.data?.detail || 'Error procesando archivo. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-reset">
      <div className="container-reset max-w-5xl">
        {/* Header */}
        <div className="mb-8 lg:mb-12 animate-fade-in-up">
          <div className="inline-block mb-3">
            <span className="text-reset-cyan text-xs sm:text-sm font-bold uppercase tracking-wider">
              // PROCESADOR DE INVERSIÓN PUBLICITARIA
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-reset-white mb-3 lg:mb-4 leading-tight">
            MOUGLI
          </h1>
          <p className="text-reset-gray-light text-base lg:text-lg max-w-2xl">
            Procesa archivos Monitor de Kantar Ibope Media (TV, Cable, Radio, Revista, Diarios)
          </p>
        </div>

        {/* Main Card */}
        <div className="card-reset-shadow mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Info Box */}
          <div className="bg-reset-gray-dark border-l-4 border-reset-cyan rounded-reset p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-reset-cyan text-xl">ℹ</span>
                </div>
              </div>
              <div>
                <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                  Información del Procesador
                </h3>
                <ul className="text-reset-gray-light text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Input:</span> Archivo .txt pipe-delimited de Kantar Ibope
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Output:</span> Excel con inversión factorizada y metadatos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Factorización:</span> TV (0.255), Cable (0.425), Radio (0.425), Revista/Diarios (0.14875)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Tamaño máximo:</span> 100MB
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Monitor File Upload */}
          <div>
            <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-4 lg:mb-6 uppercase">
              Procesar <span className="text-reset-cyan">Monitor</span>
            </h2>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label htmlFor="monitor-input" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                  Archivo Monitor (.txt)
                </label>
                <input
                  id="monitor-input"
                  type="file"
                  accept=".txt"
                  onChange={handleMonitorChange}
                  disabled={loading}
                  className="block w-full text-sm text-reset-gray-light
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-reset-sm file:border-0
                    file:text-sm file:font-semibold file:uppercase file:tracking-wide
                    file:bg-reset-cyan file:text-reset-black
                    hover:file:bg-opacity-80
                    file:cursor-pointer
                    cursor-pointer
                    bg-reset-gray-dark border border-reset-gray-medium rounded-reset
                    focus:outline-none focus:border-reset-cyan
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {monitorFile && (
                  <p className="mt-2 text-sm text-reset-neon">
                    ✓ Archivo seleccionado: {monitorFile.name} ({(monitorFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert-error animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">⚠</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 text-green-500 p-4 rounded-reset animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">✓</span>
                    <span className="font-semibold">{success}</span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={procesarMonitor}
                disabled={!monitorFile || loading}
                className={`w-full ${loading || !monitorFile ? 'btn-disabled' : 'btn-primary'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Procesar Monitor'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Feature 1 */}
          <div className="card-reset group hover:border-reset-cyan transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Factorización
              </div>
              <div className="w-8 h-8 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center border border-reset-cyan">
                <span className="text-reset-cyan text-xs">×</span>
              </div>
            </div>
            <p className="text-reset-white text-sm leading-relaxed">
              Aplica factores de conversión estándar del mercado peruano a las tarifas impresas
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-reset group hover:border-reset-magenta transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Metadatos
              </div>
              <div className="w-8 h-8 bg-reset-magenta bg-opacity-20 rounded-full flex items-center justify-center border border-reset-magenta">
                <span className="text-reset-magenta text-xs">📊</span>
              </div>
            </div>
            <p className="text-reset-white text-sm leading-relaxed">
              Genera estadísticas automáticas: rango de fechas, marcas, sectores, categorías
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-reset group hover:border-reset-neon transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Columnas Derivadas
              </div>
              <div className="w-8 h-8 bg-reset-neon bg-opacity-20 rounded-full flex items-center justify-center border border-reset-neon">
                <span className="text-reset-neon text-xs">+</span>
              </div>
            </div>
            <p className="text-reset-white text-sm leading-relaxed">
              Agrega automáticamente columnas de AÑO, MES (español), y SEMANA para análisis
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-reset-gray-dark border-l-4 border-reset-purple rounded-reset p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-reset-purple bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-reset-purple text-xl">⚙</span>
              </div>
            </div>
            <div>
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                Detalles Técnicos
              </h3>
              <div className="text-reset-gray-light text-sm space-y-2">
                <p>
                  <span className="text-reset-purple font-semibold">Medios soportados:</span> TV, Cable, Radio, Revista, Diarios, Suplemento
                </p>
                <p>
                  <span className="text-reset-purple font-semibold">Encoding:</span> UTF-8, Latin-1, CP1252, ISO-8859-1 (detección automática)
                </p>
                <p>
                  <span className="text-reset-purple font-semibold">Formato output:</span> Excel (.xlsx) con 39 columnas ordenadas
                </p>
                <p>
                  <span className="text-reset-purple font-semibold">Provincias:</span> Filas con inversión = 0 se mantienen (datos de Kantar)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
