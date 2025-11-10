import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'

export default function FileUploader({ onFileUpload, fileName, onClear }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    // Validar que sea un archivo Excel
    const validExtensions = ['.xlsx', '.xls']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor, sube un archivo Excel válido (.xlsx o .xls)')
      return
    }

    onFileUpload(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card-reset-shadow animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-reset-white">
          📁 Cargar datos
        </h3>
        {fileName && (
          <button
            onClick={onClear}
            className="text-reset-magenta hover:text-reset-white transition-colors"
            title="Limpiar archivo"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!fileName ? (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${isDragging
                ? 'border-reset-neon bg-reset-neon/10'
                : 'border-reset-gray-light hover:border-reset-cyan'
              }
            `}
            onClick={handleButtonClick}
          >
            <div className="flex flex-col items-center gap-3">
              <Upload
                size={48}
                className={isDragging ? 'text-reset-neon' : 'text-reset-gray-light'}
              />
              <div>
                <p className="text-reset-white font-semibold mb-1">
                  Arrastra tu archivo aquí
                </p>
                <p className="text-reset-gray-light text-sm">
                  o haz clic para seleccionar
                </p>
              </div>
              <span className="text-xs text-reset-cyan">
                Formato: .xlsx o .xls
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-reset-gray-dark rounded-lg border border-reset-neon/30">
          <FileSpreadsheet className="text-reset-neon flex-shrink-0" size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-reset-white font-semibold text-sm truncate" title={fileName}>
              {fileName}
            </p>
            <span className="text-xs text-reset-cyan">
              Archivo cargado correctamente
            </span>
          </div>
        </div>
      )}

      {fileName && (
        <button
          onClick={handleButtonClick}
          className="btn-secondary w-full mt-3 text-sm"
        >
          Cambiar archivo
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
