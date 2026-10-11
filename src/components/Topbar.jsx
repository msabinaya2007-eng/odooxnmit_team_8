import { useState } from 'react'
import { Bell, Check, LogOut, Menu, Search, TriangleAlert, Wrench, ShieldCheck } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { Badge } from './ui'
import { DEMO_TODAY } from '../data/demoData'
import { formatDate } from '../utils/format'

const ROLE_TONE = { 'Super Admin': 'navy', Admin: 'teal', Staff: 'slate' }

function initials(name) {
  const parts = name.split(/\s+/).map((p) => p.replace(/[^A-Za-z]/g, '').charAt(0)).filter(Boolean)
  return (parts.slice(0, 2).join('') || '?').toUpperCase()
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Topbar({ title, onMenu, onNavigate }) {
  const { materials, machines, inspections, isLowStock, settings, notify } = useData()
  const { user, users, switchUser, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [search, setSearch] = useState('')

  const alerts = [
    ...(settings.notifyLowStock
      ? materials.filter(isLowStock).map((m) => ({ key: m.id, icon: TriangleAlert, text: `Low stock: ${m.name}`, page: 'inventory' }))
      : []),
    ...(settings.notifyBreakdown
      ? machines.filter((m) => m.status === 'Breakdown').map((m) => ({ key: m.id, icon: Wrench, text: `Breakdown: ${m.name}`, page: 'production' }))
      : []),
    ...(settings.notifyQcFail
      ? inspections.filter((i) => i.result === 'Failed').map((i) => ({ key: i.id, icon: ShieldCheck, text: `QC failed: ${i.batchId} ${i.product}`, page: 'quality' }))
      : []),
  ]

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="topbar-greeting">
        <small>{greeting()}</small>
        <strong>{title}</strong>
      </div>
      <form
        className="search-input topbar-search"
        role="search"
        onSubmit={(e) => { e.preventDefault(); onNavigate('orders') }}
      >
        <Search size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search" />
      </form>
      <div className="topbar-right">
        <span className="demo-banner" title="No database connected — all records are sample data">Demo mode · sample data</span>
        <span className="topbar-date muted">{formatDate(DEMO_TODAY)}</span>
        <div className="notif">
          <button type="button" className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label={`Notifications (${alerts.length})`} aria-expanded={open}>
            <Bell size={20} />
            {alerts.length > 0 && <span className="notif-dot">{alerts.length}</span>}
          </button>
          {open && (
            <div className="notif-panel" role="menu">
              <div className="notif-head">Alerts</div>
              {alerts.length === 0 && <div className="muted small notif-empty">No active alerts</div>}
              {alerts.map((a) => (
                <button key={a.key} type="button" className="notif-item" onClick={() => { onNavigate(a.page); setOpen(false) }}>
                  <a.icon size={16} /> <span>{a.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="user-menu">
          <button type="button" className="user-btn" onClick={() => setUserOpen((o) => !o)} aria-label={`Signed in as ${user.name}, ${user.role}`} aria-expanded={userOpen}>
            <span className="avatar" title={`${user.name} (${user.role})`}>{initials(user.name)}</span>
            <span className="user-meta">
              <span className="user-name">{user.name}</span>
              <Badge tone={ROLE_TONE[user.role] ?? 'slate'}>{user.role}</Badge>
            </span>
          </button>
          {userOpen && (
            <div className="notif-panel" role="menu" aria-label="View as">
              <div className="notif-head">View as</div>
              {users.map((u) => {
                const current = u.name === user.name && u.role === user.role
                return (
                  <button key={`${u.role}-${u.name}`} type="button" className="notif-item" onClick={() => { switchUser(u); setUserOpen(false); notify(`Viewing as ${u.name} (${u.role})`) }}>
                    <span className="avatar small" aria-hidden="true">{initials(u.name)}</span>
                    <span>{u.name}</span>
                    {current ? <Check size={16} aria-label="Current user" /> : <Badge tone={ROLE_TONE[u.role] ?? 'slate'}>{u.role}</Badge>}
                  </button>
                )
              })}
              <div className="notif-head">Account</div>
              <button
                type="button"
                className="notif-item"
                onClick={() => { logout(); setUserOpen(false); window.location.hash = '#/' }}
              >
                <LogOut size={16} /> <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
