import { useCallback, useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { DataProvider, useData } from './store/DataContext'
import { isPageId, navItems } from './navigation'
import { Dashboard } from './pages/Dashboard'
import { Orders } from './pages/Orders'
import { Inventory } from './pages/Inventory'
import { Production } from './pages/Production'
import { QualityControl } from './pages/QualityControl'
import { FinishedGoods } from './pages/FinishedGoods'
import { DispatchPage } from './pages/Dispatch'
import { Workers } from './pages/Workers'
import { Finance } from './pages/Finance'
import { SettingsPage } from './pages/Settings'
import './App.css'

const pages = {
  dashboard: Dashboard,
  orders: Orders,
  inventory: Inventory,
  production: Production,
  quality: QualityControl,
  'finished-goods': FinishedGoods,
  dispatch: DispatchPage,
  workers: Workers,
  finance: Finance,
  settings: SettingsPage,
}

function readHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return isPageId(id) ? id : 'dashboard'
}

function Shell() {
  const [page, setPage] = useState(readHash)
  const [menuOpen, setMenuOpen] = useState(false)
  const { toasts } = useData()

  useEffect(() => {
    const onHash = () => setPage(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((id) => {
    if (window.location.hash !== `#/${id}`) window.location.hash = `/${id}`
    setPage(id)
    setMenuOpen(false)
    document.querySelector('.main')?.scrollTo({ top: 0 })
  }, [])

  const Page = pages[page]
  const title = navItems.find((n) => n.id === page)?.label ?? ''

  useEffect(() => {
    document.title = `${title} · LoomFlow`
  }, [title])

  return (
    <div className="app">
      <Sidebar active={page} open={menuOpen} onNavigate={navigate} />
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
      <div className="main">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} onNavigate={navigate} />
        <main className="content">
          <Page onNavigate={navigate} />
        </main>
      </div>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast"><CircleCheck size={16} /> {t.message}</div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  )
}
