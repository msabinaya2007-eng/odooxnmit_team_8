import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleCheck, Download, FileText, IndianRupee, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, PageHeader, Segmented, StatCard } from '../components/ui'
import { axisProps, categorical, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { expenseBreakdown, monthlyFinance } from '../data/demoData'
import { downloadCSV, formatDate, formatINR, formatINRCompact } from '../utils/format'

const INVOICE_STATUSES = ['Unpaid', 'Overdue', 'Paid']

export function Finance() {
  const { invoices, setInvoices, orders, workers, materials, notify } = useData()
  const [invStatus, setInvStatus] = useState('All')

  const full = monthlyFinance.slice(0, -1) // completed months
  const last = full[full.length - 1]
  const prev = full[full.length - 2]
  const revGrowth = Math.round(((last.revenue - prev.revenue) / prev.revenue) * 100)
  const ytdRevenue = monthlyFinance.reduce((s, m) => s + m.revenue, 0)
  const ytdProfit = monthlyFinance.reduce((s, m) => s + m.profit, 0)
  const receivable = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
  const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0)

  const shownInvoices = useMemo(() => invoices.filter((i) => invStatus === 'All' || i.status === invStatus), [invoices, invStatus])

  const markPaid = (id) => {
    setInvoices((p) => p.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)))
    notify(`${id} marked as paid`)
  }

  const reports = [
    {
      name: 'Monthly P&L summary',
      desc: 'Revenue, expenses and profit by month',
      run: () => downloadCSV('loomflow-pnl-demo.csv', monthlyFinance.map((m) => ({ ...m }))),
    },
    {
      name: 'Order book',
      desc: 'All orders with status and value',
      run: () => downloadCSV('loomflow-order-book-demo.csv', orders.map((o) => ({ ...o }))),
    },
    {
      name: 'Wage register (daily)',
      desc: 'Workers, attendance status and daily wage',
      run: () => downloadCSV('loomflow-wages-demo.csv', workers.map((w) => ({ id: w.id, name: w.name, department: w.department, status: w.status, dailyWage: w.dailyWage, payableToday: w.status === 'Present' || w.status === 'Late' ? w.dailyWage : 0 }))),
    },
    {
      name: 'Inventory valuation',
      desc: 'Raw-material stock at purchase cost',
      run: () => downloadCSV('loomflow-inventory-valuation-demo.csv', materials.map((m) => ({ id: m.id, name: m.name, stock: m.stock, unit: m.unit, unitCost: m.unitCost, value: Math.round(m.stock * m.unitCost) }))),
    },
  ]

  return (
    <>
      <PageHeader title="Finance & Reports" subtitle="Financial year 2026-27 (demo figures in INR)" actions={<DemoTag />} />

      <div className="stat-grid">
        <StatCard icon={IndianRupee} label={`Revenue (${last.month})`} value={formatINRCompact(last.revenue)} hint={<span className={revGrowth >= 0 ? 'pos' : 'neg'}>{revGrowth >= 0 ? '▲' : '▼'} {Math.abs(revGrowth)}% vs {prev.month}</span>} tone="navy" />
        <StatCard icon={TrendingUp} label={`Profit (${last.month})`} value={formatINRCompact(last.profit)} hint={`${Math.round((last.profit / last.revenue) * 100)}% margin`} tone="teal" />
        <StatCard icon={Wallet} label="Revenue (6 months)" value={formatINRCompact(ytdRevenue)} hint={`Profit ${formatINRCompact(ytdProfit)}`} tone="green" />
        <StatCard icon={Receipt} label="Receivables" value={formatINRCompact(receivable)} hint={<span className="neg">{formatINRCompact(overdue)} overdue</span>} tone="amber" onClick={() => setInvStatus('Overdue')} />
      </div>

      <div className="grid-2-1">
        <Card title="Revenue, expenses & profit">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFinance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.navy} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.navy} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.teal} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} width={56} tickFormatter={(v) => formatINRCompact(v)} />
                <Tooltip {...tooltipStyle} formatter={(v) => formatINR(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartColors.navy} strokeWidth={2} fill="url(#gRev)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke={chartColors.slate} strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke={chartColors.teal} strokeWidth={2} fill="url(#gProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="muted small">Oct is month-to-date.</p>
        </Card>

        <Card title={`Expense breakdown (${last.month})`}>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="78%" paddingAngle={2} stroke="#fff">
                  {expenseBreakdown.map((d, i) => <Cell key={d.name} fill={categorical[i % categorical.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => formatINR(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card title="Invoices">
          <Segmented
            value={invStatus}
            onChange={setInvStatus}
            options={[{ value: 'All', label: 'All', count: invoices.length }, ...INVOICE_STATUSES.map((s) => ({ value: s, label: s, count: invoices.filter((i) => i.status === s).length }))]}
          />
          <DataTable
            rows={shownInvoices}
            rowKey={(i) => i.id}
            columns={[
              { key: 'id', header: 'Invoice', render: (i) => <><strong>{i.id}</strong><div className="muted small">{i.orderId}</div></> },
              { key: 'cust', header: 'Customer', render: (i) => i.customer },
              { key: 'issued', header: 'Issued', render: (i) => formatDate(i.issued) },
              { key: 'due', header: 'Due', render: (i) => formatDate(i.due) },
              { key: 'amt', header: 'Amount', align: 'right', render: (i) => formatINR(i.amount) },
              { key: 'st', header: 'Status', render: (i) => <Badge>{i.status}</Badge> },
              { key: 'act', header: '', align: 'right', render: (i) => i.status !== 'Paid' ? <button type="button" className="btn small secondary" onClick={() => markPaid(i.id)}><CircleCheck size={14} /> Mark paid</button> : null },
            ]}
          />
        </Card>

        <Card title="Reports">
          <ul className="report-list">
            {reports.map((r) => (
              <li key={r.name}>
                <FileText size={18} className="report-icon" />
                <div>
                  <strong>{r.name}</strong>
                  <div className="muted small">{r.desc}</div>
                </div>
                <button type="button" className="icon-btn" onClick={() => { r.run(); notify(`${r.name} downloaded (CSV)`) }} aria-label={`Download ${r.name}`}><Download size={16} /></button>
              </li>
            ))}
          </ul>
          <p className="muted small"><TrendingDown size={12} /> Reports are generated from the in-browser demo data.</p>
        </Card>
      </div>
    </>
  )
}
