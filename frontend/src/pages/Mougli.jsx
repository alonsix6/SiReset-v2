import { useState } from 'react'
import axios from 'axios'

export default function Mougli({ user }) {
  const [monitorFiles, setMonitorFiles] = useState([])
  const [outviewFiles, setOutviewFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const handleProcess = async () => {
    if (monitorFiles.length === 0 && outviewFiles.length === 0) {
      setMessage('Por favor, sube al menos un archivo')
      return
    }

    setProcessing(true)
    setMessage('Procesando archivos...')

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
      setMonitorFiles([])
      setOutviewFiles([])
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.detail || error.message))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mougli</h1>
      <p className="text-gray-600 mb-8">Procesamiento de archivos Monitor & OutView</p>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monitor Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos Monitor (.txt)
            </label>
            <input
              type="file"
              accept=".txt"
              multiple
              onChange={(e) => setMonitorFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {monitorFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {monitorFiles.length} archivo(s) seleccionado(s)
              </p>
            )}
          </div>

          {/* OutView Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos OutView (.csv, .xlsx)
            </label>
            <input
              type="file"
              accept=".csv,.xlsx"
              multiple
              onChange={(e) => setOutviewFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {outviewFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {outviewFiles.length} archivo(s) seleccionado(s)
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={processing}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Procesando...' : 'Procesar Archivos'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Instrucciones</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sube archivos Monitor (.txt) y/o OutView (.csv/.xlsx)</li>
          <li>• Puedes subir múltiples archivos de cada tipo</li>
          <li>• El sistema aplicará los factores de conversión configurados</li>
          <li>• Recibirás un archivo Excel con los datos procesados</li>
        </ul>
      </div>
    </div>
  )
}
