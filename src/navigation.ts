import { Boxes, ClipboardList, Factory, IndianRupee, LayoutDashboard, PackageCheck, Settings, ShieldCheck, Truck, Users, type LucideIcon } from 'lucide-react'

export type PageId =
  | 'dashboard' | 'orders' | 'inventory' | 'production' | 'quality'
  | 'finished-goods' | 'dispatch' | 'workers' | 'finance' | 'settings'

export interface NavItem {
  id: PageId
  label: string
  icon: LucideIcon
  section: 'Overview' | 'Operations' | 'People & Money' | 'System'
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'orders', label: 'Orders', icon: ClipboardList, section: 'Operations' },
  { id: 'inventory', label: 'Raw Material Inventory', icon: Boxes, section: 'Operations' },
  { id: 'production', label: 'Production Floor', icon: Factory, section: 'Operations' },
  { id: 'quality', label: 'Quality Control', icon: ShieldCheck, section: 'Operations' },
  { id: 'finished-goods', label: 'Finished Goods', icon: PackageCheck, section: 'Operations' },
  { id: 'dispatch', label: 'Dispatch', icon: Truck, section: 'Operations' },
  { id: 'workers', label: 'Workers & Attendance', icon: Users, section: 'People & Money' },
  { id: 'finance', label: 'Finance & Reports', icon: IndianRupee, section: 'People & Money' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'System' },
]

export const isPageId = (v: string): v is PageId => navItems.some((n) => n.id === v)

export interface PageProps {
  onNavigate: (id: PageId) => void
}
