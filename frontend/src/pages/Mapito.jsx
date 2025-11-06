export default function Mapito({ user }) {
  return (
    <div className="section-reset">
      <div className="container-reset max-w-4xl">
        {/* Header */}
        <div className="mb-8 lg:mb-12 animate-fade-in-up">
          <div className="inline-block mb-3">
            <span className="text-reset-neon text-xs sm:text-sm font-bold uppercase tracking-wider">
              // MÓDULO DE MAPAS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-reset-white mb-3 lg:mb-4 leading-tight">
            <span className="text-gradient-neon">MAPITO</span>
          </h1>
          <p className="text-reset-gray-light text-base lg:text-lg">
            Mapas interactivos de Perú
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-center py-16">
            {/* Icon */}
            <div className="mb-8 relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-reset-neon to-green-400 rounded-full flex items-center justify-center mx-auto">
                <div className="absolute inset-0 bg-reset-black opacity-40 rounded-full"></div>
                <span className="relative z-10 text-7xl">🗺️</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-4 border-reset-neon rounded-full opacity-20"></div>
            </div>

            {/* Title */}
            <h2 className="font-display text-4xl text-reset-white mb-4 uppercase">
              Próximamente
            </h2>

            {/* Description */}
            <p className="text-reset-gray-light text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              La funcionalidad de mapas interactivos estará disponible próximamente.
              Podrás visualizar <span className="text-reset-neon font-semibold">regiones</span>, <span className="text-reset-neon font-semibold">provincias</span> y <span className="text-reset-neon font-semibold">distritos</span> de Perú con datos personalizados.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-4">
                <div className="text-reset-neon text-2xl mb-2">📍</div>
                <div className="text-reset-white font-semibold mb-1">Geolocalización</div>
                <div className="text-reset-gray-light text-sm">Ubicación precisa de regiones</div>
              </div>
              <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-4">
                <div className="text-reset-cyan text-2xl mb-2">📊</div>
                <div className="text-reset-white font-semibold mb-1">Visualización</div>
                <div className="text-reset-gray-light text-sm">Datos interactivos en el mapa</div>
              </div>
              <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-4">
                <div className="text-reset-purple text-2xl mb-2">🎨</div>
                <div className="text-reset-white font-semibold mb-1">Personalización</div>
                <div className="text-reset-gray-light text-sm">Colores y métricas customizables</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-reset-gray-dark border-l-4 border-reset-purple rounded-reset p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-reset-purple bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-reset-purple text-xl">🔔</span>
              </div>
            </div>
            <div>
              <h3 className="text-reset-white font-semibold mb-2 uppercase tracking-wide">
                Notificaciones
              </h3>
              <p className="text-reset-gray-light text-sm">
                Te notificaremos cuando este módulo esté disponible. Mientras tanto, puedes seguir usando los demás módulos de la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
