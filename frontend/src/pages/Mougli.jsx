import { useState } from 'react'
import axios from 'axios'

export default function Mougli({ user }) {
  const [monitorFile, setMonitorFile] = useState(null)
  const [outviewFile, setOutviewFile] = useState(null)
  const [monitorFileConsolidado, setMonitorFileConsolidado] = useState(null)
  const [outviewFileConsolidado, setOutviewFileConsolidado] = useState(null)
  const [loadingMonitor, setLoadingMonitor] = useState(false)
  const [loadingOutview, setLoadingOutview] = useState(false)
  const [loadingConsolidado, setLoadingConsolidado] = useState(false)
  const [errorMonitor, setErrorMonitor] = useState('')
  const [errorOutview, setErrorOutview] = useState('')
  const [errorConsolidado, setErrorConsolidado] = useState('')
  const [successMonitor, setSuccessMonitor] = useState('')
  const [successOutview, setSuccessOutview] = useState('')
  const [successConsolidado, setSuccessConsolidado] = useState('')

  const handleMonitorChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar extensión
      if (!file.name.endsWith('.txt')) {
        setErrorMonitor('El archivo debe ser .txt')
        setMonitorFile(null)
        return
      }

      // Validar tamaño (100MB)
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setErrorMonitor(`Archivo muy grande (${sizeMB.toFixed(1)}MB). Máximo: 100MB`)
        setMonitorFile(null)
        return
      }

      setMonitorFile(file)
      setErrorMonitor('')
      setSuccessMonitor('')
    }
  }

  const handleOutviewChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar extensión
      if (!file.name.endsWith('.xlsx')) {
        setErrorOutview('El archivo debe ser .xlsx')
        setOutviewFile(null)
        return
      }

      // Validar tamaño (100MB)
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setErrorOutview(`Archivo muy grande (${sizeMB.toFixed(1)}MB). Máximo: 100MB`)
        setOutviewFile(null)
        return
      }

      setOutviewFile(file)
      setErrorOutview('')
      setSuccessOutview('')
    }
  }

  const procesarMonitor = async () => {
    if (!monitorFile) {
      setErrorMonitor('Por favor selecciona un archivo Monitor')
      return
    }

    setLoadingMonitor(true)
    setErrorMonitor('')
    setSuccessMonitor('')

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

      setSuccessMonitor('Archivo procesado exitosamente')
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
          setErrorMonitor(errorData.detail || 'Error procesando archivo')
        } catch {
          setErrorMonitor('Error procesando archivo. Por favor verifica el formato.')
        }
      } else {
        setErrorMonitor(err.response?.data?.detail || 'Error procesando archivo. Intenta de nuevo.')
      }
    } finally {
      setLoadingMonitor(false)
    }
  }

  const procesarOutview = async () => {
    if (!outviewFile) {
      setErrorOutview('Por favor selecciona un archivo OutView')
      return
    }

    setLoadingOutview(true)
    setErrorOutview('')
    setSuccessOutview('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('outview', outviewFile)

      const response = await axios.post(
        '/api/mougli/procesar-outview',
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
      link.setAttribute('download', 'OutView_Procesado.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setSuccessOutview('Archivo procesado exitosamente')
      setOutviewFile(null)
      // Reset file input
      document.getElementById('outview-input').value = ''

    } catch (err) {
      console.error('Error procesando OutView:', err)

      if (err.response?.data instanceof Blob) {
        // Convertir Blob a texto para leer el mensaje de error
        const text = await err.response.data.text()
        try {
          const errorData = JSON.parse(text)
          setErrorOutview(errorData.detail || 'Error procesando archivo')
        } catch {
          setErrorOutview('Error procesando archivo. Por favor verifica el formato.')
        }
      } else {
        setErrorOutview(err.response?.data?.detail || 'Error procesando archivo. Intenta de nuevo.')
      }
    } finally {
      setLoadingOutview(false)
    }
  }

  const handleMonitorConsolidadoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.txt')) {
        setErrorConsolidado('Monitor debe ser .txt')
        setMonitorFileConsolidado(null)
        return
      }

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setErrorConsolidado(`Monitor muy grande (${sizeMB.toFixed(1)}MB). Máximo: 100MB`)
        setMonitorFileConsolidado(null)
        return
      }

      setMonitorFileConsolidado(file)
      setErrorConsolidado('')
      setSuccessConsolidado('')
    }
  }

  const handleOutviewConsolidadoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        setErrorConsolidado('OutView debe ser .xlsx')
        setOutviewFileConsolidado(null)
        return
      }

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > 100) {
        setErrorConsolidado(`OutView muy grande (${sizeMB.toFixed(1)}MB). Máximo: 100MB`)
        setOutviewFileConsolidado(null)
        return
      }

      setOutviewFileConsolidado(file)
      setErrorConsolidado('')
      setSuccessConsolidado('')
    }
  }

  const procesarConsolidado = async () => {
    if (!monitorFileConsolidado && !outviewFileConsolidado) {
      setErrorConsolidado('Por favor selecciona al menos un archivo')
      return
    }

    setLoadingConsolidado(true)
    setErrorConsolidado('')
    setSuccessConsolidado('')

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      if (monitorFileConsolidado) {
        formData.append('monitor', monitorFileConsolidado)
      }
      if (outviewFileConsolidado) {
        formData.append('outview', outviewFileConsolidado)
      }

      const response = await axios.post(
        '/api/mougli/procesar-consolidado',
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
      link.setAttribute('download', 'SiReset_Mougli.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      let mensaje = 'Excel generado exitosamente'
      if (monitorFileConsolidado && outviewFileConsolidado) {
        mensaje += ' con 3 hojas (Monitor, OutView, Consolidado)'
      } else if (monitorFileConsolidado) {
        mensaje += ' con 1 hoja (Monitor)'
      } else {
        mensaje += ' con 1 hoja (OutView)'
      }

      setSuccessConsolidado(mensaje)
      setMonitorFileConsolidado(null)
      setOutviewFileConsolidado(null)

      // Reset file inputs
      const monitorInput = document.getElementById('monitor-consolidado-input')
      const outviewInput = document.getElementById('outview-consolidado-input')
      if (monitorInput) monitorInput.value = ''
      if (outviewInput) outviewInput.value = ''

    } catch (err) {
      console.error('Error procesando Consolidado:', err)

      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text()
        try {
          const errorData = JSON.parse(text)
          setErrorConsolidado(errorData.detail || 'Error procesando archivos')
        } catch {
          setErrorConsolidado('Error procesando archivos. Por favor verifica el formato.')
        }
      } else {
        setErrorConsolidado(err.response?.data?.detail || 'Error procesando archivos. Intenta de nuevo.')
      }
    } finally {
      setLoadingConsolidado(false)
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
            Procesa archivos Monitor (ATL) y OutView (OOH) de Kantar Ibope Media
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
              {errorMonitor && (
                <div className="alert-error animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">⚠</span>
                    <span>{errorMonitor}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMonitor && (
                <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 text-green-500 p-4 rounded-reset animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">✓</span>
                    <span className="font-semibold">{successMonitor}</span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={procesarMonitor}
                disabled={!monitorFile || loadingMonitor}
                className={`w-full ${loadingMonitor || !monitorFile ? 'btn-disabled' : 'btn-primary'}`}
              >
                {loadingMonitor ? (
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

        {/* OutView Card */}
        <div className="card-reset-shadow mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Info Box */}
          <div className="bg-reset-gray-dark border-l-4 border-reset-magenta rounded-reset p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-reset-magenta bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-reset-magenta text-xl">ℹ</span>
                </div>
              </div>
              <div>
                <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                  Información del Procesador OutView
                </h3>
                <ul className="text-reset-gray-light text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-reset-magenta mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Input:</span> Archivo .xlsx de Kantar Ibope (publicidad exterior)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-magenta mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Output:</span> Excel con tarifas calculadas en 9 pasos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-magenta mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Cálculo:</span> Denominadores diarios/mensuales, topes por elemento, factores LED/Otros
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-magenta mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Tamaño máximo:</span> 100MB
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* OutView File Upload */}
          <div>
            <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-4 lg:mb-6 uppercase">
              Procesar <span className="text-reset-magenta">OutView</span>
            </h2>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label htmlFor="outview-input" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                  Archivo OutView (.xlsx)
                </label>
                <input
                  id="outview-input"
                  type="file"
                  accept=".xlsx"
                  onChange={handleOutviewChange}
                  disabled={loadingOutview}
                  className="block w-full text-sm text-reset-gray-light
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-reset-sm file:border-0
                    file:text-sm file:font-semibold file:uppercase file:tracking-wide
                    file:bg-reset-magenta file:text-reset-black
                    hover:file:bg-opacity-80
                    file:cursor-pointer
                    cursor-pointer
                    bg-reset-gray-dark border border-reset-gray-medium rounded-reset
                    focus:outline-none focus:border-reset-magenta
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {outviewFile && (
                  <p className="mt-2 text-sm text-reset-neon">
                    ✓ Archivo seleccionado: {outviewFile.name} ({(outviewFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errorOutview && (
                <div className="alert-error animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">⚠</span>
                    <span>{errorOutview}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successOutview && (
                <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 text-green-500 p-4 rounded-reset animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">✓</span>
                    <span className="font-semibold">{successOutview}</span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={procesarOutview}
                disabled={!outviewFile || loadingOutview}
                className={`w-full ${loadingOutview || !outviewFile ? 'btn-disabled' : 'bg-reset-magenta text-reset-black font-bold py-3 px-6 rounded-reset-sm uppercase tracking-wide hover:bg-opacity-80 transition-all duration-200'}`}
              >
                {loadingOutview ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Procesar OutView'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Consolidado Card */}
        <div className="card-reset-shadow mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Info Box */}
          <div className="bg-reset-gray-dark border-l-4 border-reset-purple rounded-reset p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-reset-purple bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-reset-purple text-xl">⭐</span>
                </div>
              </div>
              <div>
                <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                  Procesador Consolidado (Recomendado)
                </h3>
                <ul className="text-reset-gray-light text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-reset-purple mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Input:</span> Monitor (.txt) y/o OutView (.xlsx) - Uno o ambos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-purple mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Output:</span> Excel con 1-3 hojas según archivos subidos
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-purple mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Ambos archivos:</span> Genera 3 hojas (Monitor, OutView, Consolidado)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-reset-purple mr-2 mt-0.5">▶</span>
                    <div>
                      <span className="font-semibold">Consolidado:</span> 27 columnas híbridas unificando ATL + OOH
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consolidado File Uploads */}
          <div>
            <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-4 lg:mb-6 uppercase">
              Procesar <span className="text-reset-purple">Consolidado</span>
            </h2>

            <div className="space-y-6">
              {/* Monitor File Input */}
              <div>
                <label htmlFor="monitor-consolidado-input" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                  Archivo Monitor (.txt) - Opcional
                </label>
                <input
                  id="monitor-consolidado-input"
                  type="file"
                  accept=".txt"
                  onChange={handleMonitorConsolidadoChange}
                  disabled={loadingConsolidado}
                  className="block w-full text-sm text-reset-gray-light
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-reset-sm file:border-0
                    file:text-sm file:font-semibold file:uppercase file:tracking-wide
                    file:bg-reset-purple file:text-reset-black
                    hover:file:bg-opacity-80
                    file:cursor-pointer
                    cursor-pointer
                    bg-reset-gray-dark border border-reset-gray-medium rounded-reset
                    focus:outline-none focus:border-reset-purple
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {monitorFileConsolidado && (
                  <p className="mt-2 text-sm text-reset-neon">
                    ✓ Monitor: {monitorFileConsolidado.name} ({(monitorFileConsolidado.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* OutView File Input */}
              <div>
                <label htmlFor="outview-consolidado-input" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                  Archivo OutView (.xlsx) - Opcional
                </label>
                <input
                  id="outview-consolidado-input"
                  type="file"
                  accept=".xlsx"
                  onChange={handleOutviewConsolidadoChange}
                  disabled={loadingConsolidado}
                  className="block w-full text-sm text-reset-gray-light
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-reset-sm file:border-0
                    file:text-sm file:font-semibold file:uppercase file:tracking-wide
                    file:bg-reset-purple file:text-reset-black
                    hover:file:bg-opacity-80
                    file:cursor-pointer
                    cursor-pointer
                    bg-reset-gray-dark border border-reset-gray-medium rounded-reset
                    focus:outline-none focus:border-reset-purple
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {outviewFileConsolidado && (
                  <p className="mt-2 text-sm text-reset-neon">
                    ✓ OutView: {outviewFileConsolidado.name} ({(outviewFileConsolidado.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errorConsolidado && (
                <div className="alert-error animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">⚠</span>
                    <span>{errorConsolidado}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successConsolidado && (
                <div className="bg-green-500 bg-opacity-10 border-l-4 border-green-500 text-green-500 p-4 rounded-reset animate-fade-in">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">✓</span>
                    <span className="font-semibold">{successConsolidado}</span>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={procesarConsolidado}
                disabled={(!monitorFileConsolidado && !outviewFileConsolidado) || loadingConsolidado}
                className={`w-full ${loadingConsolidado || (!monitorFileConsolidado && !outviewFileConsolidado) ? 'btn-disabled' : 'bg-reset-purple text-reset-black font-bold py-3 px-6 rounded-reset-sm uppercase tracking-wide hover:bg-opacity-80 transition-all duration-200'}`}
              >
                {loadingConsolidado ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Procesar Consolidado'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
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
