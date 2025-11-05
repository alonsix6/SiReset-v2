import { Link } from 'react-router-dom'

export default function Dashboard({ user }) {
  const modules = [
    {
      code: 'Mougli',
      title: 'Mougli',
      description: 'Procesamiento de datos Monitor & OutView',
      icon: '📊',
      color: 'bg-blue-500',
      path: '/mougli'
    },
    {
      code: 'Mapito',
      title: 'Mapito',
      description: 'Mapas interactivos de Perú',
      icon: '🗺️',
      color: 'bg-green-500',
      path: '/mapito'
    }
  ]

  const userModules = modules.filter(m =>
    user.role === 'admin' || user.modules.includes(m.code)
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Selecciona una herramienta para comenzar
        </p>
      </div>

      {userModules.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            No tienes módulos habilitados. Contacta a un administrador para obtener acceso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModules.map((module) => (
            <Link
              key={module.code}
              to={module.path}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className={`${module.color} h-32 flex items-center justify-center`}>
                <span className="text-6xl">{module.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-600">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Usuario</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{user.email}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Rol</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 capitalize">{user.role}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Módulos activos</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{userModules.length}</div>
        </div>
      </div>
    </div>
  )
}
