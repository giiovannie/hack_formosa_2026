const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.message || 'No se pudo completar la solicitud')
    error.status = response.status
    error.details = body.errors || []
    throw error
  }
  return body
}

export function login(credentials) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function registerCompany({ companyName, firstName, lastName, email, password }) {
  return request('/empresas', {
    method: 'POST',
    body: JSON.stringify({ name: companyName, owner: { firstName, lastName, email, password } }),
  })
}

export function getDashboard() {
  return request('/dashboard')
}

export function getModule(path) {
  return request(path)
}

export async function getRecentImports() {
  const firstPage = await getModule('/datos/importaciones?page=1&limit=100')
  const lastPage = firstPage.pagination?.totalPages || 1
  if (lastPage === 1) return firstPage.dataImports || []
  const latestPage = await getModule(`/datos/importaciones?page=${lastPage}&limit=100`)
  return latestPage.dataImports || []
}

export function postModule(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) })
}

export function putModule(path, data) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) })
}

export function patchModule(path, data) {
  return request(path, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function uploadModule(path, fields, file) {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  form.append('file', file)
  const response = await fetch(`${apiBaseUrl}${path}`, { method: 'POST', credentials: 'include', body: form })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.message || 'No se pudo completar la solicitud')
    error.status = response.status
    error.details = body.errors || []
    throw error
  }
  return body
}
