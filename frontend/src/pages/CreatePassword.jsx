import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CreatePassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Verificar que el usuario esté autenticado (viene del link de invitación)
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setError('Link inválido o expirado. Solicita una nueva invitación.')
          setLoading(false)
          return
        }

        // Obtener email del usuario autenticado
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setEmail(user.email)
        } else {
          setError('No se pudo obtener la información del usuario.')
        }

        setLoading(false)
      } catch (err) {
        console.error('Error verificando autenticación:', err)
        setError('Error verificando tu sesión. Intenta de nuevo.')
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleCreatePassword = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSubmitting(true)

    try {
      // Actualizar la contraseña del usuario
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        if (error.message.includes('same as the old password')) {
          setError('La nueva contraseña debe ser diferente')
        } else {
          setError(`Error al crear contraseña: ${error.message}`)
        }
        setSubmitting(false)
        return
      }

      // Éxito - mostrar mensaje y redirigir
      setSuccess(true)

      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (err) {
      console.error('Error creando contraseña:', err)
      setError('Error al crear contraseña. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reset-black">
        <div className="bg-reset-gray-dark p-8 rounded-reset shadow-reset-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-reset-neon border-t-transparent"></div>
            <div className="text-xl text-reset-white">Verificando invitación...</div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reset-black">
        <div className="bg-reset-gray-dark border border-reset-neon rounded-reset p-8 lg:p-10 shadow-reset-lg max-w-md w-full mx-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-reset-neon bg-opacity-20 rounded-full flex items-center justify-center mx-auto border-2 border-reset-neon">
              <span className="text-reset-neon text-3xl">✓</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl text-reset-white uppercase">
              ¡Contraseña Creada!
            </h2>
            <p className="text-reset-gray-light">
              Tu cuenta ha sido activada exitosamente. Redirigiendo al dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-reset-neon border-t-transparent mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-reset-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 border border-reset-neon rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 border border-reset-cyan rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-reset-purple rounded-full"></div>
      </div>

      {/* Create Password Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-reset-gray-dark border border-reset-gray-medium rounded-reset p-8 lg:p-10 shadow-reset-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-reset-neon bg-opacity-20 rounded-full flex items-center justify-center mx-auto border border-reset-neon">
                <span className="text-reset-neon text-2xl">🔐</span>
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-reset-white mb-2 tracking-tight uppercase">
              Crear <span className="text-reset-neon">Contraseña</span>
            </h1>
            <p className="text-reset-gray-light text-xs sm:text-sm">
              Configura tu contraseña para acceder a SIRESET
            </p>
          </div>

          {/* Email Display */}
          <div className="mb-6 p-4 bg-reset-gray-medium border border-reset-gray rounded-reset">
            <div className="text-xs text-reset-gray-light uppercase tracking-wider mb-1">
              Tu Email
            </div>
            <div className="text-reset-white font-semibold break-all">
              {email}
            </div>
          </div>

          {/* Create Password Form */}
          <form onSubmit={handleCreatePassword} className="space-y-6">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Nueva Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="input-reset"
                disabled={submitting}
                minLength={8}
              />
              <p className="text-reset-gray-light text-xs mt-2">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite tu contraseña"
                className="input-reset"
                disabled={submitting}
                minLength={8}
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
              disabled={submitting}
              className={`w-full ${submitting ? 'btn-disabled' : 'btn-primary'}`}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-reset-black mr-2"></div>
                  Creando contraseña...
                </div>
              ) : (
                'Crear Contraseña'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-reset-gray-light text-xs">
              Una vez creada tu contraseña, podrás acceder a todos los módulos de SIRESET
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
