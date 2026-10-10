import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, Plus, UserCheck, Users, UserX } from 'lucide-react'
import { Badge, Card, DataTable, DemoTag, Field, Modal, PageHeader, SearchInput, SelectFilter, StatCard, Toolbar } from '../components/ui'
import { axisProps, chartColors, gridProps, tooltipStyle } from '../components/chartTheme'
import { useData } from '../store/DataContext'
import { weeklyAttendance } from '../data/demoData'
import { formatINR, matchesSearch } from '../utils/format'

const DEPARTMENTS = ['Weaving', 'Dyeing', 'Stitching', 'Quality', 'Warehouse', 'Maintenance']
const SHIFTS = ['Morning', 'Evening', 'Night']
const ATTENDANCE = ['Present', 'Late', 'Absent', 'On Leave']

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function Workers() {
  const { workers, setWorkers, notify } = useData()
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('All')
  const [shift, setShift] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', department: 'Weaving', shift: 'Morning', dailyWage: '' })

  const filtered = useMemo(
    () => workers.filter((w) => (dept === 'All' || w.department === dept) && (shift === 'All' || w.shift === shift) && matchesSearch(query, w.id, w.name, w.role)),
    [workers, dept, shift, query],
  )

  const count = (s) => workers.filter((w) => w.status === s).length
  const onFloor = count('Present') + count('Late')
  const todayChart = [...weeklyAttendance, { day: 'Today', present: onFloor, absent: workers.length - onFloor }]

  const mark = (w, status) => {
    setWorkers((prev) => prev.map((x) => (x.id === w.id ? { ...x, status, checkIn: status === 'Present' || status === 'Late' ? (x.checkIn !== '—' ? x.checkIn : nowHHMM()) : '—' } : x)))
    notify(`${w.name} marked ${status}`)
  }

  const submit = (e) => {
    e.preventDefault()
    const next = Math.max(...workers.map((w) => Number(w.id.split('-')[1]))) + 1
    const w = {
      id: `EMP-${next}`,
      name: form.name.trim(),
      role: form.role.trim(),
      department: form.department,
      shift: form.shift,
      status: 'Absent',
      checkIn: '—',
      hoursThisWeek: 0,
      dailyWage: Number(form.dailyWage),
    }
    setWorkers((prev) => [...prev, w])
    notify(`${w.name} added as ${w.id}`)
    setOpen(false)
    setForm({ name: '', role: '', department: 'Weaving', shift: 'Morning', dailyWage: '' })
  }

  return (
    <>
      <PageHeader
        title="Workers & Attendance"
        subtitle="Shift roster and today's attendance register"
        actions={<><DemoTag /><button type="button" className="btn primary" onClick={() => setOpen(true)}><Plus size={16} /> Add worker</button></>}
      />

      <div className="stat-grid">
        <StatCard icon={Users} label="Total workforce" value={workers.length} tone="navy" />
        <StatCard icon={UserCheck} label="On floor today" value={onFloor} hint={`${Math.round((onFloor / workers.length) * 100)}% attendance`} tone="green" />
        <StatCard icon={Clock} label="Late arrivals" value={count('Late')} tone="amber" />
        <StatCard icon={UserX} label="Absent / on leave" value={count('Absent') + count('On Leave')} tone="red" />
      </div>

      <div className="grid-2-1">
        <Card title="Attendance register">
          <Toolbar>
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, ID, role…" />
            <SelectFilter label="Department" value={dept} options={DEPARTMENTS} onChange={setDept} />
            <SelectFilter label="Shift" value={shift} options={SHIFTS} onChange={setShift} />
          </Toolbar>
          <DataTable
            rows={filtered}
            rowKey={(w) => w.id}
            columns={[
              { key: 'name', header: 'Worker', render: (w) => <><strong>{w.name}</strong><div className="muted small">{w.id} · {w.role}</div></> },
              { key: 'dept', header: 'Department', render: (w) => w.department },
              { key: 'shift', header: 'Shift', render: (w) => w.shift },
              { key: 'in', header: 'Check-in', render: (w) => w.checkIn },
              { key: 'hrs', header: 'Hrs (week)', align: 'right', render: (w) => w.hoursThisWeek },
              { key: 'wage', header: 'Daily wage', align: 'right', render: (w) => formatINR(w.dailyWage) },
              { key: 'st', header: 'Status', render: (w) => <Badge>{w.status}</Badge> },
              {
                key: 'mark', header: 'Mark', render: (w) => (
                  <select className="compact-select" value={w.status} onChange={(e) => mark(w, e.target.value)} aria-label={`Attendance for ${w.name}`}>
                    {ATTENDANCE.map((a) => <option key={a}>{a}</option>)}
                  </select>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Attendance this week">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={todayChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} width={32} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" name="Present" stackId="a" fill={chartColors.teal} maxBarSize={32} />
                <Bar dataKey="absent" name="Absent" stackId="a" fill={chartColors.slate} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="shift-summary">
            {SHIFTS.map((s) => {
              const inShift = workers.filter((w) => w.shift === s)
              const here = inShift.filter((w) => w.status === 'Present' || w.status === 'Late').length
              return <li key={s}><span>{s} shift</span><strong>{here} / {inShift.length}</strong></li>
            })}
          </ul>
        </Card>
      </div>

      <Modal
        open={open}
        title="Add worker"
        onClose={() => setOpen(false)}
        footer={<><button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancel</button><button type="submit" form="worker-form" className="btn primary">Add worker</button></>}
      >
        <form id="worker-form" className="form-grid" onSubmit={submit}>
          <Field label="Full name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Role"><input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Loom Operator" /></Field>
          <Field label="Department">
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
          </Field>
          <Field label="Shift">
            <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>{SHIFTS.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Daily wage (₹)"><input required type="number" min={0} value={form.dailyWage} onChange={(e) => setForm({ ...form, dailyWage: e.target.value })} /></Field>
        </form>
      </Modal>
    </>
  )
}
