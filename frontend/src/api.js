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

export function registerCompany({ companyName, firstName, lastName, email, password }) {
  return request('/empresas', {
    method: 'POST',
    body: JSON.stringify({ name: companyName, owner: { firstName, lastName, email, password } }),
  })
}

export function getDashboard() {
  return request('/dashboard')
}