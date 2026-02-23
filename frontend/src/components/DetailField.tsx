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
        <p className="font-medium text-muted-foreground">{label}</p>
        {children}
      </div>
    )
  }

  return (
    <div>
      <span className="font-medium text-muted-foreground">{label}:</span>{' '}
      {children}
    </div>
  )
}
