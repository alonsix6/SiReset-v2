import { Link, useLocation } from 'react-router-dom'

export default function Layout({ user, onLogout, children }) {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Mougli', path: '/mougli', icon: '📊', module: 'Mougli' },
    { name: 'Mapito', path: '/mapito', icon: '🗺️', module: 'Mapito' },
  ]

  const visibleNav = navigation.filter(item =>
    !item.module || user.role === 'admin' || user.modules.includes(item.module)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-purple-600">SiReset</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {visibleNav.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} <span className="text-gray-400">({user.role})</span>
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
