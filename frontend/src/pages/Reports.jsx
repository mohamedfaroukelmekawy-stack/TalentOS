import { useEffect, useState } from 'react'
import { getCompanySummary, getEmployeeReport, getDepartmentReport } from '../api/reports'
import TopBar from '../components/TopBar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingDown, TrendingUp, Users, Building2 } from 'lucide-react'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanySummary()
      .then((r) => setSummary(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const deptChartData = (summary?.departments || []).map((d) => ({
    name: d.name.length > 14 ? d.name.slice(0, 14) + '…' : d.name,
    headcount: d.headcount,
  }))

  return (
    <div>
      <TopBar title="Reports" subtitle="Company, department, and employee analytics" />
      <div className="p-8 space-y-6">
        {/* Company KPIs */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Company Summary</h2>
          {loading ? (
            <div className="h-24 animate-pulse bg-gray-50 rounded-lg" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Employees', value: summary?.kpis?.total_employees, icon: Users, color: 'text-brand-600' },
                { label: 'Departments', value: summary?.kpis?.total_departments, icon: Building2, color: 'text-emerald-600' },
                { label: 'Assessments', value: summary?.kpis?.total_assessments, icon: TrendingUp, color: 'text-amber-600' },
                { label: 'Avg Gap', value: summary?.kpis?.avg_skill_gap?.toFixed(2), icon: TrendingDown, color: 'text-rose-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <Icon size={22} className={`${color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Headcount Chart */}
        {deptChartData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-5">Headcount by Department</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptChartData} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="headcount" radius={[6, 6, 0, 0]}>
                  {deptChartData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#6272f1' : '#a5bbfc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
