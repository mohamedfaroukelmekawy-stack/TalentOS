import { getScoreColor } from '../utils/scoreHelpers'

export default function ScoreRing({ score, max = 5, size = 80, label }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const pct = score / max
  const offset = circumference * (1 - pct)
  const color = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={8} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{score.toFixed(1)}</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
    </div>
  )
}
