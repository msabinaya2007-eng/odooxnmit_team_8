import { useMemo, useState, type FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Boxes, IndianRupee, PackagePlus, Plus, TriangleAlert } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, Progress, SearchInput, SelectFilter, StatCard, Toolbar } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { DEMO_TODAY, type Material } from '../data/demoData'
import { formatDate, formatINR, formatINRCompact, formatNumber, matchesSearch } from '../utils/format'

const CATEGORIES: Material['category'][] = ['Yarn', 'Dye', 'Chemical', 'Fabric', 'Accessory']

export function Inventory() {
  const { materials, setMaterials, isLowStock, notify } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Material['category'] | 'All'>('All')
  const [lowOnly, setLowOnly] = useState(false)
  const [restock, setRestock] = useState<Material | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: 'Yarn' as Material['category'], stock: '', unit: 'kg', reorderLevel: '', supplier: '', unitCost: '' })

  const filtered = useMemo(
    () => materials.filter((m) =>
      (category === 'All' || m.category === category) &&
      (!lowOnly || isLowStock(m)) &&
      matchesSearch(query, m.id, m.name, m.supplier)),
    [materials, category, lowOnly, query, isLowStock],
  )

  const totalValue = materials.reduce((s, m) => s + m.stock * m.unitCost, 0)
  const lowCount = materials.filter(isLowStock).length
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    value: Math.round(materials.filter((m) => m.category === c).reduce((s, m) => s + m.stock * m.unitCost, 0)),
  }))

  const doRestock = (e: FormEvent) => {
    e.preventDefault()
    if (!restock) return
    const qty = Number(restockQty)
    setMaterials((prev) => prev.map((m) => (m.id === restock.id ? { ...m, stock: m.stock + qty, lastRestocked: DEMO_TODAY } : m)))
    notify(`Added ${formatNumber(qty)} ${restock.unit} to ${restock.name}`)
    setRestock(null)
    setRestockQty('')
  }

  const addMaterial = (e: FormEvent) => {
    e.preventDefault()
    const next = Math.max(...materials.map((m) => Number(m.id.split('-')[1]))) + 1
    const item: Material = {
      id: `RM-${String(next).padStart(3, '0')}`,
      name: newItem.name.trim(),
      category: newItem.category,
      stock: Number(newItem.stock),
      unit: newItem.unit.trim() || 'kg',
      reorderLevel: Number(newItem.reorderLevel),
      supplier: newItem.supplier.trim() || '—',
      unitCost: Number(newItem.unitCost),
      lastRestocked: DEMO_TODAY,
    }
    setMaterials((prev) => [...prev, item])
    notify(`${item.name} added to inventory`)
    setAddOpen(false)
    setNewItem({ name: '', category: 'Yarn', stock: '', unit: 'kg', reorderLevel: '', supplier: '', unitCost: '' })
  }

  return (
    <>
      <PageHeader
        title="Raw Material Inventory"
        subtitle="Yarn, dyes, chemicals, greige fabric and trims"
        actions={<><DemoTag /><button type="button" className="btn primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add material</button></>}
      />

      <div className="stat-grid three">
        <StatCard icon={Boxes} label="Materials tracked" value={materials.length} hint={`${CATEGORIES.length} categories`} tone="navy" />
        <StatCard icon={IndianRupee} label="Stock value" value={formatINRCompact(totalValue)} hint="At last purchase cost" tone="teal" />
        <StatCard icon={TriangleAlert} label="Below reorder level" value={lowCount} hint={lowCount ? 'Click to filter' : 'All healthy'} tone={lowCount ? 'red' : 'green'} onClick={() => setLowOnly(true)} />
      </div>

      <div className="grid-2-1">
        <Card title="Stock register">
          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder="Search material, code, supplier…" />
            <SelectFilter label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
            <label className="checkbox"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>
          </Toolbar>
          <DataTable
            rows={filtered}
            rowKey={(m) => m.id}
            columns={[
              { key: 'name', header: 'Material', render: (m) => <><strong>{m.name}</strong><div className="muted small">{m.id} · {m.category}</div></> },
              { key: 'stock', header: 'In stock', align: 'right', render: (m) => `${formatNumber(m.stock)} ${m.unit}` },
              { key: 'level', header: 'Level vs reorder', render: (m) => <div className="level-cell"><Progress value={(m.stock / (m.reorderLevel * 2)) * 100} tone={isLowStock(m) ? 'red' : 'teal'} /><span className="muted small">min {formatNumber(m.reorderLevel)}</span></div> },
              { key: 'supplier', header: 'Supplier', render: (m) => m.supplier },
              { key: 'cost', header: 'Unit cost', align: 'right', render: (m) => formatINR(m.unitCost) },
              { key: 'last', header: 'Last restock', render: (m) => formatDate(m.lastRestocked) },
              { key: 'st', header: 'Status', render: (m) => <Badge>{isLowStock(m) ? 'Low stock' : 'OK'}</Badge> },
              { key: 'act', header: '', align: 'right', render: (m) => <button type="button" className="btn ghost small" onClick={() => setRestock(m)}><PackagePlus size={14} /> Restock</button> },
            ]}
          />
        </Card>

        <Card title="Stock value by category">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" {...axisProps} tickFormatter={(v: number) => formatINRCompact(v)} />
                <YAxis type="category" dataKey="category" {...axisProps} width={72} />
                <Tooltip {...tooltipStyle} formatter={(v) => formatINR(Number(v))} />
                <Bar dataKey="value" name="Stock value" fill={chartColors.navy} radius={[0, 4, 4, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Modal
        open={restock !== null}
        title={`Restock — ${restock?.name ?? ''}`}
        onClose={() => setRestock(null)}
        footer={<><button type="button" className="btn secondary" onClick={() => setRestock(null)}>Cancel</button><button type="submit" form="restock-form" className="btn primary">Record receipt</button></>}
      >
        {restock && (
          <form id="restock-form" className="form-grid" onSubmit={doRestock}>
            <Field label="Current stock"><input disabled value={`${formatNumber(restock.stock)} ${restock.unit}`} /></Field>
            <Field label={`Quantity received (${restock.unit})`}><input required autoFocus type="number" min={1} value={restockQty} onChange={(e) => setRestockQty(e.target.value)} /></Field>
            <Field label="Supplier" full><input disabled value={restock.supplier} /></Field>
          </form>
        )}
      </Modal>

      <Modal
        open={addOpen}
        title="Add raw material"
        onClose={() => setAddOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setAddOpen(false)}>Cancel</button><button type="submit" form="material-form" className="btn primary">Add material</button></>}
      >
        <form id="material-form" className="form-grid" onSubmit={addMaterial}>
          <Field label="Material name" full><input required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></Field>
          <Field label="Category">
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Material['category'] })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Unit"><input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} placeholder="kg, L, m, pcs" /></Field>
          <Field label="Opening stock"><input required type="number" min={0} value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} /></Field>
          <Field label="Reorder level"><input required type="number" min={0} value={newItem.reorderLevel} onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })} /></Field>
          <Field label="Supplier"><input value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} /></Field>
          <Field label="Unit cost (₹)"><input required type="number" min={0} step="0.01" value={newItem.unitCost} onChange={(e) => setNewItem({ ...newItem, unitCost: e.target.value })} /></Field>
        </form>
      </Modal>
    </>
  )
}

