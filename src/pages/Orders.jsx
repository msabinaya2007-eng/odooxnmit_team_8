import { useMemo, useState } from 'react'
import { ChevronRight, Download, PackageCheck, Pencil, Plus, Printer, Truck } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, OrderThread, PageHeader, SearchInput, Segmented, SelectFilter, StatCard, Toolbar } from '../components/ui'
import { useData } from '../store/DataContext'
import { DEMO_TODAY } from '../data/demoData'
import { downloadCSV, formatDate, formatINR, formatNumber, matchesSearch } from '../utils/format'

const STATUSES = ['Pending', 'In Production', 'Quality Check', 'Ready', 'Dispatched', 'Cancelled']
const PICKABLE_STATUSES = STATUSES.filter((s) => s !== 'Dispatched')
const PRIORITIES = ['High', 'Medium', 'Low']
const FLOW = ['Scheduled', 'Loading', 'In Transit', 'Delivered']
const CARRIERS = ['Demo Logistics', 'Sample Freight', 'Test Transport Co.']

const emptyForm = { customer: '', product: '', fabric: '', quantity: '', unit: 'm', dueDate: '', priority: 'Medium', value: '' }
const emptyDispatchForm = { destination: '', carrier: CARRIERS[0], vehicle: '', date: DEMO_TODAY, packages: '' }

