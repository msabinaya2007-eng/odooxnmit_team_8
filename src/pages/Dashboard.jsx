import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ChevronRight, ClipboardList, IndianRupee, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react'
import { Card, DemoTag, PageHeader, Progress, StatCard } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { monthlyFinance, weeklyProduction } from '../data/demoData'
import { formatINRCompact, formatNumber } from '../utils/format'

export function Dashboard({ onNavigate }) {
  const { orders, machines, materials, inspections, isLowStock, settings } = useData()
  const { user } = useAuth()
  const showMoney = user?.role !== 'Staff'

  const activeOrders = orders.filter((o) => ['Pending', 'In Production', 'Quality Check', 'Ready'].includes(o.status))
  const lowStock = materials.filter(isLowStock)
  const pendingQc = inspections.filter((i) => i.result === 'Pending')
  const month = monthlyFinance[monthlyFinance.length - 2] // last full month
  const margin = Math.round((month.profit / month.revenue) * 100)

  const running = machines.filter((m) => m.status === 'Running').length
  const avgEff = Math.round(machines.filter((m) => m.status === 'Running').reduce((s, m) => s + m.efficiency, 0) / Math.max(running, 1))

  const chartData = weeklyProduction.map((d, i) => (i === weeklyProduction.length - 1 ? { ...d, target: settings.dailyTarget } : d))

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Plant overview for ${settings.companyName}`}
        actions={<DemoTag />}
      />

      <div className="bento">
        {showMoney && <StatCard icon={TrendingUp} label={`Net profit (${month.month})`} value={formatINRCompact(month.profit)} hint={<span className="pos">{margin}% margin</span>} tone="teal" onClick={() => onNavigate('finance')} className="tile-dark span-7" />}
        {showMoney && <StatCard icon={IndianRupee} label={`Revenue (${month.month})`} value={formatINRCompact(month.revenue)} hint={`Expenses ${formatINRCompact(month.expenses)}`} tone="navy" onClick={() => onNavigate('finance')} className="tile-saffron span-5" />}
        <StatCard icon={ClipboardList} label="Active orders" value={activeOrders.length} hint={`${activeOrders.filter((o) => o.priority === 'High').length} high priority`} tone="navy" onClick={() => onNavigate('orders')} className="tile-indigo span-6" />
        <StatCard icon={Activity} label="Machines running" value={`${running} / ${machines.length}`} hint={`Avg. efficiency ${avgEff}%`} tone="green" onClick={() => onNavigate('production')} className="span-6" />
        <StatCard icon={TriangleAlert} label="Low-stock alerts" value={lowStock.length} hint="Materials at or below reorder level" tone={lowStock.length ? 'red' : 'green'} onClick={() => onNavigate('inventory')} className="tile-rose span-6" />
        <StatCard icon={ShieldCheck} label="Pending inspections" value={pendingQc.length} hint="Batches awaiting QC" tone="amber" onClick={() => onNavigate('quality')} className="span-6" />
      </div>

      <div className="bento">
        <Card title="Production — last 7 days (metres)" className="span-7">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} width={48} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v) => `${formatNumber(Number(v))} m`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="actual" name="Actual output" fill={chartColors.teal} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Line dataKey="target" name="Target" stroke={chartColors.navy} strokeWidth={2} strokeDasharray="5 4" dot={false} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Low-stock alerts" className="span-5" actions={<button type="button" className="btn ghost small" onClick={() => onNavigate('inventory')}>Inventory <ChevronRight size={14} /></button>}>
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
