import { useEffect, useState } from 'react'
import { getEmployees } from '../api/employees'
import TopBar from '../components/TopBar'
import EmployeeCard from '../components/EmployeeCard'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Employees() {
  const navigate = useNavigate()
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getEmployees({ page, page_size: 20, search: search || undefined, role: role || undefined })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, role])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  return (
    <div>
      <TopBar title="Employees" subtitle={`${data.total} total employees`} />
      <div className="p-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <div className="flex gap-2">
            <select
              className="input w-40"
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1) }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            <button
              onClick={() => navigate('/employees/new')}
              className="btn-primary whitespace-nowrap"
            >
              <Plus size={15} /> Add Employee
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card animate-pulse h-32 bg-gray-50" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.items.map((emp) => <EmployeeCard key={emp.id} employee={emp} />)}
              {data.items.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">
                  No employees found matching your criteria.
                </div>
              )}
            </div>
            {data.pages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {data.pages}
                </span>
                <button className="btn-secondary" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
