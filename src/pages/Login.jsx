import { useCallback, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import './public.css'

const ROLES = ['Super Admin', 'Admin', 'Staff']

export function Login() {
  const { login, users } = useAuth()
  const staffList = users.filter((u) => u.role === 'Staff')
  const [role, setRole] = useState(ROLES[0])
  const [workerName, setWorkerName] = useState(staffList[0]?.name ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = useCallback((e) => {
    e.preventDefault()
    if (role === 'Staff') {
      const w = staffList.find((u) => u.name === workerName) ?? staffList[0]
      login({ name: w.name, role: 'Staff', workerId: w.workerId })
    } else if (role === 'Super Admin') {
      login({ name: 'Owner', role: 'Super Admin', workerId: null })
    } else {
      login({ name: 'Plant Manager', role: 'Admin', workerId: null })
    }
    window.location.hash = '#/dashboard'
  }, [role, workerName, staffList, login])

  return (
    <div className="public-page">
      <main className="auth-wrap">
        <div className="auth-card">
          <a className="auth-back" href="#/">← Back to home</a>
          <div>
            <span className="auth-brand"><span className="brand-mark">LF</span> LoomFlow</span>
          </div>
          <h1>Welcome back.</h1>
          <p className="auth-sub">Every roll, order and rupee in one place. Choose your role and sign in to your workspace.</p>
          <form className="auth-form" onSubmit={submit}>
            <div className="role-chips" role="radiogroup" aria-label="Choose your role">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  className={`role-chip${role === r ? ' on' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            {role === 'Staff' && (
              <div className="field">
                <span><label htmlFor="login-worker">Worker</label></span>
                <select id="login-worker" required value={workerName} onChange={(e) => setWorkerName(e.target.value)}>
                  {staffList.map((w) => <option key={w.workerId} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <span><label htmlFor="login-email">Email</label></span>
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mill.com" autoComplete="email" />
            </div>
            <div className="field">
              <span><label htmlFor="login-password">Password</label></span>
              <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn primary">Log in <ArrowRight size={18} /></button>
          </form>
          <p className="auth-switch">New to LoomFlow? <a href="#/signup">Sign up</a></p>
          <p className="auth-note auth-tag">Demo only — no real authentication yet. Any email signs in.</p>
        </div>
      </main>
    </div>
  )
}
