import type { ReactNode } from 'react'

type DetailFieldProps = {
  label: string
  children: ReactNode
  stacked?: boolean
}

export function DetailField({ label, children, stacked = false }: DetailFieldProps) {
  if (stacked) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="text-sm">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
