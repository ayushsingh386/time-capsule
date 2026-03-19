import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token from localStorager on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tc_token')
      localStorage.removeItem('tc_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
