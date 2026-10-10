import { ArrowRight, Boxes, ClipboardList, Factory, IndianRupee, ShieldCheck, Users } from 'lucide-react'
import { orders } from '../data/demoData'
import { useState } from 'react'
import './public.css'

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function go(hash) {
  window.location.hash = hash
}

function Thread({ d }) {
  return (
    <div className="thread-wrap public-container" aria-hidden="true">
      <svg className="thread-svg" viewBox="0 0 1000 160" preserveAspectRatio="none">
        <path className="thread-svg-path" d={d} pathLength={1} />
      </svg>
    </div>
  )
}

const STEPS = [
  { n: '01', title: 'Yarn inward', text: 'Every cone and bale inwarded, weighed and shelved.' },
  { n: '02', title: 'Production', text: 'Looms and lines turn yarn into fabric, metre by metre.' },
  { n: '03', title: 'Quality check', text: 'Four-point inspection catches defects before dispatch.' },
  { n: '04', title: 'Finished goods', text: 'Passed rolls packed, labelled and binned by order.' },
  { n: '05', title: 'Dispatch', text: 'Bales loaded and lorries tracked to the buyer.' },
  { n: '06', title: 'Accounts', text: 'Invoices raised, costs tallied, profit made clear.' },
]

function TrackForm() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    const found = orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase())
    setResult(found
      ? { ok: true, text: `${found.id} · ${found.customer} — ${found.status}.` }
      : { ok: false, text: 'No demo order with that ID. Try ORD-1048.' })
  }

  return (
    <form className="track-form" onSubmit={submit}>
      <div className="field">
        <span><label htmlFor="track-order">Order ID</label></span>
        <input id="track-order" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID · ORD-2410" autoComplete="off" />
      </div>
      <div className="field">
        <span><label htmlFor="track-phone">Buyer phone</label></span>
        <input id="track-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Buyer phone · +91" inputMode="tel" autoComplete="off" />
      </div>
      <div>
        <button type="submit" className="btn primary">Track <ArrowRight size={18} /></button>
      </div>
      {result && <p className={`track-result${result.ok ? '' : ' miss'}`} role="status">{result.text}</p>}
    </form>
  )
}

