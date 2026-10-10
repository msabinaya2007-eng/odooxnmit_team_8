/** Shared Recharts styling — LoomFlow ink & saffron system */
export const chartColors = {
  navy: '#171A3A',
  teal: '#E8833A',
  tealLight: '#FBE3CC',
  slate: '#6B6F85',
  amber: '#C98A12',
  red: '#C8372D',
  green: '#1F8A5B',
}

/** Ordered categorical palette (ink → saffron → tints → neutrals) */
export const categorical = ['#171A3A', '#E8833A', '#3D4390', '#F0A35E', '#B9B3C7', '#D3CDB8']

export const axisProps = {
  stroke: '#E2DED2',
  tick: { fill: '#4A4F6A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
  tickLine: false,
  axisLine: false,
}

export const gridProps = { stroke: '#E2DED2', strokeDasharray: '3 3', vertical: false }

export const tooltipStyle = {
  contentStyle: {
    borderRadius: 16,
    border: '1px solid #E2DED2',
    background: '#FFFEFA',
    boxShadow: '0 1px 2px rgba(23,26,58,.06), 0 12px 32px rgba(23,26,58,.08)',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
  },
  labelStyle: { color: '#171A3A', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
}
