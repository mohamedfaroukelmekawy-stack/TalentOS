import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEmployee } from '../api/employees'
import { getEmployeeGaps, getEmployeeAssessments } from '../api/assessments'
import { getPlans, generatePlan, uploadCV } from '../api/ai'
import TopBar from '../components/TopBar'
import SkillRadarChart from '../components/SkillRadarChart'
import SkillBar from '../components/SkillBar'
import ScoreRing from '../components/ScoreRing'
import { getRoleBadgeClass } from '../utils/scoreHelpers'
import { Brain, Target, FileText, Sparkles, Upload, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TABS = ['Skills', 'Gaps', 'Dev Plan']

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Skills')
  const [employee, setEmployee] = useState(null)
  const [gaps, setGaps] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [planLoading, setPlanLoading] = useState(false)
  const [cvLoading, setCvLoading] = useState(false)
  const [cvResult, setCvResult] = useState(null)

  useEffect(() => {
    Promise.all([
      getEmployee(id),
      getEmployeeGaps(id).catch(() => null),
      getEmployeeAssessments(id).catch(() => ({ data: [] })),
      getPlans(id).catch(() => ({ data: [] })),
    ])
      .then(([empRes, gapsRes, assessRes, plansRes]) => {
        setEmployee(empRes.data)
        setGaps(gapsRes?.data || null)
        setAssessments(assessRes.data || [])
        setPlans(plansRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleGeneratePlan = async () => {
    setPlanLoading(true)
    try {
      const r = await generatePlan(id)
      setPlans((prev) => [r.data, ...prev])
      setTab('Dev Plan')
    } catch (e) {}
    finally { setPlanLoading(false) }
  }

  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvLoading(true)
    try {
      const r = await uploadCV(id, file)
      setCvResult(r.data)
    } catch (e) {}
    finally { setCvLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!employee) return <div className="p-8 text-gray-500">Employee not found.</div>

  const avgScore = assessments.length
    ? (assessments.reduce((s, a) => s + a.score, 0) / assessments.length)
    : 0

  return (
    <div>
      <TopBar title={employee.full_name} subtitle={employee.email} />
      <div className="p-8 space-y-6">
        {/* Back */}
        <button onClick={() => navigate('/employees')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={15} /> Back to employees
        </button>

        {/* Header Card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-2xl">
                {employee.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{employee.full_name}</h2>
                <p className="text-gray-500">{employee.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`badge ${getRoleBadgeClass(employee.role)}`}>{employee.role}</span>
                  {employee.department && (
                    <span className="badge bg-gray-100 text-gray-600">{employee.department.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <ScoreRing score={avgScore} label="Avg Score" />
              {gaps && (
                <ScoreRing
                  score={Math.max(0, 5 - gaps.avg_gap)}
                  label="Readiness"
                  size={80}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="btn-secondary cursor-pointer">
                <Upload size={14} />
                {cvLoading ? 'Uploading…' : 'Upload CV'}
                <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleCVUpload} disabled={cvLoading} />
              </label>
              <button onClick={handleGeneratePlan} disabled={planLoading} className="btn-primary">
                <Sparkles size={14} />
                {planLoading ? 'Generating…' : 'Generate Plan'}
              </button>
            </div>
          </div>

          {cvResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✓ CV processed: {cvResult.chunks_stored} chunks indexed.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {tab === 'Skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain size={16} className="text-brand-500" /> Skill Radar
              </h3>
              <SkillRadarChart data={gaps?.gaps || []} />
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Skill Scores</h3>
              <div className="space-y-4">
                {assessments.map((a) => (
                  <SkillBar
                    key={a.id}
                    skillName={a.skill?.name || a.skill_id}
                    currentScore={a.score}
                    requiredLevel={5}
                  />
                ))}
                {assessments.length === 0 && (
                  <p className="text-gray-400 text-sm">No assessments recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'Gaps' && gaps && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target size={16} className="text-rose-500" /> Skill Gaps
              </h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">{gaps.skills_at_level} at level</span>
                <span className="text-red-600 font-medium">{gaps.skills_below_level} below level</span>
              </div>
            </div>
            <div className="space-y-4">
              {gaps.gaps.sort((a, b) => b.gap - a.gap).map((g) => (
                <SkillBar
                  key={g.skill_id}
                  skillName={g.skill_name}
                  currentScore={g.current_score}
                  requiredLevel={g.required_level}
                  category={g.category}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'Dev Plan' && (
          <div className="space-y-4">
            {plans.length === 0 && (
              <div className="card text-center py-12">
                <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No development plan yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "Generate Plan" to create an AI-powered plan.</p>
              </div>
            )}
            {plans.map((plan) => (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.timeline_weeks} weeks • {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {plan.is_active && <span className="badge bg-green-100 text-green-700">Active</span>}
                </div>
                {plan.skills_targeted?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {plan.skills_targeted.map((s) => (
                      <span key={s} className="badge bg-brand-100 text-brand-700">{s}</span>
                    ))}
                  </div>
                )}
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 leading-relaxed max-h-96 overflow-y-auto">
                  {plan.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
