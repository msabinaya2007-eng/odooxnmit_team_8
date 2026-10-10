import { useEffect, type ReactNode } from 'react'
import { Search, X, type LucideIcon } from 'lucide-react'

/* ---------- Page header ---------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

/* ---------- Card / panel ---------- */
export function Card({ title, actions, children, className = '' }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          {title && <h2>{title}</h2>}
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

/* ---------- KPI stat card ---------- */
type Tone = 'navy' | 'teal' | 'amber' | 'red' | 'green' | 'slate'

export function StatCard({ label, value, hint, icon: Icon, tone = 'navy', onClick }: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: LucideIcon
  tone?: Tone
  onClick?: () => void
}) {
  const content = (
    <>
      <span className={`stat-icon tone-${tone}`}><Icon size={20} /></span>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </>
  )
  return onClick
    ? <button type="button" className="stat-card clickable" onClick={onClick}>{content}</button>
    : <div className="stat-card">{content}</div>
}

/* ---------- Status badge ---------- */
const badgeTone: Record<string, Tone> = {
  // orders
  Pending: 'slate', 'In Production': 'teal', 'Quality Check': 'amber', Ready: 'green', Dispatched: 'navy', Cancelled: 'red',
  // machines
  Running: 'green', Idle: 'slate', Maintenance: 'amber', Breakdown: 'red',
  // QC
  Passed: 'green', Failed: 'red', Rework: 'amber',
  // dispatch
  Scheduled: 'slate', Loading: 'amber', 'In Transit': 'teal', Delivered: 'green',
  // attendance
  Present: 'green', Absent: 'red', Late: 'amber', 'On Leave': 'slate',
  // invoices
  Paid: 'green', Unpaid: 'amber', Overdue: 'red',
  // priority / stock
  High: 'red', Medium: 'amber', Low: 'slate', 'Low stock': 'red', OK: 'green', Reserved: 'navy', Available: 'teal',
}

export function Badge({ children, tone }: { children: string; tone?: Tone }) {
  return <span className={`badge tone-${tone ?? badgeTone[children] ?? 'slate'}`}>{children}</span>
}

/* ---------- Progress bar ---------- */
export function Progress({ value, tone = 'teal' }: { value: number; tone?: Tone }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-fill tone-${tone}`} style={{ width: `${v}%` }} />
    </div>
  )
}

/* ---------- Toolbar: search + filters ---------- */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="search-input">
      <Search size={16} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && (
        <button type="button" className="icon-btn small" onClick={() => onChange('')} aria-label="Clear search"><X size={14} /></button>
      )}
    </label>
  )
}

export function SelectFilter<T extends string>({ label, value, options, onChange }: { label: string; value: T | 'All'; options: readonly T[]; onChange: (v: T | 'All') => void }) {
  return (
    <label className="select-filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T | 'All')}>
        <option value="All">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

/** Pill-style tabs used as quick filters */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}{o.count !== undefined && <span className="seg-count">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

/* ---------- Data table ---------- */
export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

export function DataTable<T>({ columns, rows, rowKey, empty = 'No records match your filters.' }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; empty?: string }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={{ textAlign: c.align ?? 'left' }}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-row">{empty}</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c) => <td key={c.key} className={c.className} style={{ textAlign: c.align ?? 'left' }}>{c.render(r)}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  )
}

/* ---------- Form field ---------- */
export function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {description && <div className="muted small">{description}</div>}
      </div>
      <input type="checkbox" className="toggle" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function DemoTag() {
  return <span className="demo-tag" title="All figures on this page are sample data. No database is connected.">Demo data</span>
}
