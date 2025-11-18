import { useState } from 'react'
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react'

export default function AfiniMapControls({
  topN,
  onTopNChange,
  ordenarPor,
  onOrdenarPorChange,
  lineaAfinidad,
  onLineaAfinidadChange,
  totalVariables,
  disabled
}) {
  const [isOpen, setIsOpen] = useState(true)
  const topOptions = [5, 10, 15, 20]

  return (
    <div className="card-reset-shadow animate-fade-in">
      {/* Header Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Sliders className="text-reset-cyan" size={20} />
          <h3 className="text-lg font-display text-reset-white">
            Configuración
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="text-reset-gray-light" size={20} />
        ) : (
          <ChevronDown className="text-reset-gray-light" size={20} />
        )}
      </button>

      {/* Contenido Colapsable */}
      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          {/* Top N Variables con Botones */}
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2">
              Mostrar Variables
            </label>
            <div className="grid grid-cols-3 gap-2">
              {topOptions.map(option => (
                <button
                  key={option}
                  onClick={() => onTopNChange(option)}
                  disabled={disabled || totalVariables < option}
                  className={`px-3 py-2 rounded border transition-all text-sm font-semibold ${
                    topN === option
                      ? 'bg-reset-cyan/20 border-reset-cyan text-reset-cyan'
                      : 'bg-reset-gray-dark border-reset-gray-light/30 text-reset-gray-light hover:border-reset-cyan/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Top {option}
                </button>
              ))}
              <button
                onClick={() => onTopNChange(totalVariables)}
                disabled={disabled || totalVariables === 0}
                className={`px-3 py-2 rounded border transition-all text-sm font-semibold ${
                  topN === totalVariables
                    ? 'bg-reset-neon/20 border-reset-neon text-reset-neon'
                    : 'bg-reset-gray-dark border-reset-gray-light/30 text-reset-gray-light hover:border-reset-neon/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Todas
              </button>
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
        </div>
      )}
    </div>
  )
}
