import { Palette, Sliders } from 'lucide-react'

export default function AfiniMapControls({
  colorBurbujas,
  onColorBurbujasChange,
  colorFondo,
  onColorFondoChange,
  highlightedVariable,
  onHighlightChange,
  highlightColor,
  onHighlightColorChange,
  colorTexto,
  onColorTextoChange,
  colorEjeX,
  onColorEjeXChange,
  colorEjeY,
  onColorEjeYChange,
  lineaAfinidad,
  onLineaAfinidadChange,
  topN,
  onTopNChange,
  ordenarPor,
  onOrdenarPorChange,
  variables,
  disabled
}) {
  const totalVariables = variables.length

  return (
    <div className="space-y-6">
      {/* Panel de Configuración */}
      <div className="card-reset-shadow animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Sliders className="text-reset-cyan" size={24} />
          <h3 className="text-xl font-display text-reset-white">
            Configuración
          </h3>
        </div>

        <div className="space-y-4">
          {/* Top N Variables */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Mostrar Top N Variables: {topN === totalVariables ? 'Todas' : topN}
            </label>
            <input
              type="range"
              min="5"
              max={totalVariables}
              value={topN}
              onChange={(e) => onTopNChange(Number(e.target.value))}
              disabled={disabled || totalVariables === 0}
              className="w-full h-2 bg-reset-gray-dark rounded-lg appearance-none cursor-pointer accent-reset-cyan disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-reset-gray-light mt-1">
              <span>5</span>
              <span>{totalVariables}</span>
            </div>
          </div>

          {/* Ordenar Por */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Ordenar por
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOrdenarPorChange('consumo')}
                disabled={disabled}
                className={`px-4 py-2 rounded border transition-all ${
                  ordenarPor === 'consumo'
                    ? 'bg-reset-cyan/20 border-reset-cyan text-reset-cyan font-semibold'
                    : 'bg-reset-gray-dark border-reset-gray-light/30 text-reset-gray-light hover:border-reset-cyan/50'
                } disabled:opacity-50`}
              >
                Consumo
              </button>
              <button
                onClick={() => onOrdenarPorChange('afinidad')}
                disabled={disabled}
                className={`px-4 py-2 rounded border transition-all ${
                  ordenarPor === 'afinidad'
                    ? 'bg-reset-magenta/20 border-reset-magenta text-reset-magenta font-semibold'
                    : 'bg-reset-gray-dark border-reset-gray-light/30 text-reset-gray-light hover:border-reset-magenta/50'
                } disabled:opacity-50`}
              >
                Afinidad
              </button>
            </div>
          </div>

          {/* Línea de Afinidad */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Línea de Afinidad de Referencia
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={lineaAfinidad}
                onChange={(e) => onLineaAfinidadChange(Number(e.target.value))}
                disabled={disabled}
                min="0"
                max="500"
                step="10"
                className="flex-1 bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-neon focus:outline-none disabled:opacity-50 text-sm"
              />
              <span className="text-reset-gray-light text-sm">puntos</span>
            </div>
          </div>

          {/* Resaltar Variable */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Resaltar Variable
            </label>
            <select
              value={highlightedVariable}
              onChange={(e) => onHighlightChange(e.target.value)}
              disabled={disabled || variables.length === 0}
              className="w-full bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-magenta focus:outline-none disabled:opacity-50 text-sm"
            >
              <option value="">Ninguna</option>
              {variables
                .filter(v => v.visible)
                .map((variable) => (
                  <option key={variable.nombre} value={variable.nombre}>
                    {variable.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel de Colores */}
      <div className="card-reset-shadow animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="text-reset-cyan" size={24} />
          <h3 className="text-xl font-display text-reset-white">
            Personalización de Colores
          </h3>
        </div>

        <div className="space-y-6">
          {/* Colores de Burbujas y Fondo */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-reset-neon uppercase tracking-wide">Burbujas y Fondo</h4>

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

          {/* Colores de Texto y Ejes */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-reset-purple uppercase tracking-wide">Texto y Ejes</h4>

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

          {/* Color de Resalte */}
          {highlightedVariable && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-reset-magenta uppercase tracking-wide">Resalte</h4>

              <div>
                <label className="block text-sm font-semibold text-reset-white mb-2">
                  Color de Resalte
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
