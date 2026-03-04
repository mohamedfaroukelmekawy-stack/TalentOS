import { useEffect, useState } from 'react'
import { getEmployees } from '../api/employees'
import { getSkills } from '../api/skills'
import { submitAssessment, getEmployeeAssessments } from '../api/assessments'
import TopBar from '../components/TopBar'
import { ClipboardList, Check } from 'lucide-react'

export default function Assessments() {
  const [employees, setEmployees] = useState([])
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState({ employee_id: '', skill_id: '', score: 3, notes: '' })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [recentAssessments, setRecentAssessments] = useState([])

  useEffect(() => {
    getEmployees({ page_size: 100 }).then((r) => setEmployees(r.data.items)).catch(() => {})
    getSkills().then((r) => setSkills(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.employee_id) {
      getEmployeeAssessments(form.employee_id).then((r) => setRecentAssessments(r.data)).catch(() => {})
    }
  }, [form.employee_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await submitAssessment({ ...form, score: parseInt(form.score) })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      if (form.employee_id) {
        const r = await getEmployeeAssessments(form.employee_id)
        setRecentAssessments(r.data)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  const SCORE_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']

  return (
    <div>
      <TopBar title="Assessments" subtitle="Record employee skill evaluations" />
      <div className="p-8 max-w-4xl space-y-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <ClipboardList size={17} className="text-brand-500" /> Submit Assessment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="input" value={form.employee_id}
                  onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))} required>
                  <option value="">Select employee…</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                <select className="input" value={form.skill_id}
                  onChange={(e) => setForm((p) => ({ ...p, skill_id: e.target.value }))} required>
                  <option value="">Select skill…</option>
                  {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score: <span className="text-brand-600 font-semibold">{form.score} — {SCORE_LABELS[form.score]}</span>
              </label>
              <input type="range" min={1} max={5} step={1}
                className="w-full accent-brand-500 h-2"
                value={form.score}
                onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                {SCORE_LABELS.slice(1).map((l) => <span key={l}>{l}</span>)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea className="input" rows={2} placeholder="Add evaluation notes…"
                value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : submitted ? (
                <><Check size={15} /> Saved!</>
              ) : 'Submit Assessment'}
            </button>
          </form>
        </div>

        {recentAssessments.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Assessments for Selected Employee</h3>
            <div className="space-y-2">
              {recentAssessments.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{a.skill_id}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((n) => (
                        <div key={n} className={`w-4 h-4 rounded-full ${n <= a.score ? 'bg-brand-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{a.score}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
