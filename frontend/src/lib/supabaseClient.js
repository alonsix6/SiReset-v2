/**
 * Supabase Client Configuration
 *
 * Este archivo inicializa el cliente de Supabase con las credenciales
 * del proyecto. Se usa para todas las operaciones de autenticación y base de datos.
 */

import { createClient } from '@supabase/supabase-js'

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las variables estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL y Anon Key son requeridos. ' +
    'Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén en .env'
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuración de autenticación
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // URL de redirección después de login (producción)
    // redirectTo: window.location.origin,
  },
  // Configuración de reintentos
  global: {
    headers: {
      'x-application-name': 'sireset-v2'
    }
  }
})

/**
 * Helper para obtener sesión actual
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error obteniendo sesión:', error)
    return null
  }
  return session
}

/**
 * Helper para obtener usuario actual
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
  return user
}

/**
 * Helper para cerrar sesión
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error cerrando sesión:', error)
    throw error
  }
}

/**
 * Helper para sign in con email/password
 */
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Helper para sign up con email/password
 */
export const signUpWithEmail = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Helper para sign in con Google
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    throw error
  }

  return data
}

export default supabase
