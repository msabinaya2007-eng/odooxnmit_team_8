import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useData } from '../store/DataContext'
import './public.css'

export function Signup() {
  const { login } = useAuth()
  const { setSettings } = useData()
  const [form, setForm] = useState({ mill: '', gstin: '', city: '', phone: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const millName = form.mill.trim()
    if (millName) setSettings((prev) => ({ ...prev, companyName: millName }))
    login({ name: 'Owner', role: 'Super Admin', workerId: null, department: 'Management' })
    window.location.hash = '#/dashboard'
  }

  return (
    <div className="public-page">
      <main className="auth-wrap">
        <div className="auth-card">
          <a className="auth-back" href="#/">← Back to home</a>
          <div>
            <span className="auth-brand"><span className="brand-mark">LF</span> LoomFlow</span>
          </div>
          <h1>Set your mill in motion.</h1>
          <p className="auth-sub">Every roll, order and rupee in one place.</p>
          <form className="auth-form" onSubmit={submit}>
            <p className="eyebrow" style={{ margin: 0 }}>Step 1 of 2 · Mill details</p>
            <div className="field">
              <span><label htmlFor="su-mill">Mill name</label></span>
              <input id="su-mill" required value={form.mill} onChange={set('mill')} placeholder="Sri Lakshmi Textiles" autoComplete="organization" />
            </div>
            <div className="field">
              <span><label htmlFor="su-gstin">GSTIN</label></span>
              <input id="su-gstin" value={form.gstin} onChange={set('gstin')} placeholder="33AAAAA0000A1Z5" autoComplete="off" />
            </div>
            <div className="field">
              <span><label htmlFor="su-city">City</label></span>
              <input id="su-city" value={form.city} onChange={set('city')} placeholder="Coimbatore" autoComplete="address-level2" />
            </div>
            <div className="field">
              <span><label htmlFor="su-phone">Phone</label></span>
              <input id="su-phone" value={form.phone} onChange={set('phone')} placeholder="+91" inputMode="tel" autoComplete="tel" />
            </div>
            <p className="auth-note">Admins and staff are added by the Super Admin after sign-up.</p>
            <button type="submit" className="btn primary">Continue to owner account <ArrowRight size={18} /></button>
          </form>
          <p className="auth-switch">Already have a workspace? <a href="#/login">Log in</a></p>
        </div>
      </main>
    </div>
  )
}
