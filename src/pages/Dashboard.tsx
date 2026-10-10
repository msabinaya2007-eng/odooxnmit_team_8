import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ChevronRight, ClipboardList, Factory, IndianRupee, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, PageHeader, Progress, StatCard } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { monthlyFinance, weeklyProduction } from '../data/demoData'
import { formatDate, formatINR, formatINRCompact, formatNumber } from '../utils/format'
import type { PageProps } from '../navigation'

export function Dashboard({ onNavigate }: PageProps) {
  const { orders, machines, materials, inspections, isLowStock, settings } = useData()

  const activeOrders = orders.filter((o) => ['Pending', 'In Production', 'Quality Check', 'Ready'].includes(o.status))
  const todayProduction = weeklyProduction[weeklyProduction.length - 1].actual
  const todayPct = Math.round((todayProduction / settings.dailyTarget) * 100)
  const lowStock = materials.filter(isLowStock)
  const pendingQc = inspections.filter((i) => i.result === 'Pending')
  const month = monthlyFinance[monthlyFinance.length - 2] // last full month
  const margin = Math.round((month.profit / month.revenue) * 100)

  const statusCounts = (['Running', 'Idle', 'Maintenance', 'Breakdown'] as const).map((s) => ({
    status: s,
    count: machines.filter((m) => m.status === s).length,
  }))
  const running = statusCounts[0].count
  const avgEff = Math.round(machines.filter((m) => m.status === 'Running').reduce((s, m) => s + m.efficiency, 0) / Math.max(running, 1))

  const chartData = weeklyProduction.map((d, i) => (i === weeklyProduction.length - 1 ? { ...d, target: settings.dailyTarget } : d))

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Plant overview for ${settings.companyName}`}
        actions={<DemoTag />}
      />

      <div className="stat-grid">
        <StatCard icon={ClipboardList} label="Active orders" value={activeOrders.length} hint={`${activeOrders.filter((o) => o.priority === 'High').length} high priority`} tone="navy" onClick={() => onNavigate('orders')} />
        <StatCard icon={Factory} label="Today's production" value={`${formatNumber(todayProduction)} m`} hint={<span className={todayPct >= 100 ? 'pos' : 'neg'}>{todayPct}% of {formatNumber(settings.dailyTarget)} m target</span>} tone="teal" onClick={() => onNavigate('production')} />
        <StatCard icon={Activity} label="Machines running" value={`${running} / ${machines.length}`} hint={`Avg. efficiency ${avgEff}%`} tone="green" onClick={() => onNavigate('production')} />
        <StatCard icon={TriangleAlert} label="Low-stock alerts" value={lowStock.length} hint="Materials at or below reorder level" tone={lowStock.length ? 'red' : 'green'} onClick={() => onNavigate('inventory')} />
        <StatCard icon={ShieldCheck} label="Pending inspections" value={pendingQc.length} hint="Batches awaiting QC" tone="amber" onClick={() => onNavigate('quality')} />
        <StatCard icon={IndianRupee} label={`Revenue (${month.month})`} value={formatINRCompact(month.revenue)} hint={`Expenses ${formatINRCompact(month.expenses)}`} tone="navy" onClick={() => onNavigate('finance')} />
        <StatCard icon={TrendingUp} label={`Net profit (${month.month})`} value={formatINRCompact(month.profit)} hint={<span className="pos">{margin}% margin</span>} tone="teal" onClick={() => onNavigate('finance')} />
      </div>

      <div className="grid-2-1">
        <Card title="Production — last 7 days (metres)">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} width={48} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v) => `${formatNumber(Number(v))} m`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="actual" name="Actual output" fill={chartColors.teal} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Line dataKey="target" name="Target" stroke={chartColors.navy} strokeWidth={2} strokeDasharray="5 4" dot={false} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Machine status" actions={<button type="button" className="btn ghost small" onClick={() => onNavigate('production')}>Floor view <ChevronRight size={14} /></button>}>
          <ul className="status-list">
            {statusCounts.map((s) => (
              <li key={s.status}>
                <Badge>{s.status}</Badge>
                <div className="status-bar"><Progress value={(s.count / machines.length) * 100} tone={s.status === 'Running' ? 'green' : s.status === 'Breakdown' ? 'red' : s.status === 'Maintenance' ? 'amber' : 'slate'} /></div>
                <strong>{s.count}</strong>
              </li>
            ))}
          </ul>
          <div className="machine-dots" aria-label="Machines">
            {machines.map((m) => (
              <span key={m.id} className={`machine-dot st-${m.status.toLowerCase()}`} title={`${m.name}: ${m.status}`}>{m.id}</span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card title="Recent orders" actions={<button type="button" className="btn ghost small" onClick={() => onNavigate('orders')}>All orders <ChevronRight size={14} /></button>}>
          <DataTable
            rows={[...orders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)).slice(0, 6)}
            rowKey={(o) => o.id}
            columns={[
              { key: 'id', header: 'Order', render: (o) => <strong>{o.id}</strong> },
              { key: 'cust', header: 'Customer', render: (o) => o.customer },
              { key: 'prod', header: 'Product', render: (o) => o.product },
              { key: 'due', header: 'Due', render: (o) => formatDate(o.dueDate) },
              { key: 'val', header: 'Value', align: 'right', render: (o) => formatINR(o.value) },
              { key: 'st', header: 'Status', render: (o) => <Badge>{o.status}</Badge> },
            ]}
          />
        </Card>

        <Card title="Low-stock alerts" actions={<button type="button" className="btn ghost small" onClick={() => onNavigate('inventory')}>Inventory <ChevronRight size={14} /></button>}>
          {lowStock.length === 0 ? (
            <p className="muted">All materials are above reorder level.</p>
          ) : (
            <ul className="alert-list">
              {lowStock.map((m) => (
                <li key={m.id}>
                  <TriangleAlert size={16} className="neg" />
                  <div className="alert-text">
                    <strong>{m.name}</strong>
                    <span className="muted small">{formatNumber(m.stock)} {m.unit} left · reorder at {formatNumber(m.reorderLevel)}</span>
                    <Progress value={(m.stock / m.reorderLevel) * 100} tone="red" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
