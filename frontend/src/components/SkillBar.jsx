import { getGapColor, getScoreColor } from '../utils/scoreHelpers'

export default function SkillBar({ skillName, currentScore, requiredLevel, category }) {
  const pct = (currentScore / 5) * 100
  const reqPct = (requiredLevel / 5) * 100
  const gap = requiredLevel - currentScore

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-gray-800">{skillName}</span>
          {category && (
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{category}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold" style={{ color: getScoreColor(currentScore) }}>
            {currentScore}/5
          </span>
          <span className="text-gray-400">→ {requiredLevel}/5</span>
          {gap > 0 && (
            <span className="font-medium" style={{ color: getGapColor(gap) }}>
              -{gap.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: getScoreColor(currentScore) }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-amber-500 opacity-70"
          style={{ left: `${reqPct}%` }}
        />
      </div>
    </div>
  )
}
