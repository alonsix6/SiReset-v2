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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestionar usuarios y permisos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Usuarios</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Administradores</div>
          <div className="mt-2 text-3xl font-semibold text-purple-600">
            {users.filter(u => u.user_metadata?.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Programadores</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {users.filter(u => u.user_metadata?.role === 'programmer').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Usuarios</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {users.filter(u => !u.user_metadata?.role || u.user_metadata?.role === 'user').length}
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Usuarios Registrados</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información sobre Roles</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Admin:</strong> Acceso total, puede gestionar usuarios y todos los módulos</li>
          <li><strong>Programmer:</strong> Acceso a todos los módulos, puede modificar configuraciones</li>
          <li><strong>User:</strong> Acceso solo a los módulos asignados</li>
        </ul>
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

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.user_metadata?.name || user.email}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={currentRole}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="user">Usuario</option>
          <option value="programmer">Programador</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-6 py-4">
        {isEditingModules ? (
          <div className="space-y-2">
            {availableModules.map(module => (
              <label key={module} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module)}
                  onChange={() => toggleModule(module)}
                  className="rounded text-purple-600"
                />
                <span className="text-sm">{module}</span>
              </label>
            ))}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={saveModules}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditingModules(false)}
                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            {currentRole === 'admin' ? (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Todos los módulos
              </span>
            ) : (
              <>
                <div className="flex flex-wrap gap-1">
                  {(user.user_metadata?.modules || []).map(module => (
                    <span
                      key={module}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {module}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setIsEditingModules(true)}
                  className="text-xs text-purple-600 hover:underline mt-1"
                >
                  Editar módulos
                </button>
              </>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.app_metadata?.provider || 'email'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className="text-xs text-gray-500">
          ID: {user.id.substring(0, 8)}...
        </span>
      </td>
    </tr>
  )
}
