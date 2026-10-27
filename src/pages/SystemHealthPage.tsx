import { useEffect, useState } from 'react'
import { Database, Sparkles, Mail, Image, Bug, RefreshCw, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'

type CheckResult = { ok: boolean; detail?: string; latency_ms?: number }

type SystemHealth = {
  supabase: CheckResult
  openai: CheckResult
  resend: CheckResult
  cloudinary: CheckResult
  sentry: CheckResult
}

const SERVICES: { key: keyof SystemHealth; label: string; icon: LucideIcon }[] = [
  { key: 'supabase', label: 'Supabase (database)', icon: Database },
  { key: 'openai', label: 'OpenAI (AI routines)', icon: Sparkles },
  { key: 'resend', label: 'Resend (email)', icon: Mail },
  { key: 'cloudinary', label: 'Cloudinary (photo uploads)', icon: Image },
  { key: 'sentry', label: 'Sentry (error monitoring)', icon: Bug },
]

export function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get<{ data: SystemHealth }>('/admin/system/health')
      .then((res) => setHealth(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div>
      <PageHeader
        title="System health"
        subtitle="Live checks against each external service."
        action={
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-adlr-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recheck
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {health
          ? SERVICES.map(({ key, label, icon: Icon }) => {
              const result = health[key]
              return (
                <div key={key} className="rounded-2xl border border-adlr-border bg-white p-5 shadow-sm shadow-slate-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon size={16} />
                      </div>
                      <p className="text-sm font-semibold text-adlr-text">{label}</p>
                    </div>
                    {result.ok ? (
                      <CheckCircle2 size={20} className="text-adlr-success" />
                    ) : (
                      <XCircle size={20} className="text-adlr-danger" />
                    )}
                  </div>
                  <p className={`mt-3 text-sm font-semibold ${result.ok ? 'text-adlr-success' : 'text-adlr-danger'}`}>
                    {result.ok ? 'Healthy' : 'Issue detected'}
                  </p>
                  {result.detail && <p className="mt-1 text-xs text-adlr-muted">{result.detail}</p>}
                  {result.latency_ms !== undefined && (
                    <p className="mt-1 text-xs text-slate-400">{result.latency_ms}ms</p>
                  )}
                </div>
              )
            })
          : Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-adlr-border bg-slate-100" />
            ))}
      </div>
    </div>
  )
}
