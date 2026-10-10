import { useState, type FormEvent } from 'react'
import { Bell, Building2, Database, RotateCcw, Save, SlidersHorizontal } from 'lucide-react'
import { Card, Field, PageHeader, Toggle } from '../components/ui'
import { useData, type AppSettings } from '../store/DataContext'

export function SettingsPage() {
  const { settings, setSettings, resetDemoData, notify } = useData()
  const [draft, setDraft] = useState<AppSettings>(settings)
  const [confirmReset, setConfirmReset] = useState(false)

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const save = (e: FormEvent) => {
    e.preventDefault()
    setSettings(draft)
    notify('Settings saved for this session')
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Settings"
        subtitle="Plant profile, production targets and alerts"
        actions={
          <>
            <button type="button" className="btn secondary" disabled={!dirty} onClick={() => setDraft(settings)}>Discard</button>
            <button type="submit" className="btn primary" disabled={!dirty}><Save size={16} /> Save changes</button>
          </>
        }
      />

      <div className="settings-grid">
        <Card title="Company profile" actions={<Building2 size={18} className="muted" />}>
          <div className="form-grid">
            <Field label="Company name" full><input required value={draft.companyName} onChange={(e) => set('companyName', e.target.value)} /></Field>
            <Field label="Plant location" full><input value={draft.plantLocation} onChange={(e) => set('plantLocation', e.target.value)} /></Field>
            <Field label="GSTIN"><input value={draft.gstin} onChange={(e) => set('gstin', e.target.value)} /></Field>
            <Field label="Contact email"><input type="email" value={draft.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
          </div>
        </Card>

        <Card title="Production" actions={<SlidersHorizontal size={18} className="muted" />}>
          <div className="form-grid">
            <Field label="First shift starts"><input type="time" value={draft.shiftStart} onChange={(e) => set('shiftStart', e.target.value)} /></Field>
            <Field label="Daily output target (m)"><input type="number" min={0} step={100} value={draft.dailyTarget} onChange={(e) => set('dailyTarget', Number(e.target.value))} /></Field>
            <Field label={`Low-stock buffer: ${draft.lowStockBuffer}% above reorder level`} full>
              <input type="range" min={0} max={50} step={5} value={draft.lowStockBuffer} onChange={(e) => set('lowStockBuffer', Number(e.target.value))} />
            </Field>
          </div>
          <p className="muted small">The buffer flags materials early — e.g. 20% alerts when stock falls to 1.2× the reorder level.</p>
        </Card>

        <Card title="Notifications" actions={<Bell size={18} className="muted" />}>
          <Toggle label="Low-stock alerts" description="Raw materials at or below reorder level" checked={draft.notifyLowStock} onChange={(v) => set('notifyLowStock', v)} />
          <Toggle label="Machine breakdowns" description="Any machine reporting Breakdown status" checked={draft.notifyBreakdown} onChange={(v) => set('notifyBreakdown', v)} />
          <Toggle label="Failed QC inspections" description="Batches that fail quality inspection" checked={draft.notifyQcFail} onChange={(v) => set('notifyQcFail', v)} />
          <Toggle label="Overdue invoices" description="Email digest (not active in demo)" checked={draft.notifyOverdue} onChange={(v) => set('notifyOverdue', v)} />
        </Card>

        <Card title="Data source" actions={<Database size={18} className="muted" />}>
          <p>LoomFlow is running in <strong>demo mode</strong>. All records are sample data held in your browser and are reset on page reload. No database is connected.</p>
          {confirmReset ? (
            <div className="confirm-row">
              <span>Reset all pages to the original demo data?</span>
              <button type="button" className="btn secondary small" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button type="button" className="btn danger small" onClick={() => { setDraft(resetDemoData()); setConfirmReset(false); notify('Demo data reset') }}>Reset</button>
            </div>
          ) : (
            <button type="button" className="btn secondary" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset demo data</button>
          )}
        </Card>
      </div>
    </form>
  )
}
