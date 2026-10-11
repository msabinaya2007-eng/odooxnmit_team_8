import { Spool } from 'lucide-react'
import { navItems } from '../navigation'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../store/permissions'

export function Sidebar({ active, open, onNavigate }) {
  const { settings } = useData()
  const { user } = useAuth()
  const visible = navItems.filter((n) => can(user, 'page.open', n.id))
  const sections = [...new Set(visible.map((n) => n.section))]

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
      <div className="brand">
        <span className="brand-mark"><Spool size={22} /></span>
        <div>
          <div className="brand-name">LoomFlow</div>
          <div className="brand-sub">Smart Textile Manufacturing</div>
        </div>
      </div>

      <nav className="nav">
        {sections.map((section) => (
          <div key={section} className="nav-section">
            <div className="nav-section-label">{section}</div>
            {visible.filter((n) => n.section === section).map((item) => (
              <a
                key={item.id}
                href={`#/${item.id}`}
                className={`nav-link ${active === item.id ? 'active' : ''}`}
                aria-current={active === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="plant-name">{settings.companyName}</div>
        <div className="muted small">{settings.plantLocation}</div>
      </div>
    </aside>
  )
}
