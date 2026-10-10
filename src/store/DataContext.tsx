import { createContext, useCallback, useContext, useMemo, useState, type Dispatch as SetState, type ReactNode, type SetStateAction } from 'react'
import * as demo from '../data/demoData'

export interface AppSettings {
  companyName: string
  plantLocation: string
  gstin: string
  contactEmail: string
  shiftStart: string
  dailyTarget: number
  lowStockBuffer: number
  notifyLowStock: boolean
  notifyBreakdown: boolean
  notifyQcFail: boolean
  notifyOverdue: boolean
}

const defaultSettings: AppSettings = {
  companyName: 'LoomFlow Demo Textiles',
  plantLocation: 'Demo Industrial Estate, Coimbatore',
  gstin: '33AAAAA0000A1Z5 (demo)',
  contactEmail: 'ops@loomflow.example',
  shiftStart: '06:00',
  dailyTarget: 7500,
  lowStockBuffer: 0,
  notifyLowStock: true,
  notifyBreakdown: true,
  notifyQcFail: true,
  notifyOverdue: false,
}

interface Toast {
  id: number
  message: string
}

interface DataState {
  orders: demo.Order[]
  setOrders: SetState<SetStateAction<demo.Order[]>>
  materials: demo.Material[]
  setMaterials: SetState<SetStateAction<demo.Material[]>>
  machines: demo.Machine[]
  setMachines: SetState<SetStateAction<demo.Machine[]>>
  batches: demo.Batch[]
  setBatches: SetState<SetStateAction<demo.Batch[]>>
  inspections: demo.Inspection[]
  setInspections: SetState<SetStateAction<demo.Inspection[]>>
  finishedGoods: demo.FinishedGood[]
  setFinishedGoods: SetState<SetStateAction<demo.FinishedGood[]>>
  dispatches: demo.Dispatch[]
  setDispatches: SetState<SetStateAction<demo.Dispatch[]>>
  workers: demo.Worker[]
  setWorkers: SetState<SetStateAction<demo.Worker[]>>
  invoices: demo.Invoice[]
  setInvoices: SetState<SetStateAction<demo.Invoice[]>>
  settings: AppSettings
  setSettings: SetState<SetStateAction<AppSettings>>
  isLowStock: (m: demo.Material) => boolean
  toasts: Toast[]
  notify: (message: string) => void
  resetDemoData: () => AppSettings
}

const DataContext = createContext<DataState | null>(null)

let toastSeq = 0

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState(demo.orders)
  const [materials, setMaterials] = useState(demo.materials)
  const [machines, setMachines] = useState(demo.machines)
  const [batches, setBatches] = useState(demo.batches)
  const [inspections, setInspections] = useState(demo.inspections)
  const [finishedGoods, setFinishedGoods] = useState(demo.finishedGoods)
  const [dispatches, setDispatches] = useState(demo.dispatches)
  const [workers, setWorkers] = useState(demo.workers)
  const [invoices, setInvoices] = useState(demo.invoices)
  const [settings, setSettings] = useState(defaultSettings)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string) => {
    const id = ++toastSeq
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  const isLowStock = useCallback(
    (m: demo.Material) => m.stock <= m.reorderLevel * (1 + settings.lowStockBuffer / 100),
    [settings.lowStockBuffer],
  )

  const resetDemoData = useCallback(() => {
    setOrders(demo.orders)
    setMaterials(demo.materials)
    setMachines(demo.machines)
    setBatches(demo.batches)
    setInspections(demo.inspections)
    setFinishedGoods(demo.finishedGoods)
    setDispatches(demo.dispatches)
    setWorkers(demo.workers)
    setInvoices(demo.invoices)
    setSettings(defaultSettings)
    return defaultSettings
  }, [])

  const value = useMemo<DataState>(
    () => ({
      orders, setOrders, materials, setMaterials, machines, setMachines, batches, setBatches,
      inspections, setInspections, finishedGoods, setFinishedGoods, dispatches, setDispatches,
      workers, setWorkers, invoices, setInvoices, settings, setSettings,
      isLowStock, toasts, notify, resetDemoData,
    }),
    [orders, materials, machines, batches, inspections, finishedGoods, dispatches, workers, invoices, settings, isLowStock, toasts, notify, resetDemoData],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
