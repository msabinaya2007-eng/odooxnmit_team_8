/**
 * Single permissions file for the whole app.
 * can(user, action, target) is the only check pages use.
 * A user is { name, role, workerId, department } or null when logged out.
 * Salary rows are filtered with these checks BEFORE rendering, so a row a
 * user may not see is never in the DOM, never exported and never reported.
 */
export function can(user, action, target) {
  if (!user || !user.role) return false
  const role = user.role
  const isAdmin = role === 'Super Admin' || role === 'Admin'

  switch (action) {
    case 'page.open':
      if (target === 'settings') return role === 'Super Admin'
      if (target === 'finance') return isAdmin
      if (target === 'salary') return role === 'Staff'
      return true

    case 'orders.edit':
      return isAdmin

    case 'inventory.edit':
      return isAdmin || (role === 'Staff' && user.department === 'Stores')

    case 'production.operate':
    case 'production.report':
      return isAdmin || (role === 'Staff' && !!target && user.name === target.operator)

    case 'production.maintain':
    case 'production.advance':
      return isAdmin

    case 'quality.edit':
      return isAdmin || (role === 'Staff' && user.department === 'Quality')

    case 'finishedgoods.edit':
      return isAdmin

    case 'attendance.mark':
      return isAdmin

    case 'finance.edit':
      return role === 'Super Admin'

    case 'settings.edit':
      return role === 'Super Admin'

    case 'workers.add':
      // target is the accountRole being created ('Admin' or 'Staff')
      if (role === 'Super Admin') return true
      return role === 'Admin' && target === 'Staff'

    case 'salary.view':
      if (!target) return false
      if (role === 'Super Admin') return true
      if (role === 'Admin') return target.id === user.workerId || target.accountRole !== 'Admin'
      return target.id === user.workerId

    case 'salary.edit':
      if (!target) return false
      if (role === 'Super Admin') return true
      return role === 'Admin' && target.accountRole === 'Staff'

    default:
      return false
  }
}
