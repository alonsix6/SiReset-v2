import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Mougli from './pages/Mougli'
import Mapito from './pages/Mapito'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
          modules: session.user.user_metadata?.modules || ['Mougli', 'Mapito']
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
          modules: session.user.user_metadata?.modules || ['Mougli', 'Mapito']
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
