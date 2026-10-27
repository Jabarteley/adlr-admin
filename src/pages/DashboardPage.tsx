import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { StatCard } from '../components/StatCard'

type DashboardStats = {
  users: { total: number; today: number; this_week: number }
  networks: { total: number }
  tasks: { created_today: number; completed_today: number }
  alerts: { open: number }
  account_deletions: { pending: number }
  push_notifications: { users_with_tokens: number; users_total: number }
  invites: { pending: number }
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ data: DashboardStats }>('/admin/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!stats) return <p className="text-sm text-slate-500">Loading…</p>

  const pushCoverage =
    stats.users.total > 0 ? Math.round((stats.push_notifications.users_with_tokens / stats.users.total) * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">System overview, refreshed on load.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={stats.users.total} hint={`+${stats.users.today} today`} />
        <StatCard label="New this week" value={stats.users.this_week} />
        <StatCard label="Networks" value={stats.networks.total} />
        <StatCard label="Tasks created today" value={stats.tasks.created_today} />
        <StatCard label="Tasks completed today" value={stats.tasks.completed_today} />
        <StatCard label="Open alerts" value={stats.alerts.open} />
        <StatCard label="Pending deletions" value={stats.account_deletions.pending} />
        <StatCard label="Pending invites" value={stats.invites.pending} />
        <StatCard
          label="Push notification coverage"
          value={`${pushCoverage}%`}
          hint={`${stats.push_notifications.users_with_tokens} of ${stats.push_notifications.users_total} users have a token`}
        />
      </div>
    </div>
  )
}
