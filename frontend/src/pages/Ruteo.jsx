import { ExternalLink, Link2 } from 'lucide-react'

export default function Ruteo({ user }) {
  // Configuración de marcas con sus herramientas de ruteo
  const marcas = [
    {
      id: 'san-fernando',
      nombre: 'San Fernando',
      descripcion: 'Generador de UTMs para campañas San Fernando',
      url: 'https://ruteo-sf.netlify.app/',
      logo: 'SF',
      colorFrom: 'from-red-600',
      colorTo: 'to-red-800',
      borderColor: 'border-red-500',
      activo: true
    },
    {
      id: 'auna',
      nombre: 'Auna',
      descripcion: 'Generador de UTMs para campañas Auna',
      url: null,
      logo: 'AU',
      colorFrom: 'from-blue-500',
      colorTo: 'to-blue-700',
      borderColor: 'border-blue-500',
      activo: false
    },
    {
      id: 'los-andes',
      nombre: 'Los Andes',
      descripcion: 'Generador de UTMs para campañas Los Andes',
      url: null,
      logo: 'LA',
      colorFrom: 'from-emerald-600',
      colorTo: 'to-emerald-800',
      borderColor: 'border-emerald-500',
      activo: false
    },
    {
      id: 'placeholder-1',
      nombre: 'Nueva Marca',
      descripcion: 'Próximamente disponible',
      url: null,
      logo: '+',
      colorFrom: 'from-reset-gray-medium',
      colorTo: 'to-reset-gray-dark',
      borderColor: 'border-reset-gray-medium',
      activo: false
    }
  ]

  const handleOpenLink = (marca) => {
    if (marca.activo && marca.url) {
      window.open(marca.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="section-reset">
      <div className="container-reset max-w-5xl">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-block mb-2">
            <span className="text-reset-neon text-xs sm:text-sm font-bold uppercase tracking-wider">
              // GENERADORES DE UTMs
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-reset-white mb-3 leading-tight">
            <span className="text-gradient-neon">RUTEO</span>
          </h1>
          <p className="text-reset-gray-light text-base lg:text-lg max-w-2xl">
            Herramientas de generación de UTMs organizadas por marca.
            Selecciona una marca para acceder a su generador personalizado.
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-8 bg-reset-gray-dark border-l-4 border-reset-cyan rounded-reset p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Link2 className="w-5 h-5 text-reset-cyan" />
            </div>
            <div>
              <p className="text-reset-gray-light text-sm">
                <strong className="text-reset-white">Importante:</strong> Cada herramienta abre en una nueva pestaña.
                Los UTMs generados son específicos para cada marca y sus campañas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Marcas - 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {marcas.map((marca, index) => (
            <div
              key={marca.id}
              onClick={() => handleOpenLink(marca)}
              className={`
                group relative overflow-hidden rounded-reset border
                ${marca.activo
                  ? `${marca.borderColor} cursor-pointer hover:shadow-lg hover:shadow-${marca.borderColor}/20 hover:scale-[1.02]`
                  : 'border-reset-gray-medium opacity-60 cursor-not-allowed'
                }
                bg-reset-gray-dark transition-all duration-300 animate-fade-in-up
              `}
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-center p-5">
                {/* Logo/Icono de la marca */}
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${marca.colorFrom} ${marca.colorTo}
                  flex items-center justify-center mr-4
                  ${marca.activo ? 'group-hover:scale-110' : ''} transition-transform duration-300
                `}>
                  <span className="font-display text-2xl text-white font-bold">
                    {marca.logo}
                  </span>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-display text-xl text-reset-white mb-1
                    ${marca.activo ? 'group-hover:text-reset-neon' : ''}
                    transition-colors duration-300
                  `}>
                    {marca.nombre}
                  </h3>
                  <p className="text-reset-gray-light text-sm truncate">
                    {marca.descripcion}
                  </p>

                  {/* Estado */}
                  <div className="mt-2 flex items-center">
                    {marca.activo ? (
                      <span className="inline-flex items-center text-xs font-semibold text-reset-neon">
                        <span className="w-2 h-2 bg-reset-neon rounded-full mr-2 animate-pulse"></span>
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-reset-gray-light">
                        <span className="w-2 h-2 bg-reset-gray-light rounded-full mr-2"></span>
                        Próximamente
                      </span>
                    )}
                  </div>
                </div>

                {/* Icono de enlace externo */}
                {marca.activo && (
                  <div className="flex-shrink-0 ml-3">
                    <div className={`
                      w-10 h-10 rounded-full bg-reset-gray-medium/50
                      flex items-center justify-center
                      group-hover:bg-reset-neon group-hover:text-reset-black
                      transition-all duration-300
                    `}>
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de estado inferior */}
              {marca.activo && (
                <div className={`h-1 bg-gradient-to-r ${marca.colorFrom} ${marca.colorTo}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-reset-gray-dark rounded-reset p-4 text-center border border-reset-gray-medium">
            <div className="text-3xl font-display text-reset-neon">
              {marcas.filter(m => m.activo).length}
            </div>
            <div className="text-reset-gray-light text-xs uppercase tracking-wide mt-1">
              Activas
            </div>
          </div>
          <div className="bg-reset-gray-dark rounded-reset p-4 text-center border border-reset-gray-medium">
            <div className="text-3xl font-display text-reset-cyan">
              {marcas.filter(m => !m.activo && m.nombre !== 'Nueva Marca').length}
            </div>
            <div className="text-reset-gray-light text-xs uppercase tracking-wide mt-1">
              En desarrollo
            </div>
          </div>
          <div className="bg-reset-gray-dark rounded-reset p-4 text-center border border-reset-gray-medium">
            <div className="text-3xl font-display text-reset-purple">
              {marcas.length}
            </div>
            <div className="text-reset-gray-light text-xs uppercase tracking-wide mt-1">
              Total marcas
            </div>
          </div>
          <div className="bg-reset-gray-dark rounded-reset p-4 text-center border border-reset-gray-medium">
            <div className="text-3xl font-display text-reset-magenta">
              UTM
            </div>
            <div className="text-reset-gray-light text-xs uppercase tracking-wide mt-1">
              Generadores
            </div>
          </div>
        </div>

        {/* Nota adicional */}
        <div className="mt-8 text-center text-reset-gray-light text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p>
            ¿Necesitas un generador para una nueva marca?
            <span className="text-reset-cyan ml-1">Contacta al equipo de Research</span>
          </p>
        </div>
      </div>
    </div>
  )
}
