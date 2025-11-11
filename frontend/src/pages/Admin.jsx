import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Admin({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Verificar que el usuario sea admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('No tienes permisos de administrador')
      setLoading(false)
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Obtener todos los usuarios de Supabase Auth
      const { data, error } = await supabase.auth.admin.listUsers()

      if (error) {
        // Si no tiene permisos admin en Supabase, usar la tabla auth.users directamente
        // Esto requiere una función RPC en Supabase
        console.error('Error con admin.listUsers:', error)

        // Plan alternativo: Obtener desde metadata almacenada
        const { data: metaData, error: metaError } = await supabase
          .from('user_profiles')
          .select('*')

        if (metaError) throw metaError
        setUsers(metaData || [])
      } else {
        setUsers(data.users || [])
      }

      setLoading(false)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('Error cargando usuarios: ' + err.message)
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { role: newRole }
        }
      )

      if (error) throw error

      alert(`Usuario actualizado a rol: ${newRole}`)
      fetchUsers()
    } catch (err) {
      alert('Error actualizando usuario: ' + err.message)
    }
  }

  const updateUserModules = async (userId, modules) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { modules }
        }
      )

      if (error) throw error

      alert('Módulos actualizados')
      fetchUsers()
    } catch (err) {
      alert('Error actualizando módulos: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="section-reset">
        <div className="container-reset">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-reset-neon border-t-transparent mb-4"></div>
            <p className="text-reset-gray-light text-lg">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-reset">
        <div className="container-reset max-w-4xl">
          <div className="alert-error">
            <div className="flex items-center">
              <span className="mr-2 text-2xl">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section-reset">
      <div className="container-reset">
        {/* Header */}
        <div className="mb-8 lg:mb-12 animate-fade-in-up">
          <div className="inline-block mb-3">
            <span className="text-reset-magenta text-xs sm:text-sm font-bold uppercase tracking-wider">
              // PANEL DE CONTROL
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-reset-white mb-3 lg:mb-4 leading-tight">
            ADMINISTRACIÓN
          </h1>
          <p className="text-reset-gray-light text-base lg:text-lg">
            Gestión de usuarios y permisos del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card-reset group hover:border-reset-cyan transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Total Usuarios
              </div>
              <div className="w-8 h-8 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center border border-reset-cyan">
                <span className="text-reset-cyan text-xs">👥</span>
              </div>
            </div>
            <div className="text-reset-cyan text-5xl font-display font-black">
              {users.length}
            </div>
          </div>

          <div className="card-reset group hover:border-reset-magenta transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Administradores
              </div>
              <div className="w-8 h-8 bg-reset-magenta bg-opacity-20 rounded-full flex items-center justify-center border border-reset-magenta">
                <span className="text-reset-magenta text-xs">★</span>
              </div>
            </div>
            <div className="text-reset-magenta text-5xl font-display font-black">
              {users.filter(u => u.user_metadata?.role === 'admin').length}
            </div>
          </div>

          <div className="card-reset group hover:border-reset-blue transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Programadores
              </div>
              <div className="w-8 h-8 bg-reset-blue bg-opacity-20 rounded-full flex items-center justify-center border border-reset-blue">
                <span className="text-reset-blue text-xs">⚡</span>
              </div>
            </div>
            <div className="text-reset-blue text-5xl font-display font-black">
              {users.filter(u => u.user_metadata?.role === 'programmer').length}
            </div>
          </div>

          <div className="card-reset group hover:border-reset-neon transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider">
                Usuarios
              </div>
              <div className="w-8 h-8 bg-reset-neon bg-opacity-20 rounded-full flex items-center justify-center border border-reset-neon">
                <span className="text-reset-neon text-xs">👤</span>
              </div>
            </div>
            <div className="text-reset-neon text-5xl font-display font-black">
              {users.filter(u => !u.user_metadata?.role || u.user_metadata?.role === 'user').length}
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="card-reset-shadow mb-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="mb-4 lg:mb-6">
            <h2 className="font-display text-2xl lg:text-3xl text-reset-white uppercase">
              Usuarios <span className="text-reset-neon">Registrados</span>
            </h2>
          </div>

          <div className="overflow-x-auto scrollbar-reset">
            <table className="table-reset">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Módulos</th>
                  <th>Proveedor</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onUpdateRole={updateUserRole}
                    onUpdateModules={updateUserModules}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información sobre roles */}
        <div className="bg-reset-gray-dark border-l-4 border-reset-cyan rounded-reset p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-reset-cyan bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-reset-cyan text-xl">ℹ</span>
              </div>
            </div>
            <div>
              <h3 className="text-reset-white font-semibold mb-3 uppercase tracking-wide">
                Información sobre Roles
              </h3>
              <ul className="text-reset-gray-light text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-reset-magenta mr-2 mt-0.5">▶</span>
                  <div>
                    <span className="text-reset-magenta font-semibold">Admin:</span> Acceso total, puede gestionar usuarios y todos los módulos
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-reset-blue mr-2 mt-0.5">▶</span>
                  <div>
                    <span className="text-reset-blue font-semibold">Programmer:</span> Acceso a todos los módulos, puede modificar configuraciones
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-reset-neon mr-2 mt-0.5">▶</span>
                  <div>
                    <span className="text-reset-neon font-semibold">User:</span> Acceso solo a los módulos asignados
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserRow({ user, onUpdateRole, onUpdateModules }) {
  const [isEditingModules, setIsEditingModules] = useState(false)
  const [selectedModules, setSelectedModules] = useState(
    user.user_metadata?.modules || []
  )

  const availableModules = ['Mougli', 'Mapito']
  const currentRole = user.user_metadata?.role || 'user'

  const toggleModule = (module) => {
    if (selectedModules.includes(module)) {
      setSelectedModules(selectedModules.filter(m => m !== module))
    } else {
      setSelectedModules([...selectedModules, module])
    }
  }

  const saveModules = () => {
    onUpdateModules(user.id, selectedModules)
    setIsEditingModules(false)
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'badge-reset bg-reset-magenta bg-opacity-20 text-reset-magenta border-reset-magenta'
      case 'programmer': return 'badge-reset bg-reset-blue bg-opacity-20 text-reset-blue border-reset-blue'
      default: return 'badge-neon'
    }
  }

  return (
    <tr>
      <td>
        <div className="max-w-[250px]">
          <div className="font-semibold text-reset-white mb-1 truncate">
            {user.user_metadata?.name || user.email}
          </div>
          <div className="text-sm text-reset-gray-light break-all">{user.email}</div>
        </div>
      </td>
      <td>
        <select
          value={currentRole}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          className="select-reset text-sm py-2"
        >
          <option value="user">Usuario</option>
          <option value="programmer">Programador</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td>
        {isEditingModules ? (
          <div className="space-y-2">
            {availableModules.map(module => (
              <label key={module} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module)}
                  onChange={() => toggleModule(module)}
                  className="checkbox-reset"
                />
                <span className="text-sm text-reset-white">{module}</span>
              </label>
            ))}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={saveModules}
                className="px-3 py-1.5 bg-reset-neon text-reset-black text-xs font-bold uppercase rounded-reset-sm hover:bg-opacity-80 transition-all"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingModules(false)}
                className="px-3 py-1.5 bg-reset-gray-medium text-reset-white text-xs font-bold uppercase rounded-reset-sm hover:bg-reset-gray transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            {currentRole === 'admin' ? (
              <span className={getRoleBadgeColor('admin')}>
                Todos los módulos
              </span>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(user.user_metadata?.modules || []).map(module => (
                    <span key={module} className="badge-blue">
                      {module}
                    </span>
                  ))}
                  {(user.user_metadata?.modules || []).length === 0 && (
                    <span className="text-reset-gray-light text-sm">Sin módulos</span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingModules(true)}
                  className="text-xs text-reset-neon hover:text-reset-cyan font-semibold uppercase tracking-wide transition-colors"
                >
                  Editar módulos →
                </button>
              </div>
            )}
          </div>
        )}
      </td>
      <td>
        <span className="text-sm text-reset-gray-light">
          {user.app_metadata?.provider || 'email'}
        </span>
      </td>
      <td>
        <span className="text-xs font-mono text-reset-gray-light">
          {user.id.substring(0, 8)}...
        </span>
      </td>
    </tr>
  )
}
