import { create } from 'zustand'

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  selectedEmployee: null,
  departments: [],
  pagination: { total: 0, page: 1, page_size: 20, pages: 0 },
  filters: { search: '', department_id: '', role: '' },
  loading: false,

  setEmployees: (employees, pagination) => set({ employees, pagination }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  setDepartments: (departments) => set({ departments }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (loading) => set({ loading }),
  resetFilters: () => set({ filters: { search: '', department_id: '', role: '' } }),
}))
