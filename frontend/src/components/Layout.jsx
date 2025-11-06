import { Link, useLocation } from 'react-router-dom'

export default function Layout({ user, onLogout, children }) {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '▶', module: null },
    { name: 'Mougli', path: '/mougli', icon: '▶', module: 'Mougli' },
    { name: 'Mapito', path: '/mapito', icon: '▶', module: 'Mapito' },
    { name: 'Admin', path: '/admin', icon: '▶', adminOnly: true },
  ]

  const visibleNav = navigation.filter(item => {
    // Admin menu only for admin users
    if (item.adminOnly) {
      return user.role === 'admin'
    }
    // Dashboard is visible for all
    if (!item.module) {
      return true
    }
    // Module-based filtering
    return user.role === 'admin' || user.modules.includes(item.module)
  })

  return (
    <div className="min-h-screen bg-reset-black">
      {/* Navbar - Reset Style */}
      <nav className="bg-reset-black border-b border-reset-gray-medium">
        <div className="container-reset">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-neon rounded-reset-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-reset-black font-display text-2xl font-black">R</span>
                </div>
                <span className="font-display text-2xl text-reset-white tracking-tight">
                  SI<span className="text-reset-neon">RESET</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {visibleNav.map((item) => (
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
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block text-right">
                <div className="text-sm font-body font-semibold text-reset-white">
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
          <div className="md:hidden flex items-center space-x-2 pb-4 overflow-x-auto">
            {visibleNav.map((item) => (
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
              <span className="font-display text-reset-neon text-lg">RESET</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
