import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  back?: ReactNode
}) {
  return (
    <div className="mb-6">
      {back}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-adlr-text">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-adlr-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
