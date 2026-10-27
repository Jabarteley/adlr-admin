import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'purple',
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'purple' | 'success' | 'warning' | 'danger'
}) {
  const toneClass = {
    purple: 'bg-adlr-purple-light text-adlr-purple-deep',
    success: 'bg-adlr-success-light text-adlr-success',
    warning: 'bg-adlr-warning-light text-adlr-warning',
    danger: 'bg-adlr-danger-light text-adlr-danger',
  }[tone]

  return (
    <div className="rounded-2xl border border-adlr-border bg-white p-5 shadow-sm shadow-slate-100/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-adlr-muted">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon size={16} strokeWidth={2.25} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-adlr-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-adlr-muted">{hint}</p>}
    </div>
  )
}
