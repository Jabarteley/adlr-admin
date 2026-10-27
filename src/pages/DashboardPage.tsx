import { useEffect, useState } from 'react'
import { Users, UserPlus, Share2, ListChecks, CheckCircle2, AlertTriangle, Clock, Send, Bell } from 'lucide-react'
import { api } from '../lib/api'
import { StatCard } from '../components/StatCard'
import { PageHeader } from '../components/PageHeader'

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

  if (error) return <p className="text-sm text-adlr-danger">{error}</p>

  if (!stats) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="System overview, refreshed on load." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-adlr-border bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  const pushCoverage =
    stats.users.total > 0 ? Math.round((stats.push_notifications.users_with_tokens / stats.users.total) * 100) : 0

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="System overview, refreshed on load." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total users" value={stats.users.total} hint={`+${stats.users.today} today`} />
        <StatCard icon={UserPlus} label="New this week" value={stats.users.this_week} tone="success" />
        <StatCard icon={Share2} label="Networks" value={stats.networks.total} />
        <StatCard icon={ListChecks} label="Tasks created today" value={stats.tasks.created_today} />
        <StatCard icon={CheckCircle2} label="Tasks completed today" value={stats.tasks.completed_today} tone="success" />
        <StatCard
          icon={AlertTriangle}
          label="Open alerts"
          value={stats.alerts.open}
          tone={stats.alerts.open > 0 ? 'danger' : 'success'}
        />
        <StatCard
          icon={Clock}
          label="Pending deletions"
          value={stats.account_deletions.pending}
          tone={stats.account_deletions.pending > 0 ? 'warning' : 'success'}
        />
        <StatCard icon={Send} label="Pending invites" value={stats.invites.pending} />
        <StatCard
          icon={Bell}
          label="Push notification coverage"
          value={`${pushCoverage}%`}
          hint={`${stats.push_notifications.users_with_tokens} of ${stats.push_notifications.users_total} users have a token`}
          tone={pushCoverage >= 50 ? 'success' : 'warning'}
        />
      </div>
    </div>
  )
}
