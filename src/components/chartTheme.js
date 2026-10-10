/** Shared Recharts styling so every chart reads as one system */
export const chartColors = {
  navy: '#1e3a5f',
  teal: '#0d9488',
  tealLight: '#5eead4',
  slate: '#94a3b8',
  amber: '#d97706',
  red: '#dc2626',
  green: '#16a34a',
}

/** Ordered categorical palette (navy → teal family → neutrals) */
export const categorical = ['#1e3a5f', '#0d9488', '#3b6ea5', '#5eb8ad', '#94a3b8', '#c7d2de']

export const axisProps = {
  stroke: '#94a3b8',
  tick: { fill: '#64748b', fontSize: 12 },
  tickLine: false,
  axisLine: false,
}

export const gridProps = { stroke: '#e2e8f0', strokeDasharray: '3 3', vertical: false }

export const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,35,64,.08)', fontSize: 13 },
  labelStyle: { color: '#0f2340', fontWeight: 600 },
}
