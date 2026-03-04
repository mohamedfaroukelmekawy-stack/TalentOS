import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import SkillsMatrix from './pages/SkillsMatrix'
import Assessments from './pages/Assessments'
import Reports from './pages/Reports'
import AIAssistant from './pages/AIAssistant'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/employees" element={<ProtectedLayout><Employees /></ProtectedLayout>} />
        <Route path="/employees/:id" element={<ProtectedLayout><EmployeeProfile /></ProtectedLayout>} />
        <Route path="/skills" element={<ProtectedLayout><SkillsMatrix /></ProtectedLayout>} />
        <Route path="/assessments" element={<ProtectedLayout><Assessments /></ProtectedLayout>} />
        <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
        <Route path="/ai" element={<ProtectedLayout><AIAssistant /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
