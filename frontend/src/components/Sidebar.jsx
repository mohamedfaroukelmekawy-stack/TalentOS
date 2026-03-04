import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Brain, ClipboardList, BarChart3, Bot, LogOut, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/skills', icon: Brain, label: 'Skills Matrix' },
  { to: '/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-none">TalentOS</p>
          <p className="text-gray-500 text-xs mt-0.5">AI Development Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name || 'User'}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.role || 'employee'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
