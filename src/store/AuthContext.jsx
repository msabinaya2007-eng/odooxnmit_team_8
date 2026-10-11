import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useData } from './DataContext'
import { workers as demoWorkers } from '../data/demoData'

const STORAGE_KEY = 'loomflow-user'
const VALID_ROLES = ['Super Admin', 'Admin', 'Staff']

const OWNER = { name: 'Owner', role: 'Super Admin', workerId: null, department: 'Management' }

function toDemoUser(w) {
  return { name: w.name, role: w.accountRole, workerId: w.id, department: w.department }
}

function readStoredUser(liveUsers) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw)
    if (!u || typeof u.name !== 'string' || !u.name) return null
    if (!VALID_ROLES.includes(u.role)) return null
    // Migrate to the live record so department/workerId are always fresh
    return liveUsers.find((x) => x.name === u.name && x.role === u.role) ?? null
  } catch {
    return null
  }
}

function storeUser(u) {
  try {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // private mode etc. — session-only user
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { workers } = useData()
  const users = useMemo(() => [OWNER, ...workers.map(toDemoUser)], [workers])
  const [user, setUser] = useState(() => readStoredUser([OWNER, ...demoWorkers.map(toDemoUser)]))

  const setCurrentUser = useCallback((next) => {
    const clean = next
      ? { name: next.name, role: next.role, workerId: next.workerId ?? null, department: next.department ?? null }
      : null
    setUser(clean)
    storeUser(clean)
  }, [])

  const value = useMemo(
    () => ({
      user,
      users,
      login: setCurrentUser,
      logout: () => setCurrentUser(null),
      switchUser: setCurrentUser,
    }),
    [user, users, setCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