export function Orders() {
  const { orders, setOrders, dispatches, setDispatches, notify } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [dispatchOrder, setDispatchOrder] = useState(null)
  const [dispatchForm, setDispatchForm] = useState(emptyDispatchForm)
  const [slip, setSlip] = useState(null)

  const shipmentOf = (orderId) => dispatches.find((d) => d.orderId === orderId)
  const readyToShip = orders.filter((o) => o.status === 'Ready' && !shipmentOf(o.id))
  const inTransit = dispatches.filter((d) => d.status === 'In Transit')

  const filtered = useMemo(
    () => orders.filter((o) =>
      (status === 'All' || o.status === status) &&
      (priority === 'All' || o.priority === priority) &&
      matchesSearch(query, o.id, o.customer, o.product, o.fabric)),
    [orders, status, priority, query],
  )

  const totalValue = filtered.reduce((s, o) => s + o.value, 0)

  const submit = (e) => {
    e.preventDefault()
    const nextNum = Math.max(...orders.map((o) => Number(o.id.split('-')[1]))) + 1
    const order = {
      id: `ORD-${nextNum}`,
      customer: form.customer.trim(),
      product: form.product.trim(),
      fabric: form.fabric.trim() || '—',
      quantity: Number(form.quantity),
      unit: form.unit,
      orderDate: DEMO_TODAY,
      dueDate: form.dueDate,
      status: 'Pending',
      priority: form.priority,
      value: Number(form.value),
    }
    setOrders((prev) => [order, ...prev])
    setForm(emptyForm)
    setModalOpen(false)
    notify(`Order ${order.id} created (demo — not saved to a database)`)
  }

  const updateStatus = (id, next) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    setEditing(null)
    notify(`${id} status changed to ${next}`)
  }

  const advance = (d) => {
    const next = FLOW[FLOW.indexOf(d.status) + 1]
    if (!next) return
    setDispatches((prev) => prev.map((x) => (x.id === d.id ? { ...x, status: next } : x)))
    if (next === 'In Transit') setOrders((prev) => prev.map((o) => (o.id === d.orderId ? { ...o, status: 'Dispatched' } : o)))
    notify(`${d.id} → ${next}`)
  }

  const openDispatch = (order) => {
    setDispatchForm({ ...emptyDispatchForm })
    setDispatchOrder(order)
  }

  const submitDispatch = (e) => {
    e.preventDefault()
    const order = dispatchOrder
    if (!order || shipmentOf(order.id)) return
    const next = Math.max(...dispatches.map((d) => Number(d.id.split('-')[1]))) + 1
    const d = {
      id: `DSP-${next}`,
      orderId: order.id,
      customer: order.customer,
      destination: dispatchForm.destination.trim(),
      carrier: dispatchForm.carrier,
      vehicle: dispatchForm.vehicle.trim().toUpperCase(),
      date: dispatchForm.date,
      packages: Number(dispatchForm.packages),
      status: 'Scheduled',
    }
    setDispatches((prev) => [d, ...prev])
    notify(`Dispatch ${d.id} scheduled for ${order.id}`)
    setDispatchOrder(null)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setD = (k, v) => setDispatchForm((f) => ({ ...f, [k]: v }))

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Track customer orders from booking to dispatch"
        actions={
          <>
            <DemoTag />
            <button type="button" className="btn secondary" onClick={() => downloadCSV('loomflow-orders-demo.csv', filtered.map((o) => ({ ...o })))}><Download size={16} /> Export CSV</button>
            <button type="button" className="btn primary" onClick={() => setModalOpen(true)}><Plus size={16} /> New order</button>
          </>
        }
      />

      <div className="stat-grid">
        <StatCard icon={PackageCheck} label="Ready to ship" value={readyToShip.length} hint={readyToShip.map((o) => o.id).join(', ') || 'No unshipped Ready orders'} tone="green" onClick={() => setStatus('Ready')} />
        <StatCard icon={Truck} label="In transit" value={inTransit.length} hint="Shipments on the road" tone="teal" onClick={() => setStatus('Dispatched')} />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder="Search order, customer, product…" />
          <SelectFilter label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
          <span className="toolbar-spacer" />
          <span className="muted small">{filtered.length} orders · {formatINR(totalValue)}</span>
        </Toolbar>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[{ value: 'All', label: 'All', count: orders.length }, ...STATUSES.map((s) => ({ value: s, label: s, count: orders.filter((o) => o.status === s).length }))]}
        />
        <DataTable
          rows={filtered}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: 'Order ID', render: (o) => <strong>{o.id}</strong> },
            { key: 'customer', header: 'Customer', render: (o) => o.customer },
            { key: 'product', header: 'Product', render: (o) => <><div>{o.product}</div><div className="muted small">{o.fabric}</div></> },
            { key: 'qty', header: 'Quantity', align: 'right', render: (o) => `${formatNumber(o.quantity)} ${o.unit}` },
            { key: 'date', header: 'Ordered', render: (o) => formatDate(o.orderDate) },
            { key: 'due', header: 'Due', render: (o) => <span className={o.dueDate < DEMO_TODAY && !['Dispatched', 'Cancelled'].includes(o.status) ? 'neg' : ''}>{formatDate(o.dueDate)}</span> },
            { key: 'priority', header: 'Priority', render: (o) => <Badge>{o.priority}</Badge> },
            { key: 'value', header: 'Value', align: 'right', render: (o) => formatINR(o.value) },
            { key: 'status', header: 'Stage', render: (o) => <OrderThread status={o.status} /> },
            {
              key: 'ship',
              header: 'Shipment',
              render: (o) => {
                const d = shipmentOf(o.id)
                if (!d) return <span className="muted">—</span>
                return <><div><strong>{d.id}</strong></div><div className="muted small">{d.carrier} · {d.vehicle}</div><Badge>{d.status}</Badge></>
              },
            },
            {
              key: 'act',
              header: '',
              align: 'right',
              render: (o) => {
                const d = shipmentOf(o.id)
                return (
                  <div className="row-actions">
                    {d && <button type="button" className="icon-btn" onClick={() => setSlip(d)} aria-label={`Packing slip ${d.id}`}><Printer size={16} /></button>}
                    {d && d.status !== 'Delivered' && <button type="button" className="btn small secondary" onClick={() => advance(d)}>{FLOW[FLOW.indexOf(d.status) + 1]} <ChevronRight size={14} /></button>}
                    {!d && o.status === 'Ready' && <button type="button" className="btn small primary" onClick={() => openDispatch(o)}>Schedule dispatch</button>}
                    <button type="button" className="icon-btn" onClick={() => setEditing(o)} aria-label={`Update ${o.id}`}><Pencil size={16} /></button>
                  </div>
                )
              },
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        title="New order"
        onClose={() => setModalOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" form="order-form" className="btn primary">Create order</button></>}
      >
        <form id="order-form" className="form-grid" onSubmit={submit}>
          <Field label="Customer"><input required value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="e.g. Demo Apparel Co." /></Field>
          <Field label="Product"><input required value={form.product} onChange={(e) => set('product', e.target.value)} placeholder="e.g. Oxford Shirting" /></Field>
          <Field label="Fabric / composition"><input value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Cotton 40s" /></Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Quantity"><input required type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} /></Field>
          <Field label="Unit">
            <select value={form.unit} onChange={(e) => set('unit', e.target.value)}><option value="m">Metres</option><option value="pcs">Pieces</option></select>
          </Field>
          <Field label="Due date"><input required type="date" min={DEMO_TODAY} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></Field>
          <Field label="Order value (₹)"><input required type="number" min={0} value={form.value} onChange={(e) => set('value', e.target.value)} /></Field>
        </form>
      </Modal>

      <Modal open={editing !== null} title={`Update status — ${editing?.id ?? ''}`} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <p className="muted">{editing.customer} · {editing.product}</p>
            <div className="status-picker">
              {PICKABLE_STATUSES.map((s) => (
                <button key={s} type="button" className={`btn ${editing.status === s ? 'primary' : 'secondary'}`} onClick={() => updateStatus(editing.id, s)}>{s}</button>
              ))}
            </div>
            <p className="muted small">An order becomes Dispatched only through its shipment.</p>
          </>
        )}
      </Modal>

      <Modal
        open={dispatchOrder !== null}
        title={`Schedule dispatch — ${dispatchOrder?.id ?? ''}`}
        onClose={() => setDispatchOrder(null)}
        footer={<><button type="button" className="btn secondary" onClick={() => setDispatchOrder(null)}>Cancel</button><button type="submit" form="dispatch-form" className="btn primary">Schedule</button></>}
      >
        {dispatchOrder && (
          <form id="dispatch-form" className="form-grid" onSubmit={submitDispatch}>
            <Field label="Order (Ready)" full><input disabled value={`${dispatchOrder.id} · ${dispatchOrder.customer} · ${dispatchOrder.product}`} /></Field>
            <Field label="Destination"><input required value={dispatchForm.destination} onChange={(e) => setD('destination', e.target.value)} placeholder="City, State" /></Field>
            <Field label="Carrier">
              <select value={dispatchForm.carrier} onChange={(e) => setD('carrier', e.target.value)}>{CARRIERS.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Vehicle number"><input required value={dispatchForm.vehicle} onChange={(e) => setD('vehicle', e.target.value)} placeholder="TN-00-XX-0000" /></Field>
            <Field label="Dispatch date"><input required type="date" value={dispatchForm.date} onChange={(e) => setD('date', e.target.value)} /></Field>
            <Field label="Packages / bales"><input required type="number" min={1} value={dispatchForm.packages} onChange={(e) => setD('packages', e.target.value)} /></Field>
          </form>
        )}
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
