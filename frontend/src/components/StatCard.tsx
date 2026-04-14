import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  subtitle?: string
  icon?: ReactNode
}

export function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-xl font-bold tracking-tight">{value}</p>
            {subtitle ? (
              <p className="text-muted-foreground text-[11px]">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
    </div>
  )
}
