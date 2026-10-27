import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Users' },
  { to: '/networks', label: 'Networks' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/consent', label: 'Consent' },
  { to: '/audit-log', label: 'Audit log' },
  { to: '/system-health', label: 'System health' },
  { to: '/admins', label: 'Admins' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, session } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-5">
          <p className="text-lg font-bold text-slate-900">ADLr Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="truncate text-xs text-slate-400">{session?.user.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-800"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