export function Landing() {
  return (
    <div className="public-page">
      <nav className="pill-nav" aria-label="Site">
        <button type="button" className="pill-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark">LF</span> LoomFlow
        </button>
        <div className="pill-nav-links">
          <button type="button" onClick={() => scrollToId('features')}>Features</button>
          <button type="button" onClick={() => scrollToId('how')}>How it works</button>
          <button type="button" onClick={() => scrollToId('track')}>Track order</button>
        </div>
        <div className="pill-nav-auth">
          <button type="button" className="btn ghost" onClick={() => go('#/login')}>Log in</button>
          <button type="button" className="btn primary" onClick={() => go('#/signup')}>Sign up</button>
        </div>
      </nav>

      <header className="hero public-container">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Woven for the way you work</span>
            <h1>Run your whole mill from one screen</h1>
            <p className="hero-sub">From the first yarn inward to the last rupee collected. Keep your people, production and paperwork in one place.</p>
            <div className="hero-actions">
              <button type="button" className="btn primary" onClick={() => go('#/signup')}>Sign up <ArrowRight size={18} /></button>
              <button type="button" className="btn outline" onClick={() => scrollToId('how')}>See how it works</button>
            </div>
          </div>
          <div className="live-tile" role="img" aria-label="Preview of the LoomFlow mill overview">
            <span className="eyebrow">Sri Lakshmi Textiles / Live mill overview</span>
            <h2>A good day on the floor.</h2>
            <div className="live-stats">
              <div className="live-stat tile-mint">8 / 12<small>machines running</small></div>
              <div className="live-stat tile-saffron">24<small>active orders</small></div>
            </div>
            <div className="live-rows">
              <div className="row"><span className="live-dot" /> ORD-2410 · Kaveri Fabrics · In production</div>
              <div className="row"><span className="live-dot" /> RL-2410-017 · 240 m · Quality passed</div>
            </div>
            <div className="live-output">Today&apos;s output<strong>4,820 metres</strong></div>
            <div className="selvedge" aria-hidden="true" />
          </div>
        </div>
      </header>

      <Thread d="M 8 70 C 180 20, 360 110, 560 64 S 840 24, 992 58" />

      <section className="section public-container" id="how" aria-labelledby="how-h">
        <div className="section-head">
          <span className="eyebrow">Yarn to accounts</span>
          <h2 id="how-h">How it works</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} className="step">
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <Thread d="M 10 86 C 120 20, 220 140, 320 80 S 520 10, 640 74 S 880 146, 990 52" />

      <section className="section public-container" id="features" aria-labelledby="feat-h">
        <div className="section-head">
          <span className="eyebrow">Mill capabilities</span>
          <h2 id="feat-h">Features</h2>
        </div>
        <div className="features-bento">
          <article className="feature-tile tile-saffron span-7">
            <span className="feature-icon"><ClipboardList size={24} /></span>
            <h3>Order to dispatch</h3>
            <p>Keep every buyer promise on track.</p>
            <div className="timeline-chips" aria-hidden="true">
              <span>Pending</span><span className="on">In Production</span><span>Quality Check</span><span>Ready</span><span>Dispatched</span>
            </div>
          </article>
          <article className="feature-tile span-5">
            <span className="feature-icon"><Boxes size={24} /></span>
            <h3>Stock without surprises</h3>
            <p>Know your yarn before the loom stops.</p>
            <div className="mini-rows">
              <div>Cotton 40s · 2,800 kg in stock</div>
              <div>Viscose · 680 kg · reorder soon</div>
            </div>
          </article>
          <article className="feature-tile tile-mint span-5">
            <span className="feature-icon"><Factory size={24} /></span>
            <h3>A connected production floor</h3>
            <p>Every machine, operator and metre.</p>
            <div className="gauge" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="#B9DFCB" strokeWidth="10" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="#E8833A" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={188.5} strokeDashoffset={188.5 * (1 - 0.86)} transform="rotate(-90 36 36)" />
              </svg>
              <strong>86%</strong>
            </div>
          </article>
          <article className="feature-tile span-7">
            <span className="feature-icon"><ShieldCheck size={24} /></span>
            <h3>Quality in every roll</h3>
            <p>Catch defects before they leave the mill.</p>
          </article>
          <article className="feature-tile tile-indigo span-6">
            <span className="feature-icon"><Users size={24} /></span>
            <h3>People and attendance</h3>
            <p>Make each shift count, fairly.</p>
          </article>
          <article className="feature-tile tile-dark span-6">
            <span className="feature-icon"><IndianRupee size={24} /></span>
            <h3>A clearer bottom line</h3>
            <p>Follow every cost and rupee earned.</p>
          </article>
        </div>
      </section>

      <Thread d="M 10 92 C 130 20, 240 150, 380 88 S 610 20, 760 86 S 940 150, 990 44" />

      <section className="section public-container" id="track" aria-labelledby="track-h">
        <div className="track-card">
          <div>
            <span className="eyebrow">Order tracking</span>
            <h2 id="track-h">Track your order</h2>
            <p>Enter your order ID and buyer phone to see where your fabric is.</p>
          </div>
          <TrackForm />
        </div>
      </section>

      <footer className="site-footer public-container">
        <div className="footer-inner">
          <div>
            <h2>LoomFlow</h2>
            <p>Made for the rhythm of your mill. © 2026 LoomFlow</p>
          </div>
          <button type="button" className="btn outline" onClick={() => go('#/signup')}>Sign up <ArrowRight size={18} /></button>
        </div>
      </footer>
    </div>
  )
}
