import { Badge, Card, DemoTag, PageHeader } from '../components/ui'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../store/permissions'
import { formatDate, formatINR } from '../utils/format'

export function Salary() {
  const { workers, salaryMeta } = useData()
  const { user } = useAuth()
  const me = workers.find((w) => w.id === user?.workerId) ?? null
  const meta = me ? salaryMeta[me.id] ?? { status: 'Pending' } : null
  const payable = me ? me.dailyWage * me.daysPresent : 0

  return (
    <>
      <PageHeader
        title="My Salary"
        subtitle="Your pay for this month"
        actions={<DemoTag />}
      />

      {!me || !can(user, 'salary.view', me) ? (
        <Card title="No record">
          <p className="muted">No payroll record found for your account.</p>
        </Card>
      ) : (
        <Card title={`${me.name} · ${me.id}`}>
          <dl className="slip-grid">
            <dt>Role</dt><dd>{me.role} · {me.department}</dd>
            <dt>Daily wage</dt><dd>{formatINR(me.dailyWage)}</dd>
            <dt>Days present this month</dt><dd>{me.daysPresent}</dd>
            <dt>Amount payable</dt><dd>{formatINR(payable)}</dd>
            <dt>Status</dt><dd><Badge>{meta.status}</Badge></dd>
            <dt>Paid on</dt><dd>{meta.status === 'Paid' ? formatDate(meta.paidOn) : '—'}</dd>
          </dl>
        </Card>
      )}
    </>
  )
}
