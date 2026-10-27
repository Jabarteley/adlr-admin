import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type CheckResult = { ok: boolean; detail?: string; latency_ms?: number }

type SystemHealth = {
  supabase: CheckResult
  openai: CheckResult
  resend: CheckResult
  cloudinary: CheckResult
  sentry: CheckResult
}

const LABELS: Record<keyof SystemHealth, string> = {
  supabase: 'Supabase (database)',
  openai: 'OpenAI (AI routines)',
  resend: 'Resend (email)',
  cloudinary: 'Cloudinary (photo uploads)',
  sentry: 'Sentry (error monitoring)',
}

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System health</h1>
          <p className="mt-1 text-sm text-slate-500">Live checks against each external service.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Recheck'}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {health &&
          (Object.keys(LABELS) as (keyof SystemHealth)[]).map((key) => {
            const result = health[key]
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{LABELS[key]}</p>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${result.ok ? 'bg-emerald-500' : 'bg-red-500'}`}
                    title={result.ok ? 'Healthy' : 'Issue detected'}
                  />
                </div>
                <p className={`mt-2 text-sm font-semibold ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.ok ? 'Healthy' : 'Issue'}
                </p>
                {result.detail && <p className="mt-1 text-xs text-slate-500">{result.detail}</p>}
                {result.latency_ms !== undefined && (
                  <p className="mt-1 text-xs text-slate-400">{result.latency_ms}ms</p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
