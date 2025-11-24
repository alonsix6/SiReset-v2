import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Mougli from './pages/Mougli'
import Mapito from './pages/Mapito'
import TheBox from './pages/TheBox'
import BenchBox from './pages/BenchBox'
import Admin from './pages/Admin'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Configurar interceptor de axios para manejar errores 401 globalmente
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        // Solo manejar errores 401 relacionados con autenticación
        if (error.response?.status === 401) {
          // Si la respuesta es un Blob, convertirlo a JSON primero
          if (error.response.data instanceof Blob) {
            try {
              const text = await error.response.data.text()
              const errorData = JSON.parse(text)
              error.response.data = errorData
            } catch {
              // Si no se puede parsear, continuar con el error original
            }
          }

          // Solo cerrar sesión si es un error de autenticación crítico
          const errorDetail = error.response.data?.detail || ''
          const isCriticalAuthError =
            errorDetail.includes('credenciales') ||
            errorDetail.includes('token') ||
            errorDetail.includes('autenticación') ||
            errorDetail.includes('authentication')

          if (isCriticalAuthError) {
            console.warn('Error de autenticación crítico detectado:', errorDetail)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            await supabase.auth.signOut()
            setUser(null)

            // Solo redirigir si no estamos ya en la página de login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/callback') {
              window.location.href = '/login'
            }
          }
        }

        return Promise.reject(error)
      }
    )

    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    // Verificar sesión actual de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name ||
                session.user.user_metadata?.full_name ||
                session.user.email,
          role: session.user.user_metadata?.role || 'user',
          active: true,
          modules: session.user.user_metadata?.modules || ['Mougli', 'Mapito', 'TheBox']
        }
        setUser(userData)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('user', JSON.stringify(userData))
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name ||
                session.user.user_metadata?.full_name ||
                session.user.email,
          role: session.user.user_metadata?.role || 'user',
          active: true,
          modules: session.user.user_metadata?.modules || ['Mougli', 'Mapito', 'TheBox']
        }
        setUser(userData)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = async () => {
    // Cerrar sesión en Supabase
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <div className="text-xl text-gray-700">Cargando...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={
        <Layout user={user} onLogout={handleLogout}>
          <Dashboard user={user} />
        </Layout>
      } />
      <Route path="/mougli" element={
        <Layout user={user} onLogout={handleLogout}>
          <Mougli user={user} />
        </Layout>
      } />
      <Route path="/mapito" element={
        <Layout user={user} onLogout={handleLogout}>
          <Mapito user={user} />
        </Layout>
      } />
      <Route path="/thebox" element={
        <Layout user={user} onLogout={handleLogout}>
          <TheBox user={user} />
        </Layout>
      } />
      <Route path="/benchbox" element={
        <Layout user={user} onLogout={handleLogout}>
          <BenchBox user={user} />
        </Layout>
      } />
      <Route path="/admin" element={
        <Layout user={user} onLogout={handleLogout}>
          <Admin user={user} />
        </Layout>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
