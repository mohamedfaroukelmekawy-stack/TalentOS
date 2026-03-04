import api from '../utils/axiosInstance'

export const loginApi = (email, password) =>
  api.post('/auth/login', { email, password })

export const registerApi = (data) =>
  api.post('/auth/register', data)

export const refreshTokenApi = (refresh_token) =>
  api.post('/auth/refresh', { refresh_token })

export const getMeApi = () =>
  api.get('/auth/me')
