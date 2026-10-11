import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleCheck, Download, FileText, IndianRupee, Lock, Pencil, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, Segmented, StatCard } from '../components/ui'
import { axisProps, categorical, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../store/permissions'
import { DEMO_TODAY, expenseBreakdown, monthlyFinance } from '../data/demoData'
import { downloadCSV, formatDate, formatINR, formatINRCompact } from '../utils/format'

const INVOICE_STATUSES = ['Unpaid', 'Overdue', 'Paid']
const DEPARTMENTS = ['Weaving', 'Dyeing', 'Stitching', 'Quality', 'Warehouse', 'Maintenance', 'Stores', 'Management']
const SHIFTS = ['Morning', 'Evening', 'Night']
const ACCOUNT_ROLES = ['Admin', 'Staff']
const LOCK_TIP = 'Only authorised roles can edit'
const SELF_TIP = 'Only the Super Admin can change this'

const emptyWorkerForm = { name: '', role: '', department: 'Weaving', shift: 'Morning', dailyWage: '', accountRole: 'Staff' }

export function Finance() {
  const { invoices, setInvoices, orders, workers, setWorkers, materials, salaryMeta, setSalaryMeta, notify } = useData()
  const { user } = useAuth()
  const canFinanceEdit = can(user, 'finance.edit')
  const isSuper = user?.role === 'Super Admin'
  const [invStatus, setInvStatus] = useState('All')
  const [confirmPaid, setConfirmPaid] = useState(null)
  const [wageEdit, setWageEdit] = useState(null)
  const [wageValue, setWageValue] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [workerForm, setWorkerForm] = useState(emptyWorkerForm)

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
    if (!can(user, 'finance.edit')) { notify('Only authorised roles can edit'); return }
    setInvoices((p) => p.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)))
    notify(`${id} marked as paid`)
  }

  const downloadReport = (r) => {
    if (!can(user, 'finance.edit')) { notify('Only authorised roles can edit'); return }
    r.run()
    notify(`${r.name} downloaded (CSV)`)
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
      name: 'Inventory valuation',
      desc: 'Raw-material stock at purchase cost',
      run: () => downloadCSV('loomflow-inventory-valuation-demo.csv', materials.map((m) => ({ id: m.id, name: m.name, stock: m.stock, unit: m.unit, unitCost: m.unitCost, value: Math.round(m.stock * m.unitCost) }))),
    },
  ]

  // ---- Payroll: rows filtered by salary rules BEFORE rendering ----
  const isSelf = (w) => w.id === user?.workerId
  const visibleRows = [...workers]
    .filter((w) => can(user, 'salary.view', w))
    .sort((a, b) => (isSelf(a) ? -1 : isSelf(b) ? 1 : 0))
  const rowMeta = (id) => salaryMeta[id] ?? { status: 'Pending' }
  const payableOf = (w) => w.dailyWage * w.daysPresent
  const totalPayroll = visibleRows.reduce((s, w) => s + payableOf(w), 0)
  const paidPayroll = visibleRows.filter((w) => rowMeta(w.id).status === 'Paid').reduce((s, w) => s + payableOf(w), 0)

  const doMarkPaid = () => {
    if (!confirmPaid) return
    if (!can(user, 'salary.edit', confirmPaid)) { notify('Only authorised roles can edit'); return }
    setSalaryMeta((prev) => ({ ...prev, [confirmPaid.id]: { status: 'Paid', paidOn: DEMO_TODAY, paidBy: user.name } }))
    notify(`${confirmPaid.name} marked paid`)
    setConfirmPaid(null)
  }

  const openWageEdit = (w) => {
    setWageEdit(w)
    setWageValue(String(w.dailyWage))
  }

  const submitWage = (e) => {
    e.preventDefault()
    if (!wageEdit || !can(user, 'salary.edit', wageEdit)) { notify('Only authorised roles can edit'); return }
    setWorkers((prev) => prev.map((x) => (x.id === wageEdit.id ? { ...x, dailyWage: Number(wageValue) } : x)))
    notify(`${wageEdit.name}'s wage updated`)
    setWageEdit(null)
  }

  const submitWorker = (e) => {
    e.preventDefault()
    const accountRole = isSuper ? workerForm.accountRole : 'Staff'
    if (!can(user, 'workers.add', accountRole)) { notify('Only authorised roles can edit'); return }
    const next = Math.max(...workers.map((w) => Number(w.id.split('-')[1]))) + 1
    const w = {
      id: `EMP-${next}`,
      name: workerForm.name.trim(),
      role: workerForm.role.trim(),
      department: workerForm.department,
      shift: workerForm.shift,
      status: 'Absent',
      checkIn: '—',
      hoursThisWeek: 0,
      dailyWage: Number(workerForm.dailyWage),
      daysPresent: 0,
      accountRole,
    }
    setWorkers((prev) => [...prev, w])
    notify(`${w.name} added as ${w.id}`)
    setAddOpen(false)
    setWorkerForm(emptyWorkerForm)
  }

  const exportPayroll = () => {
    downloadCSV('loomflow-payroll-demo.csv', visibleRows.map((w) => {
      const m = rowMeta(w.id)
      return {
        id: w.id, name: w.name, role: w.role, department: w.department, accountRole: w.accountRole,
        dailyWage: w.dailyWage, daysPresent: w.daysPresent, payable: payableOf(w),
        status: m.status, paidOn: m.paidOn ?? '', paidBy: m.paidBy ?? '',
      }
    }))
    notify('Payroll exported (CSV)')
  }

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
              {
                key: 'act', header: '', align: 'right', render: (i) => {
                  if (i.status === 'Paid') return null
                  return canFinanceEdit
                    ? <button type="button" className="btn small secondary" onClick={() => markPaid(i.id)}><CircleCheck size={14} /> Mark paid</button>
                    : <button type="button" className="btn small secondary" disabled title={LOCK_TIP}><Lock size={14} /> Mark paid</button>
                },
              },
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
                {canFinanceEdit
                  ? <button type="button" className="icon-btn" onClick={() => downloadReport(r)} aria-label={`Download ${r.name}`}><Download size={16} /></button>
                  : <button type="button" className="icon-btn" disabled title={LOCK_TIP} aria-label={`Download ${r.name}`}><Lock size={16} /></button>}
              </li>
            ))}
          </ul>
          <p className="muted small"><TrendingDown size={12} /> Reports are generated from the in-browser demo data.</p>
        </Card>
      </div>

      <Card
        title="Payroll"
        actions={
          <>
            <button type="button" className="btn secondary" onClick={exportPayroll}><Download size={16} /> Export CSV</button>
            <button type="button" className="btn primary" onClick={() => { setWorkerForm(emptyWorkerForm); setAddOpen(true) }}><Plus size={16} /> Add worker</button>
          </>
        }
      >
        <div className="stat-grid three">
          <StatCard icon={Wallet} label="Payroll this month" value={formatINRCompact(totalPayroll)} hint={`${visibleRows.length} people shown`} tone="navy" />
          <StatCard icon={CircleCheck} label="Paid" value={formatINRCompact(paidPayroll)} tone="green" />
          <StatCard icon={Receipt} label="Pending" value={formatINRCompact(totalPayroll - paidPayroll)} tone="amber" />
        </div>
        <DataTable
          rows={visibleRows}
          rowKey={(w) => w.id}
          empty="No payroll rows to show."
          columns={[
            { key: 'name', header: 'Person', render: (w) => <><strong>{w.name}</strong><div className="muted small">{w.id}{isSelf(w) ? ' · You' : ''}</div></> },
            { key: 'role', header: 'Role', render: (w) => w.role },
            { key: 'dept', header: 'Department', render: (w) => w.department },
            { key: 'acct', header: 'Account', render: (w) => <Badge tone={w.accountRole === 'Admin' ? 'navy' : 'slate'}>{w.accountRole}</Badge> },
            {
              key: 'wage', header: 'Daily wage', align: 'right', render: (w) => (
                <span className="row-actions">
                  {formatINR(w.dailyWage)}
                  {can(user, 'salary.edit', w)
                    ? <button type="button" className="icon-btn small" onClick={() => openWageEdit(w)} aria-label={`Edit wage for ${w.name}`}><Pencil size={14} /></button>
                    : (isSelf(w) ? <Lock size={14} className="muted" title={SELF_TIP} aria-label={SELF_TIP} /> : null)}
                </span>
              ),
            },
            { key: 'days', header: 'Days present', align: 'right', render: (w) => w.daysPresent },
            { key: 'pay', header: 'Payable', align: 'right', render: (w) => formatINR(payableOf(w)) },
            { key: 'st', header: 'Status', render: (w) => <Badge>{rowMeta(w.id).status}</Badge> },
            {
              key: 'paidon', header: 'Paid on', render: (w) => {
                const m = rowMeta(w.id)
                return m.status === 'Paid'
                  ? <><div>{formatDate(m.paidOn)}</div><div className="muted small">{m.paidBy}</div></>
                  : <span className="muted">—</span>
              },
            },
            {
              key: 'act', header: '', align: 'right', render: (w) => (
                rowMeta(w.id).status === 'Pending' && can(user, 'salary.edit', w)
                  ? <button type="button" className="btn small secondary" onClick={() => setConfirmPaid(w)}><CircleCheck size={14} /> Mark paid</button>
                  : null
              ),
            },
          ]}
        />
      </Card>

      <Modal open={confirmPaid !== null} title={`Mark paid — ${confirmPaid?.name ?? ''}`} onClose={() => setConfirmPaid(null)}>
        {confirmPaid && (
          <>
            <p>Mark {formatINR(payableOf(confirmPaid))} payable to {confirmPaid.name} as paid?</p>
            <div className="status-picker">
              <button type="button" className="btn secondary" onClick={() => setConfirmPaid(null)}>Cancel</button>
              <button type="button" className="btn primary" onClick={doMarkPaid}><CircleCheck size={16} /> Confirm paid</button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={wageEdit !== null}
        title={`Edit wage — ${wageEdit?.name ?? ''}`}
        onClose={() => setWageEdit(null)}
        footer={<><button type="button" className="btn secondary" onClick={() => setWageEdit(null)}>Cancel</button><button type="submit" form="wage-form" className="btn primary">Save wage</button></>}
      >
        {wageEdit && (
          <form id="wage-form" className="form-grid" onSubmit={submitWage}>
            <Field label="Daily wage (₹)" full><input required type="number" min={0} value={wageValue} onChange={(e) => setWageValue(e.target.value)} /></Field>
            <Field label="Amount payable" full><input disabled value={formatINR(Number(wageValue || 0) * wageEdit.daysPresent)} /></Field>
          </form>
        )}
      </Modal>

      <Modal
        open={addOpen}
        title="Add worker"
        onClose={() => setAddOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setAddOpen(false)}>Cancel</button><button type="submit" form="payroll-worker-form" className="btn primary">Add worker</button></>}
      >
        <form id="payroll-worker-form" className="form-grid" onSubmit={submitWorker}>
          <Field label="Full name"><input required value={workerForm.name} onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })} /></Field>
          <Field label="Role"><input required value={workerForm.role} onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })} placeholder="e.g. Loom Operator" /></Field>
          <Field label="Department">
            <select value={workerForm.department} onChange={(e) => setWorkerForm({ ...workerForm, department: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
          </Field>
          <Field label="Shift">
            <select value={workerForm.shift} onChange={(e) => setWorkerForm({ ...workerForm, shift: e.target.value })}>{SHIFTS.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Daily wage (₹)"><input required type="number" min={0} value={workerForm.dailyWage} onChange={(e) => setWorkerForm({ ...workerForm, dailyWage: e.target.value })} /></Field>
          {isSuper ? (
            <Field label="Account role">
              <select value={workerForm.accountRole} onChange={(e) => setWorkerForm({ ...workerForm, accountRole: e.target.value })}>{ACCOUNT_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            </Field>
          ) : (
            <Field label="Account role"><input disabled value="Staff" /></Field>
          )}
        </form>
      </Modal>
    </>
  )
}
