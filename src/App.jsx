import { useCallback, useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { DataProvider, useData } from './store/DataContext'
import { AuthProvider, useAuth } from './store/AuthContext'
import { can } from './store/permissions'
import { isPageId, navItems } from './navigation'
import { Card } from './components/ui'
import { Dashboard } from './pages/Dashboard'
import { Orders } from './pages/Orders'
import { Inventory } from './pages/Inventory'
import { Production } from './pages/Production'
import { QualityControl } from './pages/QualityControl'
import { FinishedGoods } from './pages/FinishedGoods'
import { Workers } from './pages/Workers'
import { Finance } from './pages/Finance'
import { Salary } from './pages/Salary'
import { SettingsPage } from './pages/Settings'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import './App.css'

const pages = {
  dashboard: Dashboard,
  orders: Orders,
  inventory: Inventory,
  production: Production,
  quality: QualityControl,
  'finished-goods': FinishedGoods,
  workers: Workers,
  finance: Finance,
  salary: Salary,
  settings: SettingsPage,
}

function readHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  if (id === '' || id === 'login' || id === 'signup') return id
  if (id === 'dispatch') return 'orders'
  return isPageId(id) ? id : 'dashboard'
}

function normalizeHash() {
  if (window.location.hash.replace(/^#\/?/, '') === 'dispatch') window.location.hash = '#/orders'
}

function Shell({ page, onHash }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toasts } = useData()
  const { user } = useAuth()

  useEffect(() => {
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [onHash])

  const navigate = useCallback((id) => {
    if (window.location.hash !== `#/${id}`) window.location.hash = `/${id}`
    onHash()
    setMenuOpen(false)
    document.querySelector('.main')?.scrollTo({ top: 0 })
  }, [onHash])

  const Page = pages[page]
  const allowed = can(user, 'page.open', page)
  const title = allowed ? navItems.find((n) => n.id === page)?.label ?? '' : 'No access'

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
          {allowed ? <Page onNavigate={navigate} /> : <NoAccess onNavigate={navigate} />}
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

function NoAccess({ onNavigate }) {
  useEffect(() => {
    document.title = 'No access · LoomFlow'
  }, [])
  return (
    <Card title="No access">
      <p className="muted">Your role cannot open this page.</p>
      <button type="button" className="btn primary" onClick={() => onNavigate('dashboard')}>Back to dashboard</button>
    </Card>
  )
}

function Root() {
  const { user } = useAuth()
  const [route, setRoute] = useState(readHash)
  const onHash = useCallback(() => {
    normalizeHash()
    setRoute(readHash())
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    normalizeHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [onHash])

  const isPublic = route === '' || route === 'login' || route === 'signup'
  useEffect(() => {
    if (!isPublic && !user && window.location.hash !== '#/login') window.location.hash = '#/login'
  }, [isPublic, user, route])

  useEffect(() => {
    if (route === 'login') document.title = 'Log in · LoomFlow'
    else if (route === 'signup') document.title = 'Sign up · LoomFlow'
    else if (route === '') document.title = 'LoomFlow — Textile mill management'
  }, [route])

  if (route === '') return <Landing />
  if (route === 'login') return <Login />
  if (route === 'signup') return <Signup />
  if (!user) return <Login />
  return <Shell page={route} onHash={onHash} />
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </DataProvider>
  )
}
