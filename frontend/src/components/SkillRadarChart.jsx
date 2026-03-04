import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'

export default function SkillRadarChart({ data, height = 320 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No assessment data available
      </div>
    )
  }

  const chartData = data.map((item) => ({
    skill: item.skill_name?.length > 12 ? item.skill_name.slice(0, 12) + '…' : item.skill_name,
    Current: item.current_score,
    Required: item.required_level,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
        <Radar name="Current" dataKey="Current" stroke="#6272f1" fill="#6272f1" fillOpacity={0.25} strokeWidth={2} />
        <Radar name="Required" dataKey="Required" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v}/5`]} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
