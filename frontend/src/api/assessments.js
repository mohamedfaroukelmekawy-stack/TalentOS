import api from '../utils/axiosInstance'

export const submitAssessment = (data) =>
  api.post('/assessments', data)

export const getEmployeeAssessments = (employeeId) =>
  api.get(`/assessments/employee/${employeeId}`)

export const getEmployeeGaps = (employeeId) =>
  api.get(`/assessments/gaps/${employeeId}`)
