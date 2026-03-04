import api from '../utils/axiosInstance'

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => api.get('/auth/me'),
}

export const employeesApi = {
  list: (params) => api.get('/employees', { params }),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
}

export const departmentsApi = {
  list: () => api.get('/departments'),
  get: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  getSkills: (deptId) => api.get(`/departments/${deptId}/skills`),
  assignSkill: (deptId, data) => api.post(`/departments/${deptId}/skills`, data),
  removeSkill: (deptId, skillId) => api.delete(`/departments/${deptId}/skills/${skillId}`),
}

export const skillsApi = {
  list: (params) => api.get('/skills', { params }),
  get: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  findSimilar: (query, topK = 5) => api.post('/ai/skills/similar', { query, top_k: topK }),
}

export const assessmentsApi = {
  submit: (data) => api.post('/assessments', data),
  getForEmployee: (employeeId) => api.get(`/assessments/employee/${employeeId}`),
  getGaps: (employeeId) => api.get(`/assessments/gaps/${employeeId}`),
  update: (id, data) => api.put(`/assessments/${id}`, data),
}

export const reportsApi = {
  employee: (id) => api.get(`/reports/employee/${id}`),
  department: (id) => api.get(`/reports/department/${id}`),
  company: () => api.get('/reports/company'),
}

export const aiApi = {
  generatePlan: (employeeId, customContext = null) =>
    api.post('/ai/plan', { employee_id: employeeId, custom_context: customContext }),
  parseCV: (employeeId, file) => {
    const formData = new FormData()
    formData.append('employee_id', employeeId)
    formData.append('file', file)
    return api.post('/ai/cv/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  chat: (employeeId, sessionId, message) =>
    api.post('/ai/chat', { employee_id: employeeId, session_id: sessionId, message }),
  getChatHistory: (employeeId, sessionId) =>
    api.get(`/ai/chat/${employeeId}/${sessionId}`),
}
