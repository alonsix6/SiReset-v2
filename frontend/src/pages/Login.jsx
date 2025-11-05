import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SiReset</h1>
          <p className="text-gray-600">Suite de Herramientas para Reset</p>
        </div>

        {/* Supabase Auth UI Component */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#5f48c6',
                  brandAccent: '#4c3ba6',
                }
              }
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
            }
          }}
          providers={['google']}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'tu@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Iniciar Sesión',
                loading_button_label: 'Iniciando sesión...',
                social_provider_text: 'Iniciar sesión con {{provider}}',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'tu@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Registrarse',
                loading_button_label: 'Registrando...',
                social_provider_text: 'Registrarse con {{provider}}',
                link_text: '¿No tienes cuenta? Regístrate',
              },
              forgotten_password: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'tu@email.com',
                button_label: 'Enviar instrucciones',
                loading_button_label: 'Enviando...',
                link_text: '¿Olvidaste tu contraseña?',
              },
              update_password: {
                password_label: 'Nueva contraseña',
                password_input_placeholder: '••••••••',
                button_label: 'Actualizar contraseña',
                loading_button_label: 'Actualizando...',
              },
            },
          }}
          redirectTo={`${window.location.origin}/`}
        />

        <p className="text-center text-sm text-gray-500 mt-6">
          SiReset v2.0 - Powered by Supabase + React
        </p>
      </div>
    </div>
  )
}
