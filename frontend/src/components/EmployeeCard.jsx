import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { getRoleBadgeClass } from '../utils/scoreHelpers'

export default function EmployeeCard({ employee }) {
  const navigate = useNavigate()
  const initials = employee.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      onClick={() => navigate(`/employees/${employee.id}`)}
      className="card cursor-pointer hover:shadow-md hover:border-brand-200 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
              {employee.full_name}
            </p>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors mt-1" />
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className={`badge ${getRoleBadgeClass(employee.role)}`}>
          {employee.role}
        </span>
        {employee.department && (
          <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
            <Building2 size={10} />
            {employee.department.name}
          </span>
        )}
        {!employee.is_active && (
          <span className="badge bg-red-100 text-red-600">Inactive</span>
        )}
      </div>
    </div>
  )
}
