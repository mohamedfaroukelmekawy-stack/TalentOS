import { useEffect, useState } from 'react'
import { getSkills, createSkill, getDepartmentSkills, assignSkillToDepartment } from '../api/skills'
import TopBar from '../components/TopBar'
import { Plus, Brain, ChevronDown } from 'lucide-react'

export default function SkillsMatrix() {
  const [skills, setSkills] = useState([])
  const [deptSkills, setDeptSkills] = useState([])
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', category: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSkills().then((r) => setSkills(r.data)).catch(() => {})
  }, [])

  const handleCreateSkill = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const r = await createSkill(newSkill)
      setSkills((prev) => [...prev, r.data])
      setNewSkill({ name: '', category: '', description: '' })
      setShowAddSkill(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create skill')
    } finally {
      setSaving(false)
    }
  }

  const categories = [...new Set(skills.map((s) => s.category).filter(Boolean))]

  return (
    <div>
      <TopBar title="Skills Matrix" subtitle="Manage skills and department requirements" />
      <div className="p-8 space-y-6">
        {/* Add Skill */}
        <div className="flex justify-end">
          <button onClick={() => setShowAddSkill(!showAddSkill)} className="btn-primary">
            <Plus size={15} /> Add Skill
          </button>
        </div>

        {showAddSkill && (
          <div className="card border-brand-200">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Skill</h3>
            <form onSubmit={handleCreateSkill} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Skill name *" value={newSkill.name}
                  onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))} required />
                <input className="input" placeholder="Category (e.g. Technical, Soft Skills)"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill((p) => ({ ...p, category: e.target.value }))} />
              </div>
              <textarea className="input" placeholder="Description" rows={2}
                value={newSkill.description}
                onChange={(e) => setNewSkill((p) => ({ ...p, description: e.target.value }))} />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowAddSkill(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Skills by Category */}
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat} className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain size={15} className="text-brand-500" /> {cat}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.filter((s) => s.category === cat).map((skill) => (
                  <div key={skill.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-brand-50 hover:border-brand-200 transition-colors">
                    <p className="font-medium text-sm text-gray-800">{skill.name}</p>
                    {skill.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{skill.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">All Skills</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <div key={skill.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <p className="font-medium text-sm text-gray-800">{skill.name}</p>
                  {skill.description && <p className="text-xs text-gray-500 mt-0.5">{skill.description}</p>}
                </div>
              ))}
              {skills.length === 0 && (
                <p className="col-span-full text-gray-400 text-sm py-6 text-center">No skills created yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
