import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session)
      }
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (event === 'SIGNED_IN' && session) {
        handleSession(session)
      } else if (event === 'SIGNED_OUT') {
        // Limpiar estado local
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSession = async (session) => {
    try {
      // Obtener datos del usuario desde Supabase
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Estructura de usuario compatible con el sistema existente
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
          role: user.user_metadata?.role || 'user',
          active: true,
          modules: user.user_metadata?.modules || ['Mougli', 'Mapito']
        }

        // Token JWT de Supabase
        const token = session.access_token

        // Llamar al callback onLogin del componente padre
        onLogin(userData, token)

        // Navegar al dashboard
        navigate('/')
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email primero')
        } else {
          setError('Error al iniciar sesión. Contacta al administrador.')
        }
        setLoading(false)
        return
      }

      if (data.session) {
        await handleSession(data.session)
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error al iniciar sesión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-reset-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 border border-reset-neon rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 border border-reset-cyan rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-reset-purple rounded-full"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-8 lg:p-10 shadow-reset-lg">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-reset-white mb-2 tracking-tight">
              SI<span className="text-reset-neon">RESET</span>
            </h1>
            <p className="text-reset-gray-light text-xs sm:text-sm uppercase tracking-wider">
              Suite de Herramientas para Reset
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="input-reset"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-reset"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert-error animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">⚠</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'btn-disabled' : 'btn-primary'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-reset"></div>

          {/* Footer Info */}
          <div className="text-center space-y-2">
            <p className="text-reset-gray-light text-sm">
              <span className="font-display text-reset-white">SIRESET</span> v2.0 - Acceso Restringido
            </p>
            <p className="text-reset-gray text-xs">
              Contacta al administrador para obtener acceso
            </p>
          </div>
        </div>

        {/* Powered by Research */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-reset-gray-light text-sm">Powered by</span>
            <span className="font-display text-reset-neon text-xl">RESEARCH</span>
          </div>
        </div>
      </div>
    </div>
  )
}
