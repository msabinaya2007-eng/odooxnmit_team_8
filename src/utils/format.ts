const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('en-IN')

export const formatINR = (value: number) => inr.format(value)
export const formatNumber = (value: number) => num.format(value)

/** Compact INR, e.g. ₹12.4L or ₹1.2Cr */
export function formatINRCompact(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`
  return `₹${value}`
}

export function formatDate(iso: string) {
  if (!iso || iso === '—') return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function matchesSearch(query: string, ...fields: (string | number | undefined)[]) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return fields.some((f) => f !== undefined && String(f).toLowerCase().includes(q))
}

/** Builds a CSV from rows and triggers a browser download */
export function downloadCSV(filename: string, rows: Record<string, string | number | undefined>[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
