import { Users, TrendingUp } from 'lucide-react'

export default function DeptCard({ dept }) {
  const gapColor = dept.avg_gap <= 0.5 ? 'text-green-600' : dept.avg_gap <= 1.5 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{dept.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{dept.description || 'No description'}</p>
        </div>
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-brand-600" />
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users size={14} />
          <span className="font-medium">{dept.headcount || 0}</span>
          <span className="text-gray-400">employees</span>
        </div>
        {dept.avg_gap !== undefined && (
          <div className={`flex items-center gap-1 font-medium ${gapColor}`}>
            Avg Gap: {dept.avg_gap.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  )
}
