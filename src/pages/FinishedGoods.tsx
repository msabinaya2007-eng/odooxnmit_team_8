import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Download, Layers, PackageCheck, Warehouse } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, PageHeader, SearchInput, SelectFilter, StatCard, Toolbar } from '../components/ui'
import { categorical, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import type { FinishedGood } from '../data/demoData'
import { downloadCSV, formatINR, formatINRCompact, formatNumber, matchesSearch } from '../utils/format'

const CATEGORIES: FinishedGood['category'][] = ['Shirting', 'Suiting', 'Home Textile', 'Knitwear', 'Denim']
const WAREHOUSES: FinishedGood['warehouse'][] = ['WH-A Coimbatore', 'WH-B Tiruppur', 'WH-C Erode']

export function FinishedGoods() {
  const { finishedGoods } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FinishedGood['category'] | 'All'>('All')
  const [warehouse, setWarehouse] = useState<FinishedGood['warehouse'] | 'All'>('All')

  const filtered = useMemo(
    () => finishedGoods.filter((g) =>
      (category === 'All' || g.category === category) &&
      (warehouse === 'All' || g.warehouse === warehouse) &&
      matchesSearch(query, g.sku, g.product, g.colour, g.bin, g.reservedFor)),
    [finishedGoods, category, warehouse, query],
  )

  const totalValue = finishedGoods.reduce((s, g) => s + g.quantity * g.unitValue, 0)
  const reserved = finishedGoods.filter((g) => g.reservedFor)
  const valueByCategory = CATEGORIES.map((c) => ({
    name: c,
    value: finishedGoods.filter((g) => g.category === c).reduce((s, g) => s + g.quantity * g.unitValue, 0),
  })).filter((d) => d.value > 0)

  return (
    <>
      <PageHeader
        title="Finished Goods"
        subtitle="Packed stock ready for sale or dispatch"
        actions={<><DemoTag /><button type="button" className="btn secondary" onClick={() => downloadCSV('loomflow-finished-goods-demo.csv', filtered.map((g) => ({ ...g })))}><Download size={16} /> Export CSV</button></>}
      />

      <div className="stat-grid three">
        <StatCard icon={PackageCheck} label="SKUs in stock" value={finishedGoods.length} tone="navy" />
        <StatCard icon={Warehouse} label="Inventory value" value={formatINRCompact(totalValue)} hint={`${WAREHOUSES.length} warehouses`} tone="teal" />
        <StatCard icon={Layers} label="Reserved for orders" value={reserved.length} hint={reserved.map((g) => g.reservedFor).join(', ')} tone="amber" />
      </div>

      <div className="grid-2-1">
        <Card title="Stock list">
          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder="Search SKU, product, colour, bin…" />
            <SelectFilter label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
            <SelectFilter label="Warehouse" value={warehouse} options={WAREHOUSES} onChange={setWarehouse} />
          </Toolbar>
          <DataTable
            rows={filtered}
            rowKey={(g) => g.sku}
            columns={[
              { key: 'sku', header: 'SKU', render: (g) => <code className="sku">{g.sku}</code> },
              { key: 'product', header: 'Product', render: (g) => <><div>{g.product}</div><div className="muted small">{g.category} · {g.colour}</div></> },
              { key: 'qty', header: 'Quantity', align: 'right', render: (g) => `${formatNumber(g.quantity)} ${g.unit}` },
              { key: 'wh', header: 'Location', render: (g) => <><div>{g.warehouse}</div><div className="muted small">Bin {g.bin}</div></> },
              { key: 'val', header: 'Value', align: 'right', render: (g) => formatINR(g.quantity * g.unitValue) },
              { key: 'res', header: 'Allocation', render: (g) => (g.reservedFor ? <Badge tone="navy">{`Reserved ${g.reservedFor}`}</Badge> : <Badge>Available</Badge>) },
            ]}
          />
        </Card>

        <Card title="Value by category">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={valueByCategory} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="#fff">
                  {valueByCategory.map((d, i) => <Cell key={d.name} fill={categorical[i % categorical.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => formatINR(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
