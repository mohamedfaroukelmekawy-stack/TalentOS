import api from '../utils/axiosInstance'

export const getSkills = (params) =>
  api.get('/skills', { params })

export const createSkill = (data) =>
  api.post('/skills', data)

export const getDepartmentSkills = (departmentId) =>
  api.get(`/skills/department/${departmentId}`)

export const assignSkillToDepartment = (departmentId, data) =>
  api.post(`/skills/department/${departmentId}`, data)

export const removeSkillFromDepartment = (departmentId, skillId) =>
  api.delete(`/skills/department/${departmentId}/${skillId}`)
