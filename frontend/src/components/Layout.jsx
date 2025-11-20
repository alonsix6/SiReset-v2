import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

export default function Layout({ user, onLogout, children }) {
  const location = useLocation()
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const dropdownRef = useRef(null)

  // Verificar si el usuario es admin principal
  const isMainAdmin = user?.email === 'admin@reset.com.pe'

  // Apps disponibles - TODAS visibles para todos los usuarios
  const apps = [
    { name: 'Mougli', path: '/mougli', icon: '▶' },
    { name: 'Mapito', path: '/mapito', icon: '▶' },
    { name: 'The Box', path: '/thebox', icon: '▶' },
    { name: 'AfiniMap', path: '/afinimap', icon: '▶' },
  ]

  // Navegación principal (Dashboard)
  const mainNavigation = [
    { name: 'Dashboard', path: '/', icon: '▶' },
  ]

  // Todas las apps son visibles para todos los usuarios
  const visibleApps = apps

  // La navegación principal siempre muestra Dashboard
  const visibleMainNav = mainNavigation

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Verificar si estamos en alguna página de app
  const isInAppPage = apps.some(app => location.pathname === app.path)

  return (
    <div className="min-h-screen bg-reset-black">
      {/* Navbar - Reset Style */}
      <nav className="bg-reset-black border-b border-reset-gray-medium">
        <div className="container-reset">
          <div className="flex items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <span className="font-display text-3xl lg:text-4xl text-reset-white tracking-tight hover:scale-105 transition-transform duration-300">
                  SI<span className="text-reset-neon">RESET</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-1 ml-12">
              {/* Navegación principal */}
              {visibleMainNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-reset-neon text-reset-black'
                      : 'text-reset-white hover:bg-reset-gray-dark hover:text-reset-neon'
                  }`}
                >
                  <span className={`mr-2 text-xs ${
                    location.pathname === item.path ? 'text-reset-black' : 'text-reset-neon'
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}

              {/* Dropdown de Apps */}
              {visibleApps.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsAppsDropdownOpen(!isAppsDropdownOpen)}
                    className={`flex items-center px-4 py-2 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                      isInAppPage
                        ? 'bg-reset-neon text-reset-black'
                        : 'text-reset-white hover:bg-reset-gray-dark hover:text-reset-neon'
                    }`}
                  >
                    <span className={`mr-2 text-xs ${
                      isInAppPage ? 'text-reset-black' : 'text-reset-neon'
                    }`}>
                      ▶
                    </span>
                    Apps
                    <span className={`ml-2 text-xs transition-transform duration-200 ${
                      isAppsDropdownOpen ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isAppsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-reset-gray-dark border border-reset-gray-medium rounded-reset-sm shadow-lg overflow-hidden z-50">
                      {visibleApps.map((app) => (
                        <Link
                          key={app.path}
                          to={app.path}
                          onClick={() => setIsAppsDropdownOpen(false)}
                          className={`flex items-center px-4 py-3 font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                            location.pathname === app.path
                              ? 'bg-reset-neon text-reset-black'
                              : 'text-reset-white hover:bg-reset-gray-darker hover:text-reset-neon'
                          }`}
                        >
                          <span className={`mr-2 text-xs ${
                            location.pathname === app.path ? 'text-reset-black' : 'text-reset-neon'
                          }`}>
                            {app.icon}
                          </span>
                          {app.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón INVITAR (solo para admin@reset.com.pe) */}
              {isMainAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-2 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                    location.pathname === '/admin'
                      ? 'bg-reset-magenta text-reset-black'
                      : 'text-reset-magenta border border-reset-magenta hover:bg-reset-magenta hover:text-reset-black'
                  }`}
                >
                  <span className={`mr-2 text-xs ${
                    location.pathname === '/admin' ? 'text-reset-black' : 'text-reset-magenta'
                  }`}>
                    +
                  </span>
                  Invitar
                </Link>
              )}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4 ml-auto">
              <div className="hidden lg:block text-right max-w-[200px]">
                <div className="text-sm font-body font-semibold text-reset-white truncate">
                  {user.name}
                </div>
                <div className="text-xs text-reset-gray-light uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-reset-sm font-body font-bold text-sm uppercase tracking-wide bg-transparent text-reset-white border border-reset-gray-medium hover:border-reset-magenta hover:text-reset-magenta transition-all duration-200"
              >
                Salir
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {/* Navegación principal móvil */}
              {visibleMainNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-reset-sm font-body font-semibold text-xs uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-reset-neon text-reset-black'
                      : 'text-reset-white hover:bg-reset-gray-dark hover:text-reset-neon border border-reset-gray-medium'
                  }`}
                >
                  <span className={`mr-1.5 text-xs ${
                    location.pathname === item.path ? 'text-reset-black' : 'text-reset-neon'
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}

              {/* Apps individuales en móvil (sin dropdown para mejor UX) */}
              {visibleApps.map((app) => (
                <Link
                  key={app.path}
                  to={app.path}
                  className={`flex items-center px-3 py-2 rounded-reset-sm font-body font-semibold text-xs uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
                    location.pathname === app.path
                      ? 'bg-reset-neon text-reset-black'
                      : 'text-reset-white hover:bg-reset-gray-dark hover:text-reset-neon border border-reset-gray-medium'
                  }`}
                >
                  <span className={`mr-1.5 text-xs ${
                    location.pathname === app.path ? 'text-reset-black' : 'text-reset-neon'
                  }`}>
                    {app.icon}
                  </span>
                  {app.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-5rem)]">{children}</main>

      {/* Footer */}
      <footer className="bg-reset-gray-dark border-t border-reset-gray-medium py-6 mt-12">
        <div className="container-reset">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-reset-gray-light text-sm">
              <span className="font-display text-reset-white">SIRESET</span> v2.0 - Suite de Herramientas
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-reset-gray-light text-sm">Powered by</span>
              <span className="font-display text-reset-neon text-lg">RESEARCH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
