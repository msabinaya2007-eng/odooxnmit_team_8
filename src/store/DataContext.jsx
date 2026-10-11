import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as demo from '../data/demoData'

const defaultSettings = {
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

const DataContext = createContext(null)

let toastSeq = 0

export function DataProvider({ children }) {
  const [orders, setOrders] = useState(demo.orders)
  const [materials, setMaterials] = useState(demo.materials)
  const [machines, setMachines] = useState(demo.machines)
  const [batches, setBatches] = useState(demo.batches)
  const [inspections, setInspections] = useState(demo.inspections)
  const [finishedGoods, setFinishedGoods] = useState(demo.finishedGoods)
  const [dispatches, setDispatches] = useState(demo.dispatches)
  const [workers, setWorkers] = useState(demo.workers)
  const [invoices, setInvoices] = useState(demo.invoices)
  const [maintenanceTickets, setMaintenanceTickets] = useState([])
  const [salaryMeta, setSalaryMeta] = useState({})
  const [settings, setSettings] = useState(defaultSettings)
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message) => {
    const id = ++toastSeq
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  const isLowStock = useCallback(
    (m) => m.stock <= m.reorderLevel * (1 + settings.lowStockBuffer / 100),
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
    setMaintenanceTickets([])
    setSalaryMeta({})
    setSettings(defaultSettings)
    return defaultSettings
  }, [])

  const value = useMemo(
    () => ({
      orders, setOrders, materials, setMaterials, machines, setMachines, batches, setBatches,
      inspections, setInspections, finishedGoods, setFinishedGoods, dispatches, setDispatches,
      workers, setWorkers, invoices, setInvoices, maintenanceTickets, setMaintenanceTickets, salaryMeta, setSalaryMeta, settings, setSettings,
      isLowStock, toasts, notify, resetDemoData,
    }),
    [orders, materials, machines, batches, inspections, finishedGoods, dispatches, workers, invoices, maintenanceTickets, salaryMeta, settings, isLowStock, toasts, notify, resetDemoData],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
