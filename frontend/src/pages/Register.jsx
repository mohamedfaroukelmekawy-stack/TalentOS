import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Sparkles, Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'employee' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await registerApi(form)
      const { access_token, refresh_token } = r.data
      login(access_token, refresh_token, { email: form.email, full_name: form.full_name, role: form.role })
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">TalentOS</h1>
            <p className="text-gray-500 text-sm">Create your account</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Get started</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input" placeholder="Full name" value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required />
            <input type="email" className="input" placeholder="Email" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <input type="password" className="input" placeholder="Password (min 8 chars)" value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} />
            <select className="input" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-brand-600 font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
