import type { ReactNode } from 'react'

type DetailFieldProps = {
  label: string
  children: ReactNode
}

export function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div>
      <span className="font-medium text-muted-foreground">{label}:</span>{' '}
      {children}
    </div>
  )
}
