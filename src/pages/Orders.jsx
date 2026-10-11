import { useMemo, useState } from 'react'
import { ChevronRight, Download, Lock, PackageCheck, Pencil, Plus, Printer, Truck } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, OrderThread, PageHeader, SearchInput, Segmented, SelectFilter, StatCard, Toolbar } from '../components/ui'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../store/permissions'
import { DEMO_TODAY } from '../data/demoData'
import { downloadCSV, formatDate, formatINR, formatNumber, matchesSearch } from '../utils/format'

const STATUSES = ['Pending', 'In Production', 'Quality Check', 'Ready', 'Dispatched', 'Cancelled']
const PICKABLE_STATUSES = STATUSES.filter((s) => s !== 'Dispatched')
const PRIORITIES = ['High', 'Medium', 'Low']
const FLOW = ['Scheduled', 'Loading', 'In Transit', 'Delivered']
const CARRIERS = ['Demo Logistics', 'Sample Freight', 'Test Transport Co.']
const LOCK_TIP = 'Only authorised roles can edit'
const ORDER_STEPS = ['Buyer', 'Product', 'Delivery']

const emptyForm = { customer: '', phone: '', product: '', fabric: '', colour: '', quantity: '', unit: 'm', priority: 'Medium', dueDate: '', value: '', notes: '' }
const emptyDispatchForm = { destination: '', carrier: CARRIERS[0], vehicle: '', date: DEMO_TODAY, packages: '' }

