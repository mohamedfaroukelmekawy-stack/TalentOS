import { useEffect, useState } from 'react'
import { getCompanySummary } from '../api/reports'
import TopBar from '../components/TopBar'
import DeptCard from '../components/DeptCard'
import { Users, Building2, ClipboardCheck, TrendingUp, ArrowUpRight } from 'lucide-react'

function KPICard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanySummary()
      .then((r) => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const kpis = summary?.kpis || {}

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Company-wide talent overview" />
      <div className="p-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPICard label="Total Employees" value={kpis.total_employees ?? '—'} icon={Users} color="bg-brand-500" sub="Active headcount" />
          <KPICard label="Departments" value={kpis.total_departments ?? '—'} icon={Building2} color="bg-emerald-500" sub="Active departments" />
          <KPICard label="Assessments" value={kpis.total_assessments ?? '—'} icon={ClipboardCheck} color="bg-amber-500" sub="Total recorded" />
          <KPICard label="Avg Skill Gap" value={kpis.avg_skill_gap !== undefined ? kpis.avg_skill_gap.toFixed(2) : '—'} icon={TrendingUp} color="bg-rose-500" sub="Company average" />
        </div>

        {/* Departments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
            <span className="text-sm text-gray-400">{summary?.departments?.length || 0} total</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse h-28 bg-gray-50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(summary?.departments || []).map((dept) => (
                <DeptCard key={dept.id} dept={dept} />
              ))}
              {(!summary?.departments || summary.departments.length === 0) && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  No departments found. Create departments to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
