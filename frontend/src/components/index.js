import { getGapColor, getGapLabel, getScoreColor, getLevelLabel } from '../utils/scoreHelpers'

// SkillBar - Progress bar per skill
export function SkillBar({ skillName, actual, required, gap, category }) {
  const pct = Math.min((actual / 5) * 100, 100)
  const reqPct = (required / 5) * 100
  const color = getGapColor(gap)

  return (
    <div className="group">
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <span className="text-sm font-medium text-slate-200">{skillName}</span>
          {category && (
            <span className="ml-2 text-xs text-slate-500 bg-surface-DEFAULT px-1.5 py-0.5 rounded">
              {category}
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-sm font-semibold" style={{ color }}>
            {actual ?? 'N/A'}/5
          </span>
          <span className="text-xs text-slate-500 ml-1">({getLevelLabel(actual)})</span>
        </div>
      </div>
      <div className="relative h-2.5 bg-surface-DEFAULT rounded-full overflow-hidden">
        {/* Required level marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-amber-400 z-10"
          style={{ left: `${reqPct}%` }}
        />
        {/* Actual score bar */}
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">Required: {required}/5</span>
        <span className="text-xs font-medium" style={{ color }}>
          {getGapLabel(gap)}
        </span>
      </div>
    </div>
  )
}

// ScoreRing - SVG donut score ring
export function ScoreRing({ score, maxScore = 5, size = 80, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(score / maxScore, 1)
  const dashOffset = circumference * (1 - pct)
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-lg leading-none">{score?.toFixed(1) ?? '—'}</span>
          <span className="text-slate-500 text-xs">/{maxScore}</span>
        </div>
      </div>
      {label && <span className="text-slate-400 text-xs text-center">{label}</span>}
    </div>
  )
}

// EmployeeCard
export function EmployeeCard({ employee, onClick }) {
  const initials = employee.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400',
    manager: 'bg-blue-500/20 text-blue-400',
    employee: 'bg-emerald-500/20 text-emerald-400',
  }

  return (
    <div
      onClick={onClick}
      className="bg-surface-card border border-surface-border rounded-xl p-5 cursor-pointer hover:border-brand-500/50 hover:bg-surface-hover transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-brand-500/20">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors truncate">
                {employee.full_name}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{employee.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${roleColors[employee.role] || ''}`}>
              {employee.role}
            </span>
          </div>
          {employee.job_title && (
            <p className="text-slate-300 text-xs mt-1.5 truncate">{employee.job_title}</p>
          )}
          {employee.department && (
            <p className="text-slate-500 text-xs mt-1">
              📁 {employee.department.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// DeptCard
export function DeptCard({ department, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-card border border-surface-border rounded-xl p-5 cursor-pointer hover:border-brand-500/50 hover:bg-surface-hover transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-brand-400 text-lg">
          🏢
        </div>
        <span className="text-xs text-slate-500 bg-surface-DEFAULT px-2 py-1 rounded-full">
          {department.employee_count || 0} members
        </span>
      </div>
      <h3 className="text-white font-semibold group-hover:text-brand-400 transition-colors">
        {department.name}
      </h3>
      {department.description && (
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{department.description}</p>
      )}
      {department.skills && department.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {department.skills.slice(0, 3).map((ds) => (
            <span key={ds.id} className="text-xs bg-surface-DEFAULT text-slate-400 px-2 py-0.5 rounded">
              {ds.skill?.name}
            </span>
          ))}
          {department.skills.length > 3 && (
            <span className="text-xs text-slate-500">+{department.skills.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  )
}

// ChatMessage
export function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser ? 'bg-brand-600' : 'bg-emerald-600'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600/30 text-slate-100 rounded-tr-sm'
            : 'bg-surface-card border border-surface-border text-slate-200 rounded-tl-sm'
        }`}
      >
        {message.content}
        {message.created_at && (
          <p className="text-xs mt-1.5 opacity-50">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
