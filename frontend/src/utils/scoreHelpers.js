export const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

export const getLevelLabel = (score) => LEVEL_LABELS[Math.round(score)] || 'Unknown'

export const getGapColor = (gap) => {
  if (gap <= 0) return '#22c55e'
  if (gap <= 1) return '#f59e0b'
  if (gap <= 2) return '#f97316'
  return '#ef4444'
}

export const getScoreColor = (score) => {
  if (score >= 4.5) return '#22c55e'
  if (score >= 3.5) return '#84cc16'
  if (score >= 2.5) return '#f59e0b'
  if (score >= 1.5) return '#f97316'
  return '#ef4444'
}

export const getGapBadgeClass = (gap) => {
  if (gap <= 0) return 'bg-green-100 text-green-700'
  if (gap <= 1) return 'bg-yellow-100 text-yellow-700'
  if (gap <= 2) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export const getRoleBadgeClass = (role) => {
  const map = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-gray-100 text-gray-700',
  }
  return map[role] || 'bg-gray-100 text-gray-700'
}

export const formatPercent = (value, max = 5) => Math.round((value / max) * 100)
