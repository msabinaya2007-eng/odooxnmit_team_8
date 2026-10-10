import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Gauge, Pause, Play, Power, Wrench } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, PageHeader, Progress, SearchInput, Segmented, StatCard, Toolbar } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { formatNumber, matchesSearch } from '../utils/format'

const STATUSES = ['Running', 'Idle', 'Maintenance', 'Breakdown']
const STAGES = ['Spinning', 'Weaving', 'Dyeing', 'Finishing', 'Stitching', 'Packing']

export function Production() {
  const { machines, setMachines, batches, setBatches, notify } = useData()
  const [statusFilter, setStatusFilter] = useState('All')
  const [query, setQuery] = useState('')

  const shown = useMemo(
    () => machines.filter((m) => (statusFilter === 'All' || m.status === statusFilter) && matchesSearch(query, m.id, m.name, m.operator, m.line, m.type)),
    [machines, statusFilter, query],
  )

  const running = machines.filter((m) => m.status === 'Running')
  const avgEff = Math.round(running.reduce((s, m) => s + m.efficiency, 0) / Math.max(running.length, 1))
  const output = machines.reduce((s, m) => s + m.outputToday, 0)
  const down = machines.filter((m) => m.status === 'Breakdown' || m.status === 'Maintenance').length

  const setStatus = (m, status) => {
    setMachines((prev) => prev.map((x) => (x.id === m.id ? { ...x, status, efficiency: status === 'Running' ? Math.max(x.efficiency, 80) : 0 } : x)))
    notify(`${m.name} set to ${status}`)
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
          {shown.map((m) => (
            <article key={m.id} className={`machine-card st-${m.status.toLowerCase()}`}>
              <header>
                <div>
                  <strong>{m.name}</strong>
                  <div className="muted small">{m.id} · {m.line}</div>
                </div>
                <Badge>{m.status}</Badge>
              </header>
              <dl className="machine-meta">
                <div><dt>Operator</dt><dd>{m.operator}</dd></div>
                <div><dt>Job</dt><dd>{m.currentJob}</dd></div>
                <div><dt>Output</dt><dd>{formatNumber(m.outputToday)}</dd></div>
              </dl>
              <div className="eff-row"><span className="muted small">Efficiency</span><strong>{m.efficiency}%</strong></div>
              <Progress value={m.efficiency} tone={m.efficiency >= 85 ? 'green' : m.efficiency > 0 ? 'amber' : 'slate'} />
              <div className="machine-actions">
                {m.status !== 'Running' && <button type="button" className="btn small primary" onClick={() => setStatus(m, 'Running')}><Play size={14} /> Start</button>}
                {m.status === 'Running' && <button type="button" className="btn small secondary" onClick={() => setStatus(m, 'Idle')}><Pause size={14} /> Pause</button>}
                {m.status !== 'Maintenance' && <button type="button" className="btn small ghost" onClick={() => setStatus(m, 'Maintenance')}><Wrench size={14} /> Maintenance</button>}
              </div>
            </article>
          ))}
        </div>
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
                <XAxis dataKey="line" {...axisProps} interval={0} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis {...axisProps} width={44} />
                <Tooltip {...tooltipStyle} formatter={(v) => formatNumber(Number(v))} />
                <Bar dataKey="output" name="Output" fill={chartColors.teal} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
