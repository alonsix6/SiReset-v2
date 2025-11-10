import { Palette } from 'lucide-react'

export default function ChartControls({
  colorOnline,
  colorOffline,
  onColorOnlineChange,
  onColorOfflineChange,
  highlightedMedio,
  onHighlightChange,
  highlightColor,
  onHighlightColorChange,
  colorTexto,
  onColorTextoChange,
  colorEjeX,
  onColorEjeXChange,
  colorEjeY,
  onColorEjeYChange,
  medios,
  disabled
}) {
  return (
    <div className="card-reset-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="text-reset-cyan" size={24} />
        <h3 className="text-xl font-display text-reset-white">
          Personalización de Colores
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Colores de medios */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-reset-neon uppercase tracking-wide">Medios</h4>

          {/* Color Online */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Online
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorOnline}
                onChange={(e) => onColorOnlineChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorOnline.toUpperCase()}
                onChange={(e) => onColorOnlineChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-neon focus:outline-none disabled:opacity-50 text-sm"
                placeholder="#00FF85"
              />
            </div>
          </div>

          {/* Color Offline */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Offline (ATL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorOffline}
                onChange={(e) => onColorOfflineChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorOffline.toUpperCase()}
                onChange={(e) => onColorOfflineChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-cyan focus:outline-none disabled:opacity-50 text-sm"
                placeholder="#00E5FF"
              />
            </div>
          </div>
        </div>

        {/* Colores de gráfico */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-reset-purple uppercase tracking-wide">Gráfico</h4>

          {/* Color Texto */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Texto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorTexto}
                onChange={(e) => onColorTextoChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorTexto.toUpperCase()}
                onChange={(e) => onColorTextoChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none disabled:opacity-50 text-sm"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Color Eje X */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Eje X
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorEjeX}
                onChange={(e) => onColorEjeXChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorEjeX.toUpperCase()}
                onChange={(e) => onColorEjeXChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none disabled:opacity-50 text-sm"
                placeholder="#AAAAAA"
              />
            </div>
          </div>

          {/* Color Eje Y */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Color Eje Y
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorEjeY}
                onChange={(e) => onColorEjeYChange(e.target.value)}
                disabled={disabled}
                className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
              />
              <input
                type="text"
                value={colorEjeY.toUpperCase()}
                onChange={(e) => onColorEjeYChange(e.target.value)}
                disabled={disabled}
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none disabled:opacity-50 text-sm"
                placeholder="#AAAAAA"
              />
            </div>
          </div>
        </div>

        {/* Resaltar medio */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-reset-magenta uppercase tracking-wide">Resaltar</h4>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Medio a resaltar
            </label>
            <select
              value={highlightedMedio}
              onChange={(e) => onHighlightChange(e.target.value)}
              disabled={disabled || medios.length === 0}
              className="w-full bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-magenta focus:outline-none disabled:opacity-50 text-sm"
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
          </div>

          {highlightedMedio && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-reset-white mb-2">
                Color de resalte
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => onHighlightColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-reset-magenta disabled:opacity-50"
                />
                <input
                  type="text"
                  value={highlightColor.toUpperCase()}
                  onChange={(e) => onHighlightColorChange(e.target.value)}
                  disabled={disabled}
                  className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-magenta/50 focus:border-reset-magenta focus:outline-none disabled:opacity-50 text-sm"
                  placeholder="#FF0080"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
