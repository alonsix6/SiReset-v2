import { useState } from 'react'
import axios from 'axios'

export default function Mougli({ user }) {
  const [monitorFiles, setMonitorFiles] = useState([])
  const [outviewFiles, setOutviewFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error' | 'info'

  const handleProcess = async () => {
    if (monitorFiles.length === 0 && outviewFiles.length === 0) {
      setMessage('Por favor, sube al menos un archivo')
      setMessageType('error')
      return
    }

    setProcessing(true)
    setMessage('Procesando archivos...')
    setMessageType('info')

    try {
      const formData = new FormData()

      monitorFiles.forEach(file => {
        formData.append('monitor_files', file)
      })

      outviewFiles.forEach(file => {
        formData.append('outview_files', file)
      })

      const token = localStorage.getItem('token')

      const response = await axios.post('/api/mougli/process', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      })

      // Descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'SiReset_Mougli.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()

      setMessage('¡Archivo procesado exitosamente!')
      setMessageType('success')
      setMonitorFiles([])
      setOutviewFiles([])
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.detail || error.message))
      setMessageType('error')
    } finally {
      setProcessing(false)
    }
  }

  const clearMonitorFiles = () => {
    setMonitorFiles([])
    setMessage('')
  }

  const clearOutviewFiles = () => {
    setOutviewFiles([])
    setMessage('')
  }

  return (
    <div className="section-reset">
      <div className="container-reset max-w-5xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-reset-cyan text-sm font-bold uppercase tracking-wider">
              // MÓDULO DE PROCESAMIENTO
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl text-reset-white mb-4 leading-tight">
            <span className="text-gradient-neon">MOUGLI</span>
          </h1>
          <p className="text-reset-gray-light text-lg">
            Procesamiento de archivos Monitor & OutView
          </p>
        </div>

        {/* Main Processing Card */}
        <div className="card-reset-shadow mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monitor Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-reset-white uppercase tracking-wider">
                  <span className="text-reset-blue mr-2">▶</span>
                  Archivos Monitor
                </label>
                {monitorFiles.length > 0 && (
                  <button
                    onClick={clearMonitorFiles}
                    className="text-xs text-reset-magenta hover:text-reset-white transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".txt"
                  multiple
                  onChange={(e) => setMonitorFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="monitor-upload"
                />
                <label
                  htmlFor="monitor-upload"
                  className="block w-full px-6 py-8 border-2 border-dashed border-reset-blue rounded-reset bg-reset-blue bg-opacity-5 hover:bg-opacity-10 cursor-pointer transition-all group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                    <div className="text-reset-blue font-semibold mb-1">
                      Click para subir
                    </div>
                    <div className="text-reset-gray-light text-sm">
                      Archivos .txt de Monitor
                    </div>
                  </div>
                </label>
              </div>

              {monitorFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-reset-gray-light uppercase tracking-wider">
                    {monitorFiles.length} archivo(s) seleccionado(s)
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-reset">
                    {monitorFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm bg-reset-gray-dark px-3 py-2 rounded-reset-sm"
                      >
                        <span className="text-reset-blue">▶</span>
                        <span className="text-reset-white truncate flex-1">{file.name}</span>
                        <span className="text-reset-gray-light text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* OutView Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-reset-white uppercase tracking-wider">
                  <span className="text-reset-neon mr-2">▶</span>
                  Archivos OutView
                </label>
                {outviewFiles.length > 0 && (
                  <button
                    onClick={clearOutviewFiles}
                    className="text-xs text-reset-magenta hover:text-reset-white transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  multiple
                  onChange={(e) => setOutviewFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="outview-upload"
                />
                <label
                  htmlFor="outview-upload"
                  className="block w-full px-6 py-8 border-2 border-dashed border-reset-neon rounded-reset bg-reset-neon bg-opacity-5 hover:bg-opacity-10 cursor-pointer transition-all group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                    <div className="text-reset-neon font-semibold mb-1">
                      Click para subir
                    </div>
                    <div className="text-reset-gray-light text-sm">
                      Archivos .csv o .xlsx de OutView
                    </div>
                  </div>
                </label>
              </div>

              {outviewFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-reset-gray-light uppercase tracking-wider">
                    {outviewFiles.length} archivo(s) seleccionado(s)
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-reset">
                    {outviewFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm bg-reset-gray-dark px-3 py-2 rounded-reset-sm"
                      >
                        <span className="text-reset-neon">▶</span>
                        <span className="text-reset-white truncate flex-1">{file.name}</span>
                        <span className="text-reset-gray-light text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-reset-gray-medium to-transparent"></div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={processing}
            className={`w-full ${processing ? 'btn-disabled' : 'btn-primary'} text-base`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                Procesando archivos...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">⚡</span>
                Procesar Archivos
              </div>
            )}
          </button>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 animate-fade-in ${
              messageType === 'success' ? 'alert-success' :
              messageType === 'error' ? 'alert-error' :
              'alert-info'
            }`}>
              <div className="flex items-center">
                <span className="mr-2 text-xl">
                  {messageType === 'success' ? '✓' : messageType === 'error' ? '✗' : 'ℹ'}
                </span>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="bg-reset-gray-dark border-l-4 border-reset-cyan rounded-reset p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-reset-cyan text-xl">📋</span>
              </div>
            </div>
            <div>
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                Instrucciones de Uso
              </h3>
              <ul className="text-reset-gray-light text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                  <span>Sube archivos Monitor (.txt) y/o OutView (.csv/.xlsx)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                  <span>Puedes subir múltiples archivos de cada tipo simultáneamente</span>
                </li>
                <li className="flex items-start">
                  <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                  <span>El sistema aplicará los factores de conversión configurados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                  <span>Recibirás un archivo Excel con los datos procesados y consolidados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
