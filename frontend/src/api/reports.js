import api from '../utils/axiosInstance'

export const getEmployeeReport = (employeeId) =>
  api.get(`/reports/employee/${employeeId}`)

export const getDepartmentReport = (departmentId) =>
  api.get(`/reports/department/${departmentId}`)

export const getCompanySummary = () =>
  api.get('/reports/company')
