import { Palette } from 'lucide-react'

export default function ColorCustomizer({
  colorBurbujas,
  onColorBurbujasChange,
  colorFondo,
  onColorFondoChange,
  disabled
}) {
  return (
    <div className="card-reset-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="text-reset-cyan" size={20} />
        <h3 className="text-lg font-display text-reset-white">
          Personalización de Colores
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Burbujas */}
        <div>
          <label className="block text-sm font-semibold text-reset-white mb-2">
            Color Burbujas
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorBurbujas}
              onChange={(e) => onColorBurbujasChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
            />
            <input
              type="text"
              value={colorBurbujas.toUpperCase()}
              onChange={(e) => onColorBurbujasChange(e.target.value)}
              disabled={disabled}
              className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-neon focus:outline-none disabled:opacity-50 text-sm"
              placeholder="#CF3B4D"
            />
          </div>
        </div>

        {/* Color Fondo */}
        <div>
          <label className="block text-sm font-semibold text-reset-white mb-2">
            Color Fondo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorFondo}
              onChange={(e) => onColorFondoChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 rounded cursor-pointer border-2 border-reset-gray-light disabled:opacity-50"
            />
            <input
              type="text"
              value={colorFondo.toUpperCase()}
              onChange={(e) => onColorFondoChange(e.target.value)}
              disabled={disabled}
              className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none disabled:opacity-50 text-sm"
              placeholder="#FFF2F4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
