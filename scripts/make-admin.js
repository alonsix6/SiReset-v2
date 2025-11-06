#!/usr/bin/env node
/**
 * Script para hacer administrador a un usuario de Supabase
 *
 * Uso:
 *   node scripts/make-admin.js email@ejemplo.com
 *
 * Requiere:
 *   - SUPABASE_URL en .env
 *   - SUPABASE_SERVICE_ROLE_KEY en .env (NO el anon key!)
 */

require('dotenv').config()
const https = require('https')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Faltan variables de entorno')
  console.error('')
  console.error('Necesitas configurar en tu .env:')
  console.error('  SUPABASE_URL=https://jmzlfdbooafivioaapti.supabase.co')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key')
  console.error('')
  console.error('El service_role_key lo encuentras en:')
  console.error('  Supabase Dashboard → Settings → API → service_role key (secret)')
  process.exit(1)
}

const email = process.argv[2]

if (!email) {
  console.error('❌ ERROR: Falta el email del usuario')
  console.error('')
  console.error('Uso:')
  console.error('  node scripts/make-admin.js usuario@ejemplo.com')
  process.exit(1)
}

console.log('🔍 Buscando usuario:', email)

// Función para hacer request HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${json.message || body}`))
          }
        } catch (e) {
          reject(new Error(`Error parsing response: ${body}`))
        }
      })
    })

    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function makeAdmin() {
  try {
    // 1. Buscar usuario por email
    console.log('📡 Consultando API de Supabase...')

    const listOptions = {
      hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
      path: '/auth/v1/admin/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    }

    const usersResponse = await makeRequest(listOptions)
    const users = usersResponse.users || []

    const user = users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ ERROR: No se encontró usuario con email: ${email}`)
      console.error('')
      console.error('Usuarios disponibles:')
      users.forEach(u => console.error(`  - ${u.email}`))
      process.exit(1)
    }

    console.log('✅ Usuario encontrado:', user.email)
    console.log('   ID:', user.id)
    console.log('   Rol actual:', user.user_metadata?.role || 'user')

    // 2. Actualizar metadata para hacer admin
    console.log('')
    console.log('⚙️  Actualizando permisos de administrador...')

    const updateData = JSON.stringify({
      user_metadata: {
        ...user.user_metadata,
        role: 'admin',
        name: user.user_metadata?.name || user.email,
        modules: ['Mougli', 'Mapito']
      }
    })

    const updateOptions = {
      hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
      path: `/auth/v1/admin/users/${user.id}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
      }
    }

    await makeRequest(updateOptions, updateData)

    console.log('')
    console.log('✅ ¡Éxito! Usuario actualizado a administrador')
    console.log('')
    console.log('👤 Usuario:', email)
    console.log('🎭 Rol:', 'admin')
    console.log('📦 Módulos:', 'Mougli, Mapito')
    console.log('')
    console.log('⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar')
    console.log('   para que los cambios tomen efecto.')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('❌ ERROR:', error.message)
    console.error('')

    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('El service_role_key no es válido o no tiene permisos.')
      console.error('Verifica que estés usando el service_role key (NO el anon key)')
    }

    process.exit(1)
  }
}

makeAdmin()
