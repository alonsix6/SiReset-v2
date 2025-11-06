import { Link } from 'react-router-dom'

export default function Dashboard({ user }) {
  const modules = [
    {
      code: 'Mougli',
      title: 'MOUGLI',
      description: 'Procesamiento de datos Monitor & OutView',
      icon: '▶',
      gradient: 'from-reset-blue to-reset-cyan',
      borderColor: 'border-reset-cyan',
      path: '/mougli'
    },
    {
      code: 'Mapito',
      title: 'MAPITO',
      description: 'Mapas interactivos de Perú',
      icon: '▶',
      gradient: 'from-reset-neon to-green-400',
      borderColor: 'border-reset-neon',
      path: '/mapito'
    }
  ]

  const userModules = modules.filter(m =>
    user.role === 'admin' || user.modules.includes(m.code)
  )

  return (
    <div className="section-reset">
      <div className="container-reset">
        {/* Hero Section */}
        <div className="mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-reset-neon text-sm font-bold uppercase tracking-wider">
              // DASHBOARD
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl text-reset-white mb-4 leading-tight">
            BIENVENIDO,
            <br />
            <span className="text-gradient-neon">{user.name.toUpperCase()}</span>
          </h1>
          <p className="text-reset-gray-light text-lg max-w-2xl">
            Selecciona una herramienta para comenzar a trabajar con tus datos
          </p>
        </div>

        {/* Modules Grid */}
        {userModules.length === 0 ? (
          <div className="alert-warning animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2 text-2xl">⚠</span>
              <div>
                <p className="font-semibold mb-1">No tienes módulos habilitados</p>
                <p className="text-sm opacity-80">Contacta a un administrador para obtener acceso a las herramientas.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
            {userModules.map((module, index) => (
              <Link
                key={module.code}
                to={module.path}
                className="group card-reset-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Module Header with Gradient */}
                <div className={`h-40 bg-gradient-to-br ${module.gradient} rounded-t-reset flex items-center justify-center mb-6 -mt-6 -mx-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-reset-black opacity-40 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-reset-white text-7xl font-display">{module.icon}</span>
                  </div>
                  {/* Corner decoration */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-reset-white opacity-20"></div>
                </div>

                {/* Module Content */}
                <div>
                  <h3 className="font-display text-3xl text-reset-white mb-3 group-hover:text-gradient-neon transition-all duration-300">
                    {module.title}
                  </h3>
                  <p className="text-reset-gray-light mb-4 leading-relaxed">
                    {module.description}
                  </p>

                  {/* Access Button */}
                  <div className="flex items-center text-reset-neon group-hover:text-reset-cyan transition-colors duration-300">
                    <span className="font-semibold uppercase text-sm tracking-wider mr-2">Acceder</span>
                    <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="divider-reset"></div>

        {/* User Stats */}
        <div>
          <h2 className="font-display text-3xl text-reset-white mb-8 uppercase">
            Información del <span className="text-reset-neon">Usuario</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Stat */}
            <div className="card-reset group hover:border-reset-blue transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                  Email
                </div>
                <div className="w-8 h-8 bg-reset-blue bg-opacity-20 rounded-full flex items-center justify-center border border-reset-blue">
                  <span className="text-reset-blue text-xs">@</span>
                </div>
              </div>
              <div className="text-reset-white text-xl font-semibold break-all">
                {user.email}
              </div>
            </div>

            {/* Role Stat */}
            <div className="card-reset group hover:border-reset-purple transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                  Rol
                </div>
                <div className="w-8 h-8 bg-reset-purple bg-opacity-20 rounded-full flex items-center justify-center border border-reset-purple">
                  <span className="text-reset-purple text-xs">★</span>
                </div>
              </div>
              <div className="text-reset-white text-3xl font-display uppercase">
                {user.role}
              </div>
            </div>

            {/* Modules Stat */}
            <div className="card-reset group hover:border-reset-neon transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                  Módulos Activos
                </div>
                <div className="w-8 h-8 bg-reset-neon bg-opacity-20 rounded-full flex items-center justify-center border border-reset-neon">
                  <span className="text-reset-neon text-xs">▶</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-reset-neon text-5xl font-display font-black">
                  {userModules.length}
                </span>
                <span className="text-reset-gray-light text-sm">
                  / {modules.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-reset-gray-dark border-l-4 border-reset-cyan rounded-reset p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-reset-cyan text-xl">ℹ</span>
              </div>
            </div>
            <div>
              <h3 className="text-reset-white font-semibold mb-2">Información del Sistema</h3>
              <ul className="text-reset-gray-light text-sm space-y-1">
                <li className="flex items-center">
                  <span className="text-reset-cyan mr-2">▶</span>
                  Accede a tus módulos desde la navegación superior
                </li>
                <li className="flex items-center">
                  <span className="text-reset-cyan mr-2">▶</span>
                  Cada módulo tiene funcionalidades específicas para tus necesidades
                </li>
                <li className="flex items-center">
                  <span className="text-reset-cyan mr-2">▶</span>
                  Si necesitas acceso a más módulos, contacta al administrador
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
