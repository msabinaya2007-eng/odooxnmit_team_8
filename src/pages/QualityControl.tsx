import { useMemo, useState, type FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleCheck, CircleX, ClipboardList, Plus, RotateCcw, ShieldCheck } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, SearchInput, Segmented, StatCard, Toolbar } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { DEMO_TODAY, type Inspection, type InspectionResult } from '../data/demoData'
import { formatDate, matchesSearch } from '../utils/format'

const RESULTS: InspectionResult[] = ['Pending', 'Passed', 'Failed', 'Rework']
const DEFECT_TYPES = ['—', 'Broken pick', 'Float', 'Slub', 'Shade variation', 'Stain', 'Holes / Snags', 'Print misregistration', 'Stitching defect']

export function QualityControl() {
  const { inspections, setInspections, batches, workers, notify } = useData()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<InspectionResult | 'All'>('All')
  const [recording, setRecording] = useState<Inspection | null>(null)
  const [form, setForm] = useState({ defects: '0', defectType: '—', result: 'Passed' as InspectionResult })
  const [newOpen, setNewOpen] = useState(false)
  const [newForm, setNewForm] = useState({ batchId: '', inspector: '', sampleSize: '200' })

  const inspectors = workers.filter((w) => w.department === 'Quality').map((w) => w.name)

  const filtered = useMemo(
    () => inspections.filter((i) => (result === 'All' || i.result === result) && matchesSearch(query, i.id, i.batchId, i.product, i.inspector, i.defectType)),
    [inspections, result, query],
  )

  const completed = inspections.filter((i) => i.result !== 'Pending')
  const passRate = completed.length ? Math.round((completed.filter((i) => i.result === 'Passed').length / completed.length) * 100) : 0
  const totalSampled = completed.reduce((s, i) => s + i.sampleSize, 0)
  const defectRate = totalSampled ? ((completed.reduce((s, i) => s + i.defects, 0) / totalSampled) * 100).toFixed(1) : '0'

  const defectChart = Object.entries(
    completed.filter((i) => i.defectType !== '—').reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.defectType]: (acc[i.defectType] ?? 0) + i.defects }), {}),
  ).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)

  const openRecord = (i: Inspection) => {
    setRecording(i)
    setForm({ defects: '0', defectType: '—', result: 'Passed' })
  }

  const saveRecord = (e: FormEvent) => {
    e.preventDefault()
    if (!recording) return
    setInspections((prev) => prev.map((i) => (i.id === recording.id ? { ...i, defects: Number(form.defects), defectType: form.defectType, result: form.result, date: DEMO_TODAY } : i)))
    notify(`${recording.id} recorded as ${form.result}`)
    setRecording(null)
  }

  const createInspection = (e: FormEvent) => {
    e.preventDefault()
    const batch = batches.find((b) => b.id === newForm.batchId)
    const next = Math.max(...inspections.map((i) => Number(i.id.split('-')[1]))) + 1
    const insp: Inspection = {
      id: `QC-${next}`,
      batchId: newForm.batchId,
      product: batch?.product ?? '—',
      inspector: newForm.inspector,
      date: DEMO_TODAY,
      sampleSize: Number(newForm.sampleSize),
      defects: 0,
      defectType: '—',
      result: 'Pending',
    }
    setInspections((prev) => [insp, ...prev])
    notify(`Inspection ${insp.id} scheduled for ${insp.batchId}`)
    setNewOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Quality Control"
        subtitle="Fabric and garment inspections (4-point system, demo)"
        actions={<><DemoTag /><button type="button" className="btn primary" onClick={() => { setNewForm({ batchId: batches[0]?.id ?? '', inspector: inspectors[0] ?? '', sampleSize: '200' }); setNewOpen(true) }}><Plus size={16} /> Schedule inspection</button></>}
      />

      <div className="stat-grid">
        <StatCard icon={ClipboardList} label="Pending inspections" value={inspections.filter((i) => i.result === 'Pending').length} tone="amber" onClick={() => setResult('Pending')} />
        <StatCard icon={ShieldCheck} label="First-pass yield" value={`${passRate}%`} hint={`${completed.length} inspections completed`} tone="teal" />
        <StatCard icon={CircleX} label="Failed batches" value={inspections.filter((i) => i.result === 'Failed').length} tone="red" onClick={() => setResult('Failed')} />
        <StatCard icon={RotateCcw} label="Defect rate" value={`${defectRate}%`} hint="Defects per sampled unit" tone="navy" />
      </div>

      <div className="grid-2-1">
        <Card title="Inspection log">
          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder="Search batch, product, inspector…" />
          </Toolbar>
          <Segmented
            value={result}
            onChange={setResult}
            options={[{ value: 'All' as const, label: 'All', count: inspections.length }, ...RESULTS.map((r) => ({ value: r, label: r, count: inspections.filter((i) => i.result === r).length }))]}
          />
          <DataTable
            rows={filtered}
            rowKey={(i) => i.id}
            columns={[
              { key: 'id', header: 'Inspection', render: (i) => <><strong>{i.id}</strong><div className="muted small">{i.batchId}</div></> },
              { key: 'product', header: 'Product', render: (i) => i.product },
              { key: 'insp', header: 'Inspector', render: (i) => i.inspector },
              { key: 'date', header: 'Date', render: (i) => formatDate(i.date) },
              { key: 'sample', header: 'Sample', align: 'right', render: (i) => i.sampleSize },
              { key: 'def', header: 'Defects', align: 'right', render: (i) => (i.result === 'Pending' ? '—' : i.defects) },
              { key: 'type', header: 'Main defect', render: (i) => <span className="muted">{i.defectType}</span> },
              { key: 'res', header: 'Result', render: (i) => <Badge>{i.result}</Badge> },
              { key: 'act', header: '', align: 'right', render: (i) => i.result === 'Pending' ? <button type="button" className="btn small primary" onClick={() => openRecord(i)}><CircleCheck size={14} /> Record</button> : null },
            ]}
          />
        </Card>

        <Card title="Defects by type">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectChart} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...axisProps} allowDecimals={false} />
                <YAxis type="category" dataKey="type" {...axisProps} width={120} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" name="Defects found" fill={chartColors.navy} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Modal
        open={recording !== null}
        title={`Record result — ${recording?.id ?? ''}`}
        onClose={() => setRecording(null)}
        footer={<><button type="button" className="btn secondary" onClick={() => setRecording(null)}>Cancel</button><button type="submit" form="qc-form" className="btn primary">Save result</button></>}
      >
        {recording && (
          <form id="qc-form" className="form-grid" onSubmit={saveRecord}>
            <Field label="Batch"><input disabled value={`${recording.batchId} · ${recording.product}`} /></Field>
            <Field label="Sample size"><input disabled value={recording.sampleSize} /></Field>
            <Field label="Defects found"><input type="number" min={0} required value={form.defects} onChange={(e) => setForm({ ...form, defects: e.target.value })} /></Field>
            <Field label="Main defect type">
              <select value={form.defectType} onChange={(e) => setForm({ ...form, defectType: e.target.value })}>{DEFECT_TYPES.map((d) => <option key={d}>{d}</option>)}</select>
            </Field>
            <Field label="Result" full>
              <div className="status-picker">
                {(['Passed', 'Rework', 'Failed'] as const).map((r) => (
                  <button key={r} type="button" className={`btn ${form.result === r ? 'primary' : 'secondary'}`} onClick={() => setForm({ ...form, result: r })}>{r}</button>
                ))}
              </div>
            </Field>
          </form>
        )}
      </Modal>

      <Modal
        open={newOpen}
        title="Schedule inspection"
        onClose={() => setNewOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setNewOpen(false)}>Cancel</button><button type="submit" form="qc-new-form" className="btn primary">Schedule</button></>}
      >
        <form id="qc-new-form" className="form-grid" onSubmit={createInspection}>
          <Field label="Batch">
            <select required value={newForm.batchId} onChange={(e) => setNewForm({ ...newForm, batchId: e.target.value })}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.id} · {b.product}</option>)}
            </select>
          </Field>
          <Field label="Inspector">
            <select required value={newForm.inspector} onChange={(e) => setNewForm({ ...newForm, inspector: e.target.value })}>
              {inspectors.map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Sample size"><input type="number" min={1} required value={newForm.sampleSize} onChange={(e) => setNewForm({ ...newForm, sampleSize: e.target.value })} /></Field>
        </form>
      </Modal>
    </>
  )
}