export function Orders() {
  const { orders, setOrders, dispatches, setDispatches, materials, isLowStock, notify } = useData()
  const { user } = useAuth()
  const canEdit = can(user, 'orders.edit')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [dispatchOrder, setDispatchOrder] = useState(null)
  const [dispatchForm, setDispatchForm] = useState(emptyDispatchForm)
  const [slip, setSlip] = useState(null)

  const shipmentOf = (orderId) => dispatches.find((d) => d.orderId === orderId)
  const readyToShip = orders.filter((o) => o.status === 'Ready' && !shipmentOf(o.id))
  const inTransit = dispatches.filter((d) => d.status === 'In Transit')

  const fabricTokens = form.fabric.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2)
  const lowFabric = fabricTokens.length > 0
    && materials.filter(isLowStock).some((m) => fabricTokens.some((t) => m.name.toLowerCase().includes(t)))

  const filtered = useMemo(
    () => orders.filter((o) =>
      (status === 'All' || o.status === status) &&
      (priority === 'All' || o.priority === priority) &&
      matchesSearch(query, o.id, o.customer, o.product, o.fabric)),
    [orders, status, priority, query],
  )

  const totalValue = filtered.reduce((s, o) => s + o.value, 0)

  const stepValid = (s) => {
    if (s === 1) {
      if (!form.customer.trim()) { notify('Enter the customer name'); return false }
      if (!form.phone.trim()) { notify('Enter the phone number'); return false }
      return true
    }
    if (s === 2) {
      if (!form.product.trim()) { notify('Enter the product'); return false }
      if (!form.fabric.trim()) { notify('Enter the fabric'); return false }
      if (!(Number(form.quantity) >= 1)) { notify('Enter a quantity of at least 1'); return false }
      return true
    }
    return true
  }

  const openNewOrder = () => {
    setForm(emptyForm)
    setStep(1)
    setModalOpen(true)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
    if (!form.dueDate || form.dueDate < DEMO_TODAY) { notify('Choose a due date that is not in the past'); return }
    if (form.value === '' || !(Number(form.value) >= 0)) { notify('Enter the order value'); return }
    const nextNum = Math.max(...orders.map((o) => Number(o.id.split('-')[1]))) + 1
    const order = {
      id: `ORD-${nextNum}`,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      product: form.product.trim(),
      fabric: form.fabric.trim() || '—',
      colour: form.colour.trim() || '—',
      quantity: Number(form.quantity),
      unit: form.unit,
      orderDate: DEMO_TODAY,
      dueDate: form.dueDate,
      status: 'Pending',
      priority: form.priority,
      value: Number(form.value),
      notes: form.notes.trim(),
    }
    setOrders((prev) => [order, ...prev])
    setForm(emptyForm)
    setStep(1)
    setModalOpen(false)
    notify(`Order ${order.id} created (demo — not saved to a database)`)
  }

  const updateStatus = (id, next) => {
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    setEditing(null)
    notify(`${id} status changed to ${next}`)
  }

  const advance = (d) => {
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
    const next = FLOW[FLOW.indexOf(d.status) + 1]
    if (!next) return
    setDispatches((prev) => prev.map((x) => (x.id === d.id ? { ...x, status: next } : x)))
    if (next === 'In Transit') setOrders((prev) => prev.map((o) => (o.id === d.orderId ? { ...o, status: 'Dispatched' } : o)))
    notify(`${d.id} → ${next}`)
  }

  const openDispatch = (order) => {
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
    setDispatchForm({ ...emptyDispatchForm })
    setDispatchOrder(order)
  }

  const submitDispatch = (e) => {
    e.preventDefault()
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
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

  const exportOrders = () => {
    if (!can(user, 'orders.edit')) { notify('Only authorised roles can edit'); return }
    downloadCSV('loomflow-orders-demo.csv', filtered.map((o) => ({ ...o })))
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Track customer orders from booking to dispatch"
        viewOnly={!canEdit}
        actions={
          <>
            <DemoTag />
            {canEdit
              ? <button type="button" className="btn secondary" onClick={exportOrders}><Download size={16} /> Export CSV</button>
              : <button type="button" className="btn secondary" disabled title={LOCK_TIP}><Lock size={16} /> Export CSV</button>}
            {canEdit
              ? <button type="button" className="btn primary" onClick={openNewOrder}><Plus size={16} /> New order</button>
              : <button type="button" className="btn primary" disabled title={LOCK_TIP}><Lock size={16} /> New order</button>}
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
                const nextStep = d ? FLOW[FLOW.indexOf(d.status) + 1] : null
                return (
                  <div className="row-actions">
                    {d && <button type="button" className="icon-btn" onClick={() => setSlip(d)} aria-label={`Packing slip ${d.id}`}><Printer size={16} /></button>}
                    {d && nextStep && (canEdit
                      ? <button type="button" className="btn small secondary" onClick={() => advance(d)}>{nextStep} <ChevronRight size={14} /></button>
                      : <button type="button" className="btn small secondary" disabled title={LOCK_TIP}><Lock size={14} /> {nextStep}</button>)}
                    {!d && o.status === 'Ready' && (canEdit
                      ? <button type="button" className="btn small primary" onClick={() => openDispatch(o)}>Schedule dispatch</button>
                      : <button type="button" className="btn small primary" disabled title={LOCK_TIP}><Lock size={14} /> Schedule dispatch</button>)}
                    {canEdit
                      ? <button type="button" className="icon-btn" onClick={() => setEditing(o)} aria-label={`Update ${o.id}`}><Pencil size={16} /></button>
                      : <button type="button" className="icon-btn" disabled title={LOCK_TIP} aria-label={`Update ${o.id}`}><Lock size={16} /></button>}
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
        onClose={() => { setModalOpen(false); setStep(1) }}
        footer={
          <>
            <button type="button" className="btn secondary" onClick={() => { setModalOpen(false); setStep(1) }}>Cancel</button>
            {step > 1 && <button type="button" className="btn secondary" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 3
              ? <button type="button" className="btn primary" onClick={() => { if (stepValid(step)) setStep(step + 1) }}>Next</button>
              : <button type="submit" form="order-form" className="btn primary">Create order</button>}
          </>
        }
      >
        <div className="status-picker" aria-label="Order steps">
          {ORDER_STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`btn ${step === i + 1 ? 'primary' : 'secondary'}`}
              disabled={i + 1 > step}
              onClick={() => { if (i + 1 < step) setStep(i + 1) }}
            >
              {i + 1} · {label}
            </button>
          ))}
        </div>
        <form id="order-form" className="form-grid" onSubmit={submit}>
          {step === 1 && (
            <>
              <Field label="Customer name"><input required value={form.customer} onChange={(e) => set('customer', e.target.value)} placeholder="e.g. Demo Apparel Co." /></Field>
              <Field label="Phone number"><input required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="e.g. +91 98400 12345" inputMode="tel" /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Product"><input required value={form.product} onChange={(e) => set('product', e.target.value)} placeholder="e.g. Oxford Shirting" /></Field>
              <Field label="Fabric / composition"><input required value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Cotton 40s" /></Field>
              <Field label="Colour"><input value={form.colour} onChange={(e) => set('colour', e.target.value)} placeholder="e.g. Sky Blue" /></Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
              </Field>
              <Field label="Quantity"><input required type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} /></Field>
              <Field label="Unit">
                <select value={form.unit} onChange={(e) => set('unit', e.target.value)}><option value="m">Metres</option><option value="pcs">Pieces</option></select>
              </Field>
              <Field label="Stock check" full>
                <div>
                  {form.fabric.trim()
                    ? <Badge tone={lowFabric ? 'amber' : 'green'}>{lowFabric ? 'Low stock for this fabric' : 'Enough stock'}</Badge>
                    : <span className="muted small">Enter a fabric to check stock</span>}
                </div>
              </Field>
            </>
          )}
          {step === 3 && (
            <>
              <Field label="Due date"><input required type="date" min={DEMO_TODAY} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></Field>
              <Field label="Order value (₹)"><input required type="number" min={0} value={form.value} onChange={(e) => set('value', e.target.value)} /></Field>
              <Field label="Notes" full><input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything the floor should know" /></Field>
              <Field label="Summary" full>
                <dl className="slip-grid">
                  <dt>Buyer</dt><dd>{form.customer.trim() || '—'} · {form.phone.trim() || '—'}</dd>
                  <dt>Product</dt><dd>{form.product.trim() || '—'} · {form.fabric.trim() || '—'} · {form.colour.trim() || '—'}</dd>
                  <dt>Quantity</dt><dd>{form.quantity ? `${formatNumber(Number(form.quantity))} ${form.unit}` : '—'} · {form.priority}</dd>
                  <dt>Due</dt><dd>{form.dueDate ? formatDate(form.dueDate) : '—'}</dd>
                  <dt>Value</dt><dd>{form.value === '' ? '—' : formatINR(Number(form.value))}</dd>
                </dl>
              </Field>
            </>
          )}
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
