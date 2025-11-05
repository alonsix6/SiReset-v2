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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Autenticando...</p>
        </div>
      </div>
    </div>
  )
}
