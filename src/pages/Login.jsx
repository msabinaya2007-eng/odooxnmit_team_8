import { useCallback, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import './public.css'

const ROLES = ['Super Admin', 'Admin', 'Staff']

export function Login() {
  const { login, users } = useAuth()
  const adminList = users.filter((u) => u.role === 'Admin')
  const staffList = users.filter((u) => u.role === 'Staff')
  const [role, setRole] = useState(ROLES[0])
  const [personName, setPersonName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const people = role === 'Admin' ? adminList : staffList

  const submit = useCallback((e) => {
    e.preventDefault()
    if (role === 'Super Admin') {
      login({ name: 'Owner', role: 'Super Admin', workerId: null, department: 'Management' })
    } else {
      const w = people.find((u) => u.name === personName) ?? people[0]
      if (!w) return
      login({ name: w.name, role, workerId: w.workerId, department: w.department })
    }
    window.location.hash = '#/dashboard'
  }, [role, personName, people, login])

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
            {role !== 'Super Admin' && (
              <div className="field">
                <span><label htmlFor="login-person">{role === 'Admin' ? 'Manager' : 'Worker'}</label></span>
                <select id="login-person" required value={personName} onChange={(e) => setPersonName(e.target.value)}>
                  <option value="">Select…</option>
                  {people.map((w) => <option key={w.workerId ?? w.name} value={w.name}>{w.name}</option>)}
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
