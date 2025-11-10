import { useState } from 'react'
import { CheckSquare, Square, Filter, Eye, EyeOff } from 'lucide-react'

export default function MediaSelector({ medios, onToggleMedio, onToggleAll }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMedios = medios.filter(medio =>
    medio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allVisible = medios.every(m => m.visible)
  const someVisible = medios.some(m => m.visible)

  const visibleCount = medios.filter(m => m.visible).length
  const totalCount = medios.length

  const onlineCount = medios.filter(m => m.tipo === 'online' && m.visible).length
  const offlineCount = medios.filter(m => m.tipo === 'offline' && m.visible).length

  return (
    <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-reset-purple" size={20} />
          <h3 className="text-lg font-display text-reset-white">
            Medios a mostrar
          </h3>
        </div>
        <span className="badge-neon text-xs">
          {visibleCount} / {totalCount}
        </span>
      </div>

      {/* Búsqueda */}
      {medios.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar medio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-reset-gray-dark text-reset-white px-3 py-2 rounded border border-reset-gray-light/30 focus:border-reset-purple focus:outline-none text-sm"
          />
        </div>
      )}

      {/* Toggle all */}
      {medios.length > 0 && (
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
                {allVisible ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </span>
            </div>
            {allVisible ? (
              <EyeOff className="text-reset-magenta" size={16} />
            ) : (
              <Eye className="text-reset-neon" size={16} />
            )}
          </button>

          {/* Contador por tipo */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-reset-gray-dark/50 px-2 py-1 rounded text-center">
              <span className="text-reset-neon text-xs font-semibold">Online: {onlineCount}</span>
            </div>
            <div className="flex-1 bg-reset-gray-dark/50 px-2 py-1 rounded text-center">
              <span className="text-reset-cyan text-xs font-semibold">ATL: {offlineCount}</span>
            </div>
          </div>

          <div className="divider-reset"></div>
        </>
      )}

      {/* Lista de medios */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {medios.length === 0 ? (
          <div className="text-center py-8 text-reset-gray-light">
            <Filter className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No hay medios disponibles</p>
            <p className="text-xs mt-1">Carga un archivo Excel para comenzar</p>
          </div>
        ) : filteredMedios.length === 0 ? (
          <div className="text-center py-4 text-reset-gray-light">
            <p className="text-sm">No se encontraron medios</p>
            <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
          </div>
        ) : (
          filteredMedios.map((medio) => (
            <label
              key={medio.nombre}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                ${medio.visible
                  ? 'bg-reset-gray-dark hover:bg-reset-gray-medium border border-reset-neon/20'
                  : 'bg-reset-gray-dark/30 hover:bg-reset-gray-dark/50 border border-transparent'
                }
              `}
            >
              <input
                type="checkbox"
                checked={medio.visible}
                onChange={() => onToggleMedio(medio.nombre)}
                className="hidden"
              />

              {medio.visible ? (
                <CheckSquare className="text-reset-neon flex-shrink-0" size={18} />
              ) : (
                <Square className="text-reset-gray-light flex-shrink-0" size={18} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm font-semibold truncate
                    ${medio.visible ? 'text-reset-white' : 'text-reset-gray-light'}
                  `}>
                    {medio.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`
                    text-xs px-2 py-0.5 rounded
                    ${medio.tipo === 'online'
                      ? 'bg-reset-neon/20 text-reset-neon'
                      : 'bg-reset-cyan/20 text-reset-cyan'
                    }
                  `}>
                    {medio.tipo}
                  </span>
                  <span className="text-xs text-reset-gray-light">
                    HC: {(medio.HC * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {medio.visible && (
                <Eye className="text-reset-neon flex-shrink-0" size={16} />
              )}
            </label>
          ))
        )}
      </div>
    </div>
  )
}
