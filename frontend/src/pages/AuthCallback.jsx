import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/**
 * Página de callback para OAuth (Google)
 * Maneja la redirección después de autenticarse con proveedores externos
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Obtener sesión del hash de la URL (OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Redirigir al dashboard si hay sesión
        navigate('/', { replace: true })
      } else {
        // Si no hay sesión, volver al login
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-reset-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 border border-reset-neon rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 border border-reset-cyan rounded-full animate-pulse"></div>
      </div>

      {/* Loading Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-10 shadow-reset-lg">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo */}
            <div className="w-16 h-16 bg-gradient-neon rounded-reset flex items-center justify-center animate-pulse">
              <span className="text-reset-black font-display text-4xl font-black">R</span>
            </div>

            {/* Spinner */}
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-reset-neon border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-reset-neon rounded-full opacity-20"></div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-reset-white text-lg font-semibold mb-2">Autenticando...</p>
              <p className="text-reset-gray-light text-sm">
                Verificando credenciales y configurando tu sesión
              </p>
            </div>

            {/* Loading dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-reset-neon rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-reset-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-reset-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
