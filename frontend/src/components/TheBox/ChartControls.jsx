import { Palette, Target } from 'lucide-react'

export default function ChartControls({
  analysisType,
  onAnalysisTypeChange,
  colorOnline,
  colorOffline,
  onColorOnlineChange,
  onColorOfflineChange,
  highlightedMedio,
  onHighlightChange,
  highlightColor,
  onHighlightColorChange,
  medios,
  disabled
}) {
  const analysisTypes = [
    { value: 'all', label: 'Completo', description: 'Online + ATL' },
    { value: 'online', label: 'Solo Online', description: 'Medios digitales' },
    { value: 'offline', label: 'Solo ATL', description: 'Medios tradicionales' }
  ]

  return (
    <div className="space-y-4">
      {/* Tipo de análisis */}
      <div className="card-reset-shadow animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-reset-neon" size={20} />
          <h3 className="text-lg font-display text-reset-white">
            Tipo de análisis
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          {analysisTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onAnalysisTypeChange(type.value)}
              disabled={disabled}
              className={`
                px-4 py-3 rounded-lg transition-all text-left
                ${analysisType === type.value
                  ? 'bg-reset-neon text-reset-black font-bold'
                  : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium border border-reset-gray-light/20'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{type.label}</span>
                <span className="text-xs opacity-70">{type.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="text-reset-cyan" size={20} />
          <h3 className="text-lg font-display text-reset-white">
            Personalización
          </h3>
        </div>

        <div className="space-y-4">
          {/* Color Online */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Online
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorOnline}
                onChange={(e) => onColorOnlineChange(e.target.value)}
                disabled={disabled}
                className="w-16 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorOnline.toUpperCase()}
                onChange={(e) => onColorOnlineChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-neon focus:outline-none disabled:opacity-50"
                placeholder="#00FF85"
              />
            </div>
          </div>

          {/* Color Offline */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Offline (ATL)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorOffline}
                onChange={(e) => onColorOfflineChange(e.target.value)}
                disabled={disabled}
                className="w-16 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorOffline.toUpperCase()}
                onChange={(e) => onColorOfflineChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-cyan focus:outline-none disabled:opacity-50"
                placeholder="#00E5FF"
              />
            </div>
          </div>

          {/* Divisor */}
          <div className="divider-reset"></div>

          {/* Resaltar medio específico */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Resaltar medio
            </label>
            <select
              value={highlightedMedio}
              onChange={(e) => onHighlightChange(e.target.value)}
              disabled={disabled || medios.length === 0}
              className="w-full bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-magenta focus:outline-none disabled:opacity-50 mb-2"
            >
              <option value="">Ninguno</option>
              {medios
                .filter(m => m.visible)
                .map((medio) => (
                  <option key={medio.nombre} value={medio.nombre}>
                    {medio.nombre} ({medio.tipo})
                  </option>
                ))}
            </select>

            {highlightedMedio && (
              <div className="flex items-center gap-3 mt-2 animate-fade-in">
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => onHighlightColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-16 h-10 rounded cursor-pointer border-2 border-reset-magenta disabled:opacity-50"
                />
                <input
                  type="text"
                  value={highlightColor.toUpperCase()}
                  onChange={(e) => onHighlightColorChange(e.target.value)}
                  disabled={disabled}
                  className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-magenta/50 focus:border-reset-magenta focus:outline-none disabled:opacity-50"
                  placeholder="#FF0080"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      {disabled && (
        <div className="alert-info text-xs">
          💡 Carga un archivo Excel para activar los controles
        </div>
      )}
    </div>
  )
}
