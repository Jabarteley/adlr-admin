import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Share2,
  AlertTriangle,
  ShieldCheck,
  ScrollText,
  Activity,
  UserCog,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/networks', label: 'Networks', icon: Share2 },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/consent', label: 'Consent', icon: ShieldCheck },
  { to: '/audit-log', label: 'Audit log', icon: ScrollText },
  { to: '/system-health', label: 'System health', icon: Activity },
  { to: '/admins', label: 'Admins', icon: UserCog },
]

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, session } = useAuth()
  const email = session?.user.email || ''

  return (
    <div className="flex min-h-screen bg-adlr-bg">
      <aside className="flex w-60 shrink-0 flex-col border-r border-adlr-border bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-adlr-purple to-adlr-purple-deep text-sm font-extrabold text-white">
            T
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight text-adlr-text">Tuora</p>
            <p className="text-[11px] font-medium leading-tight text-adlr-muted">Admin</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-adlr-purple-light text-adlr-purple-deep'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-adlr-border px-4 py-4">
          <Avatar name={email} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-700">{email}</p>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
