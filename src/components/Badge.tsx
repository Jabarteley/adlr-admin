import type { ReactNode } from 'react'

type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'purple'

const STYLES: Record<Variant, string> = {
  success: 'bg-adlr-success-light text-adlr-success',
  warning: 'bg-adlr-warning-light text-adlr-warning',
  danger: 'bg-adlr-danger-light text-adlr-danger',
  neutral: 'bg-slate-100 text-slate-600',
  purple: 'bg-adlr-purple-light text-adlr-purple-deep',
}

export function Badge({ variant = 'neutral', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[variant]}`}>
      {children}
    </span>
  )
}
