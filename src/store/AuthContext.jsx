import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { workers } from '../data/demoData'

const STORAGE_KEY = 'loomflow-user'
const VALID_ROLES = ['Super Admin', 'Admin', 'Staff']

const DEFAULT_USER = { name: 'Plant Manager', role: 'Admin', workerId: null }

const demoUsers = [
  { name: 'Owner', role: 'Super Admin', workerId: null },
  { name: 'Plant Manager', role: 'Admin', workerId: null },
  ...workers.map((w) => ({ name: w.name, role: 'Staff', workerId: w.id })),
]

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw)
    if (!u || typeof u.name !== 'string' || !u.name) return null
    if (!VALID_ROLES.includes(u.role)) return null
    return { name: u.name, role: u.role, workerId: u.workerId ?? null }
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser() ?? DEFAULT_USER)

  const setCurrentUser = useCallback((next) => {
    const clean = { name: next.name, role: next.role, workerId: next.workerId ?? null }
    setUser(clean)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    } catch {
      // private mode etc. — session-only user
    }
  }, [])

  const isAdmin = user.role === 'Super Admin' || user.role === 'Admin'

  const canOperate = useCallback(
    (machine) => isAdmin || (user.role === 'Staff' && user.name === machine.operator),
    [user, isAdmin],
  )

  const canReportIssue = useCallback(
    (machine) => isAdmin || (user.role === 'Staff' && user.name === machine.operator),
    [user, isAdmin],
  )

  const canManageMaintenance = isAdmin

  const value = useMemo(
    () => ({
      user,
      users: demoUsers,
      isAdmin,
      canOperate,
      canReportIssue,
      canManageMaintenance,
      login: setCurrentUser,
      switchUser: setCurrentUser,
    }),
    [user, isAdmin, canOperate, canReportIssue, canManageMaintenance, setCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
