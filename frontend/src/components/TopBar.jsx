import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function TopBar({ title, subtitle }) {
  const { user } = useAuthStore()
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.full_name}</span>
        </div>
      </div>
    </header>
  )
}
