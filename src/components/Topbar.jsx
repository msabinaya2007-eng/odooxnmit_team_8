import { useState } from 'react'
import { Bell, Menu, TriangleAlert, Wrench, ShieldCheck } from 'lucide-react'
import { useData } from '../store/DataContext'
import { DEMO_TODAY } from '../data/demoData'
import { formatDate } from '../utils/format'

export function Topbar({ title, onMenu, onNavigate }) {
  const { materials, machines, inspections, isLowStock, settings } = useData()
  const [open, setOpen] = useState(false)

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
      <div className="topbar-title">
        <span className="crumb">LoomFlow</span>
        <span className="crumb-sep">/</span>
        <strong>{title}</strong>
      </div>
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
        <div className="avatar" title="Demo user (Plant Manager)">PM</div>
      </div>
    </header>
  )
}
