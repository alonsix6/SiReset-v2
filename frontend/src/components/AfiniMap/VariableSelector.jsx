import { useState } from 'react'
import { CheckSquare, Square, Filter, Eye, EyeOff } from 'lucide-react'

export default function VariableSelector({ variables, onToggleVariable, onToggleAll }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVariables = variables.filter(variable =>
    variable.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allVisible = variables.every(v => v.visible)
  const someVisible = variables.some(v => v.visible)

  const visibleCount = variables.filter(v => v.visible).length
  const totalCount = variables.length

  return (
    <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-reset-purple" size={20} />
          <h3 className="text-lg font-display text-reset-white">
            Variables a mostrar
          </h3>
        </div>
        <span className="badge-neon text-xs">
          {visibleCount} / {totalCount}
        </span>
      </div>

      {/* Búsqueda */}
      {variables.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar variable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none text-sm"
          />
        </div>
      )}

      {/* Toggle all */}
      {variables.length > 0 && (
        <>
          <button
            onClick={onToggleAll}
            className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-reset-gray-dark hover:bg-reset-gray-medium transition-colors border border-reset-gray-light/20"
          >
            <div className="flex items-center gap-2">
              {allVisible ? (
                <CheckSquare className="text-reset-neon" size={18} />
              ) : someVisible ? (
                <Square className="text-reset-cyan" size={18} />
              ) : (
                <Square className="text-reset-gray-light" size={18} />
              )}
              <span className="text-sm font-semibold text-reset-white">
                {allVisible ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </span>
            </div>
            {allVisible ? (
              <EyeOff className="text-reset-magenta" size={16} />
            ) : (
              <Eye className="text-reset-neon" size={16} />
            )}
          </button>

          <div className="divider-reset"></div>
        </>
      )}

      {/* Lista de variables */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {variables.length === 0 ? (
          <div className="text-center py-8 text-reset-gray-light">
            <Filter className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No hay variables disponibles</p>
            <p className="text-xs mt-1">Carga un archivo Excel TGI para comenzar</p>
          </div>
        ) : filteredVariables.length === 0 ? (
          <div className="text-center py-4 text-reset-gray-light">
            <p className="text-sm">No se encontraron variables</p>
            <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
          </div>
        ) : (
          filteredVariables.map((variable) => (
            <label
              key={variable.nombre}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                ${variable.visible
                  ? 'bg-reset-gray-dark hover:bg-reset-gray-medium border border-reset-neon/20'
                  : 'bg-reset-gray-dark/30 hover:bg-reset-gray-dark/50 border border-transparent'
                }
              `}
            >
              <input
                type="checkbox"
                checked={variable.visible}
                onChange={() => onToggleVariable(variable.nombre)}
                className="hidden"
              />

              {variable.visible ? (
                <CheckSquare className="text-reset-neon flex-shrink-0" size={18} />
              ) : (
                <Square className="text-reset-gray-light flex-shrink-0" size={18} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm font-semibold truncate
                    ${variable.visible ? 'text-reset-white' : 'text-reset-gray-light'}
                  `}>
                    {variable.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-reset-gray-light">
                    Consumo: {variable.consumo.toFixed(1)}%
                  </span>
                  <span className="text-xs text-reset-gray-light">
                    Afinidad: {variable.afinidad.toFixed(0)}
                  </span>
                </div>
              </div>

              {variable.visible && (
                <Eye className="text-reset-neon flex-shrink-0" size={16} />
              )}
            </label>
          ))
        )}
      </div>
    </div>
  )
}
