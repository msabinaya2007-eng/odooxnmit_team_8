import { useMemo, useState, type FormEvent } from 'react'
import { Download, Pencil, Plus } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, SearchInput, Segmented, SelectFilter, Toolbar } from '../components/ui'
import { useData } from '../store/DataContext'
import { DEMO_TODAY, type Order, type OrderStatus, type Priority } from '../data/demoData'
import { downloadCSV, formatDate, formatINR, formatNumber, matchesSearch } from '../utils/format'

const STATUSES: OrderStatus[] = ['Pending', 'In Production', 'Quality Check', 'Ready', 'Dispatched', 'Cancelled']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

const emptyForm = { customer: '', product: '', fabric: '', quantity: '', unit: 'm' as Order['unit'], dueDate: '', priority: 'Medium' as Priority, value: '' }

export function Orders() {
  const { orders, setOrders, notify } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Order | null>(null)

  const filtered = useMemo(
    () => orders.filter((o) =>
      (status === 'All' || o.status === status) &&
      (priority === 'All' || o.priority === priority) &&
      matchesSearch(query, o.id, o.customer, o.product, o.fabric)),
    [orders, status, priority, query],
  )

  const totalValue = filtered.reduce((s, o) => s + o.value, 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const nextNum = Math.max(...orders.map((o) => Number(o.id.split('-')[1]))) + 1
    const order: Order = {
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

  const updateStatus = (id: string, next: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    setEditing(null)
    notify(`${id} status changed to ${next}`)
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

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
          options={[{ value: 'All' as const, label: 'All', count: orders.length }, ...STATUSES.map((s) => ({ value: s, label: s, count: orders.filter((o) => o.status === s).length }))]}
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
            { key: 'status', header: 'Status', render: (o) => <Badge>{o.status}</Badge> },
            { key: 'act', header: '', align: 'right', render: (o) => <button type="button" className="icon-btn" onClick={() => setEditing(o)} aria-label={`Update ${o.id}`}><Pencil size={16} /></button> },
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
            <select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Quantity"><input required type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} /></Field>
          <Field label="Unit">
            <select value={form.unit} onChange={(e) => set('unit', e.target.value as Order['unit'])}><option value="m">Metres</option><option value="pcs">Pieces</option></select>
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
              {STATUSES.map((s) => (
                <button key={s} type="button" className={`btn ${editing.status === s ? 'primary' : 'secondary'}`} onClick={() => updateStatus(editing.id, s)}>{s}</button>
              ))}
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
