import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Gauge, Lock, Pause, Play, Power, Wrench } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, Progress, SearchInput, Segmented, StatCard, Toolbar } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { formatDate, formatNumber, matchesSearch } from '../utils/format'

const STATUSES = ['Running', 'Idle', 'Maintenance', 'Breakdown']
const STAGES = ['Spinning', 'Weaving', 'Dyeing', 'Finishing', 'Stitching', 'Packing']
const ISSUE_TYPES = ['Stopped running', 'Loud noise', 'Vibration', 'Quality problem', 'Overheating', 'Other']
const MAINT_PRIORITIES = ['Low', 'Medium', 'High']

function nowLocal() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function formatSince(dt) {
  if (!dt) return '—'
  const [date, time] = dt.split('T')
  return time ? `${formatDate(date)}, ${time}` : formatDate(date)
}

export function Production() {
  const { machines, setMachines, batches, setBatches, maintenanceTickets, setMaintenanceTickets, workers, notify } = useData()
  const { user, canOperate, canReportIssue, canManageMaintenance } = useAuth()
  const [statusFilter, setStatusFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [panelFor, setPanelFor] = useState(null)
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [since, setSince] = useState('')
  const [mechanic, setMechanic] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [expectedFix, setExpectedFix] = useState('')

  const openTicketFor = (machineId) => maintenanceTickets.find((t) => t.machineId === machineId && t.status !== 'Resolved')
  const mechanics = workers.filter((w) => w.department === 'Maintenance' || /maintenance/i.test(w.role))
  const panelMachine = panelFor ? machines.find((m) => m.id === panelFor) ?? null : null
  const panelTicket = panelFor ? openTicketFor(panelFor) : null

  const shown = useMemo(
    () => machines.filter((m) => (statusFilter === 'All' || m.status === statusFilter) && matchesSearch(query, m.id, m.name, m.operator, m.line, m.type)),
    [machines, statusFilter, query],
  )

  const running = machines.filter((m) => m.status === 'Running')
  const avgEff = Math.round(running.reduce((s, m) => s + m.efficiency, 0) / Math.max(running.length, 1))
  const output = machines.reduce((s, m) => s + m.outputToday, 0)
  const down = machines.filter((m) => m.status === 'Breakdown' || m.status === 'Maintenance').length

  const requestStatus = (m, status) => {
    if (!canOperate(m)) {
      notify("Only this machine's operator or an admin can start or pause")
      return
    }
    const open = openTicketFor(m.id)
    if (status === 'Running' && open) {
      notify(`Resolve maintenance ticket ${open.id} first`)
      return
    }
    setMachines((prev) => prev.map((x) => (x.id === m.id ? { ...x, status, efficiency: status === 'Running' ? Math.max(x.efficiency, 80) : 0 } : x)))
    notify(`${m.name} set to ${status}`)
  }

  const openPanel = (m) => {
    const t = openTicketFor(m.id)
    setIssueType('')
    setDescription('')
    setSince(nowLocal())
    setMechanic(t?.mechanic ?? '')
    setPriority(t?.priority ?? 'Medium')
    setExpectedFix(t?.expectedFix ?? '')
    setPanelFor(m.id)
  }

  const reportIssue = (e) => {
    e.preventDefault()
    const m = panelMachine
    if (!m) return
    if (!canReportIssue(m)) {
      notify("Only this machine's operator or an admin can report an issue")
      return
    }
    if (openTicketFor(m.id)) {
      notify(`${m.name} already has an open ticket`)
      return
    }
    if (!issueType) {
      notify('Choose what the issue is')
      return
    }
    if (issueType === 'Other' && !description.trim()) {
      notify('Describe the problem')
      return
    }
    if (!since) {
      notify('Set when the issue started')
      return
    }
    if (since > nowLocal()) {
      notify('Issue time cannot be in the future')
      return
    }
    const next = Math.max(0, ...maintenanceTickets.map((t) => Number(t.id.split('-')[1]))) + 1
    const ticket = {
      id: `MT-${next}`,
      machineId: m.id,
      issueType,
      description: description.trim(),
      since,
      reportedBy: user.name,
      reportedAt: nowLocal(),
      mechanic: '',
      priority: 'Medium',
      expectedFix: '',
      status: 'Open',
    }
    setMaintenanceTickets((prev) => [ticket, ...prev])
    if (issueType === 'Stopped running') {
      setMachines((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: 'Breakdown', efficiency: 0 } : x)))
      notify(`Ticket ${ticket.id} reported — ${m.name} set to Breakdown`)
    } else {
      notify(`Ticket ${ticket.id} reported for ${m.name}`)
    }
  }

  const assignMechanic = (e) => {
    e.preventDefault()
    const m = panelMachine
    const t = panelTicket
    if (!m || !t) return
    if (!canManageMaintenance) {
      notify('Only an admin can assign a mechanic')
      return
    }
    if (!mechanic) {
      notify('Choose a mechanic')
      return
    }
    if (!expectedFix) {
      notify('Set an expected fix time')
      return
    }
    if (expectedFix <= t.since) {
      notify('Expected fix must be after the issue started')
      return
    }
    setMaintenanceTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, mechanic, priority, expectedFix, status: 'Assigned' } : x)))
    setMachines((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: 'Maintenance', efficiency: 0 } : x)))
    notify(`${t.id} assigned to ${mechanic} — ${m.name} set to Maintenance`)
  }

  const resolveTicket = () => {
    const m = panelMachine
    const t = panelTicket
    if (!m || !t) return
    if (!canManageMaintenance) {
      notify('Only an admin can resolve a ticket')
      return
    }
    if (t.status !== 'Assigned') {
      notify('Assign a mechanic before resolving')
      return
    }
    setMaintenanceTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: 'Resolved' } : x)))
    setMachines((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: 'Idle', efficiency: 0 } : x)))
    notify(`${t.id} resolved — ${m.name} set to Idle`)
  }

  const advanceStage = (id) => {
    setBatches((prev) => prev.map((b) => {
      if (b.id !== id) return b
      const idx = STAGES.indexOf(b.stage)
      return idx < STAGES.length - 1 ? { ...b, stage: STAGES[idx + 1] } : b
    }))
    notify(`Batch ${id} moved to next stage`)
  }

  const byLine = [...new Set(machines.map((m) => m.line))].map((line) => ({
    line,
    output: machines.filter((m) => m.line === line).reduce((s, m) => s + m.outputToday, 0),
  }))

  const ticketRows = [...maintenanceTickets].sort(
    (a, b) => b.reportedAt.localeCompare(a.reportedAt) || Number(b.id.split('-')[1]) - Number(a.id.split('-')[1]),
  )

  return (
    <>
      <PageHeader title="Production Floor" subtitle="Live machine status and work-in-progress batches" actions={<DemoTag />} />

      <div className="stat-grid">
        <StatCard icon={Activity} label="Machines running" value={`${running.length} / ${machines.length}`} tone="green" />
        <StatCard icon={Gauge} label="Avg. efficiency (running)" value={`${avgEff}%`} tone="teal" />
        <StatCard icon={Power} label="Output today (all units)" value={formatNumber(output)} hint="metres / pieces" tone="navy" />
        <StatCard icon={Wrench} label="Down / maintenance" value={down} tone={down ? 'red' : 'green'} />
      </div>

      <Card title="Machines">
        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search machine, operator, line…" />
          <Segmented
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: 'All', label: 'All', count: machines.length }, ...STATUSES.map((s) => ({ value: s, label: s, count: machines.filter((m) => m.status === s).length }))]}
          />
        </Toolbar>
        <div className="machine-grid">
          {shown.length === 0 && <p className="muted">No machines match.</p>}
          {shown.map((m) => {
            const open = openTicketFor(m.id)
            const allowed = canOperate(m)
            const startBlocked = !allowed || open
            const startTitle = !allowed
              ? "Only this machine's operator or an admin can start or pause"
              : 'Resolve the maintenance ticket first'
            return (
              <article key={m.id} className={`machine-card st-${m.status.toLowerCase()}`}>
                <header>
                  <div>
                    <strong>{m.name}</strong>
                    <div className="muted small">{m.id} · {m.line}</div>
                  </div>
                  <Badge>{m.status}</Badge>
                </header>
                {open && (
                  <div className="ticket-line">
                    <div><Badge tone={open.status === 'Assigned' ? 'amber' : 'red'}>{open.issueType}</Badge></div>
                    <span className="muted small">since {formatSince(open.since)} · {open.mechanic || 'Mechanic not assigned'}</span>
                  </div>
                )}
                <dl className="machine-meta">
                  <div><dt>Operator</dt><dd>{m.operator}</dd></div>
                  <div><dt>Job</dt><dd>{m.currentJob}</dd></div>
                  <div><dt>Output</dt><dd>{formatNumber(m.outputToday)}</dd></div>
                </dl>
                <div className="eff-row"><span className="muted small">Efficiency</span><strong>{m.efficiency}%</strong></div>
                <Progress value={m.efficiency} tone={m.efficiency >= 85 ? 'green' : m.efficiency > 0 ? 'amber' : 'slate'} />
                <div className="machine-actions">
                  {m.status !== 'Running'
                    ? (
                      startBlocked
                        ? <button type="button" className="btn small primary" disabled title={startTitle}>{!allowed && <Lock size={14} />} Start</button>
                        : <button type="button" className="btn small primary" onClick={() => requestStatus(m, 'Running')}><Play size={14} /> Start</button>
                    )
                    : (
                      allowed
                        ? <button type="button" className="btn small secondary" onClick={() => requestStatus(m, 'Idle')}><Pause size={14} /> Pause</button>
                        : <button type="button" className="btn small secondary" disabled title="Only this machine's operator or an admin can start or pause"><Lock size={14} /> Pause</button>
                    )}
                  <button type="button" className="btn small ghost" onClick={() => openPanel(m)}><Wrench size={14} /> Maintenance</button>
                </div>
              </article>
            )
          })}
        </div>
      </Card>

      <Card title="Maintenance tickets">
        <DataTable
          rows={ticketRows}
          rowKey={(t) => t.id}
          empty="No maintenance tickets yet."
          columns={[
            { key: 'id', header: 'Ticket', render: (t) => <strong>{t.id}</strong> },
            {
              key: 'machine', header: 'Machine', render: (t) => {
                const m = machines.find((x) => x.id === t.machineId)
                return m ? <><div>{m.name}</div><div className="muted small">{m.id}</div></> : t.machineId
              },
            },
            { key: 'issue', header: 'Issue', render: (t) => <><div>{t.issueType}</div>{t.description && <div className="muted small">{t.description}</div>}</> },
            { key: 'since', header: 'Since', render: (t) => formatSince(t.since) },
            { key: 'by', header: 'Reported by', render: (t) => t.reportedBy },
            { key: 'mech', header: 'Mechanic', render: (t) => (t.mechanic ? t.mechanic : <span className="muted">—</span>) },
            { key: 'pri', header: 'Priority', render: (t) => <Badge>{t.priority}</Badge> },
            { key: 'st', header: 'Status', render: (t) => <Badge tone={t.status === 'Assigned' ? 'amber' : t.status === 'Resolved' ? 'green' : 'slate'}>{t.status}</Badge> },
          ]}
        />
      </Card>

      <div className="grid-2-1">
        <Card title="Work-in-progress batches">
          <DataTable
            rows={batches}
            rowKey={(b) => b.id}
            columns={[
              { key: 'id', header: 'Batch', render: (b) => <><strong>{b.id}</strong><div className="muted small">{b.orderId}</div></> },
              { key: 'product', header: 'Product', render: (b) => b.product },
              { key: 'stage', header: 'Stage', render: (b) => <Badge tone="teal">{b.stage}</Badge> },
              { key: 'machine', header: 'Machines', render: (b) => <span className="muted">{b.machine}</span> },
              { key: 'progress', header: 'Progress', render: (b) => <div className="level-cell"><Progress value={b.progress} /><span className="small">{b.progress}%</span></div> },
              { key: 'qty', header: 'Produced', align: 'right', render: (b) => `${formatNumber(b.produced)} / ${formatNumber(b.target)} ${b.unit}` },
              { key: 'act', header: '', align: 'right', render: (b) => <button type="button" className="btn ghost small" disabled={b.stage === 'Packing'} onClick={() => advanceStage(b.id)}>Next stage</button> },
            ]}
          />
        </Card>
        <Card title="Output today by line">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLine} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="line" {...axisProps} interval={0} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis {...axisProps} width={44} />
                <Tooltip {...tooltipStyle} formatter={(v) => formatNumber(Number(v))} />
                <Bar dataKey="output" name="Output" fill={chartColors.teal} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Modal
        open={panelMachine !== null}
        title={panelMachine ? `Maintenance — ${panelMachine.name}` : 'Maintenance'}
        onClose={() => setPanelFor(null)}
        footer={<button type="button" className="btn secondary" onClick={() => setPanelFor(null)}>Close</button>}
      >
        {panelMachine && (() => {
          const t = panelTicket
          const canReport = canReportIssue(panelMachine)
          const readOnlyAll = !canReport && !canManageMaintenance
          return (
            <>
              {readOnlyAll && <p><Badge tone="slate">View only</Badge></p>}
              <h3>A. Report issue</h3>
              {!t ? (
                canReport ? (
                  <form onSubmit={reportIssue}>
                    <div className="form-grid">
                      <Field label="What is the issue?" full>
                        <div className="status-picker" role="radiogroup" aria-label="What is the issue?">
                          {ISSUE_TYPES.map((it) => (
                            <button key={it} type="button" role="radio" aria-checked={issueType === it} className={`btn small ${issueType === it ? 'primary' : 'secondary'}`} onClick={() => setIssueType(it)}>{it}</button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Describe the problem" full>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you see or hear?" rows={3} />
                      </Field>
                      <Field label="Issue since" full>
                        <input type="datetime-local" required value={since} max={nowLocal()} onChange={(e) => setSince(e.target.value)} />
                      </Field>
                    </div>
                    <div className="status-picker">
                      <button type="submit" className="btn primary">Report issue</button>
                    </div>
                  </form>
                ) : (
                  <p className="muted">Only this machine&apos;s operator or an admin can report an issue.</p>
                )
              ) : (
                <div className="form-grid">
                  <Field label="Issue"><div><Badge tone={t.status === 'Assigned' ? 'amber' : 'red'}>{t.issueType}</Badge></div></Field>
                  <Field label="Since"><div>{formatSince(t.since)}</div></Field>
                  {t.description && <Field label="Description" full><div>{t.description}</div></Field>}
                  <Field label="Reported by" full><div>{t.reportedBy} · {formatSince(t.reportedAt)}</div></Field>
                </div>
              )}
              <h3>B. Assign mechanic</h3>
              {!t ? (
                <p className="muted">No open ticket for this machine yet.</p>
              ) : canManageMaintenance ? (
                <form onSubmit={assignMechanic}>
                  <div className="form-grid">
                    <Field label="Mechanic">
                      <select required value={mechanic} onChange={(e) => setMechanic(e.target.value)}>
                        <option value="">Select mechanic</option>
                        {mechanics.map((w) => <option key={w.id} value={w.name}>{w.name} · {w.role}</option>)}
                      </select>
                    </Field>
                    <Field label="Priority">
                      <div className="status-picker" role="radiogroup" aria-label="Priority">
                        {MAINT_PRIORITIES.map((p) => (
                          <button key={p} type="button" role="radio" aria-checked={priority === p} className={`btn small ${priority === p ? 'primary' : 'secondary'}`} onClick={() => setPriority(p)}>{p}</button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Expected fix time" full>
                      <input type="datetime-local" required value={expectedFix} min={t.since} onChange={(e) => setExpectedFix(e.target.value)} />
                    </Field>
                  </div>
                  <div className="status-picker">
                    <button type="submit" className="btn primary">Assign mechanic</button>
                    {t.status === 'Assigned' && <button type="button" className="btn secondary" onClick={resolveTicket}>Mark resolved</button>}
                  </div>
                </form>
              ) : (
                <>
                  <div className="form-grid">
                    <Field label="Mechanic"><div>{t.mechanic || 'Not assigned yet'}</div></Field>
                    <Field label="Priority"><div>{t.priority}</div></Field>
                    <Field label="Expected fix time"><div>{t.expectedFix ? formatSince(t.expectedFix) : '—'}</div></Field>
                  </div>
                  <p className="muted small"><Lock size={14} /> Assigned by an admin</p>
                </>
              )}
            </>
          )
        })()}
      </Modal>
    </>
  )
}
