import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DetailFieldProps = {
  label: string
  children: ReactNode
  stacked?: boolean
  valueClassName?: string
}

export function DetailField({
  label,
  children,
  stacked = false,
  valueClassName,
}: DetailFieldProps) {
  if (stacked) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className={cn('text-sm', valueClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn('text-sm', valueClassName)}>{children}</span>
    </div>
  )
}
