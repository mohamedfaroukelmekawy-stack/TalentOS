import api from '../utils/axiosInstance'

export const uploadCV = (employeeId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/ai/cv/parse/${employeeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const generatePlan = (employeeId) =>
  api.post(`/ai/plan/${employeeId}`)

export const getPlans = (employeeId) =>
  api.get(`/ai/plan/${employeeId}`)

export const sendChatMessage = (data) =>
  api.post('/ai/chat', data)
