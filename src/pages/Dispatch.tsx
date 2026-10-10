import { useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronRight, MapPin, Plus, Printer, Truck } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, SearchInput, Segmented, StatCard, Toolbar } from '../components/ui'
import { useData } from '../store/DataContext'
import { DEMO_TODAY, type Dispatch, type DispatchStatus } from '../data/demoData'
import { formatDate, matchesSearch } from '../utils/format'

const FLOW: DispatchStatus[] = ['Scheduled', 'Loading', 'In Transit', 'Delivered']
const CARRIERS = ['Demo Logistics', 'Sample Freight', 'Test Transport Co.']

export function DispatchPage() {
  const { dispatches, setDispatches, orders, setOrders, notify } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<DispatchStatus | 'All'>('All')
  const [open, setOpen] = useState(false)
  const [slip, setSlip] = useState<Dispatch | null>(null)

  const readyOrders = orders.filter((o) => o.status === 'Ready' && !dispatches.some((d) => d.orderId === o.id))
  const [form, setForm] = useState({ orderId: '', destination: '', carrier: CARRIERS[0], vehicle: '', date: DEMO_TODAY, packages: '' })

  const filtered = useMemo(
    () => dispatches.filter((d) => (status === 'All' || d.status === status) && matchesSearch(query, d.id, d.orderId, d.customer, d.destination, d.vehicle, d.carrier)),
    [dispatches, status, query],
  )

  const advance = (d: Dispatch) => {
    const next = FLOW[FLOW.indexOf(d.status) + 1]
    if (!next) return
    setDispatches((prev) => prev.map((x) => (x.id === d.id ? { ...x, status: next } : x)))
    if (next === 'In Transit') setOrders((prev) => prev.map((o) => (o.id === d.orderId ? { ...o, status: 'Dispatched' } : o)))
    notify(`${d.id} → ${next}`)
  }

  const openForm = () => {
    setForm({ orderId: readyOrders[0]?.id ?? '', destination: '', carrier: CARRIERS[0], vehicle: '', date: DEMO_TODAY, packages: '' })
    setOpen(true)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const order = orders.find((o) => o.id === form.orderId)
    if (!order) return
    const next = Math.max(...dispatches.map((d) => Number(d.id.split('-')[1]))) + 1
    const d: Dispatch = {
      id: `DSP-${next}`,
      orderId: order.id,
      customer: order.customer,
      destination: form.destination.trim(),
      carrier: form.carrier,
      vehicle: form.vehicle.trim().toUpperCase(),
      date: form.date,
      packages: Number(form.packages),
      status: 'Scheduled',
    }
    setDispatches((prev) => [d, ...prev])
    notify(`Dispatch ${d.id} scheduled for ${order.id}`)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Dispatch"
        subtitle="Shipments, vehicles and delivery tracking"
        actions={<><DemoTag /><button type="button" className="btn primary" onClick={openForm} disabled={readyOrders.length === 0} title={readyOrders.length ? '' : 'No orders in Ready status'}><Plus size={16} /> Schedule dispatch</button></>}
      />

      <div className="stat-grid">
        <StatCard icon={CalendarDays} label="Scheduled" value={dispatches.filter((d) => d.status === 'Scheduled').length} tone="slate" onClick={() => setStatus('Scheduled')} />
        <StatCard icon={Truck} label="Loading today" value={dispatches.filter((d) => d.status === 'Loading').length} tone="amber" onClick={() => setStatus('Loading')} />
        <StatCard icon={MapPin} label="In transit" value={dispatches.filter((d) => d.status === 'In Transit').length} tone="teal" onClick={() => setStatus('In Transit')} />
        <StatCard icon={Truck} label="Ready orders to ship" value={readyOrders.length} hint={readyOrders.map((o) => o.id).join(', ') || 'None'} tone="navy" />
      </div>

      <Card title="Shipments">
        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search dispatch, order, customer, vehicle…" />
        </Toolbar>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[{ value: 'All' as const, label: 'All', count: dispatches.length }, ...FLOW.map((s) => ({ value: s, label: s, count: dispatches.filter((d) => d.status === s).length }))]}
        />
        <DataTable
          rows={filtered}
          rowKey={(d) => d.id}
          columns={[
            { key: 'id', header: 'Dispatch', render: (d) => <><strong>{d.id}</strong><div className="muted small">{d.orderId}</div></> },
            { key: 'cust', header: 'Customer', render: (d) => d.customer },
            { key: 'dest', header: 'Destination', render: (d) => d.destination },
            { key: 'carrier', header: 'Carrier / vehicle', render: (d) => <><div>{d.carrier}</div><div className="muted small">{d.vehicle}</div></> },
            { key: 'date', header: 'Date', render: (d) => formatDate(d.date) },
            { key: 'pkg', header: 'Packages', align: 'right', render: (d) => d.packages },
            { key: 'st', header: 'Status', render: (d) => <Badge>{d.status}</Badge> },
            {
              key: 'act', header: '', align: 'right', render: (d) => (
                <div className="row-actions">
                  <button type="button" className="icon-btn" onClick={() => setSlip(d)} aria-label={`Packing slip ${d.id}`}><Printer size={16} /></button>
                  {d.status !== 'Delivered' && <button type="button" className="btn small secondary" onClick={() => advance(d)}>{FLOW[FLOW.indexOf(d.status) + 1]} <ChevronRight size={14} /></button>}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        title="Schedule dispatch"
        onClose={() => setOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancel</button><button type="submit" form="dispatch-form" className="btn primary">Schedule</button></>}
      >
        <form id="dispatch-form" className="form-grid" onSubmit={submit}>
          <Field label="Order (Ready)" full>
            <select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
              {readyOrders.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.customer} · {o.product}</option>)}
            </select>
          </Field>
          <Field label="Destination"><input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="City, State" /></Field>
          <Field label="Carrier">
            <select value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })}>{CARRIERS.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Vehicle number"><input required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="TN-00-XX-0000" /></Field>
          <Field label="Dispatch date"><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Packages / bales"><input required type="number" min={1} value={form.packages} onChange={(e) => setForm({ ...form, packages: e.target.value })} /></Field>
        </form>
      </Modal>

      <Modal open={slip !== null} title={`Packing slip — ${slip?.id ?? ''}`} onClose={() => setSlip(null)}>
        {slip && (
          <div className="slip">
            <p className="demo-tag">Demo document — not a real shipment</p>
            <dl className="slip-grid">
              <dt>Order</dt><dd>{slip.orderId}</dd>
              <dt>Customer</dt><dd>{slip.customer}</dd>
              <dt>Ship to</dt><dd>{slip.destination}</dd>
              <dt>Carrier</dt><dd>{slip.carrier}</dd>
              <dt>Vehicle</dt><dd>{slip.vehicle}</dd>
              <dt>Date</dt><dd>{formatDate(slip.date)}</dd>
              <dt>Packages</dt><dd>{slip.packages}</dd>
              <dt>Status</dt><dd><Badge>{slip.status}</Badge></dd>
            </dl>
          </div>
        )}
      </Modal>
    </>
  )
}
