import { Spool } from 'lucide-react'
import { navItems, type NavItem, type PageId } from '../navigation'
import { useData } from '../store/DataContext'

export function Sidebar({ active, open, onNavigate }: { active: PageId; open: boolean; onNavigate: (id: PageId) => void }) {
  const { settings } = useData()
  const sections = [...new Set(navItems.map((n) => n.section))]

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
            {navItems.filter((n) => n.section === section).map((item: NavItem) => (
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
