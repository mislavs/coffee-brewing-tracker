import type { ReactNode } from 'react'

type SectionDividerProps = {
  label: string
  suffix?: ReactNode
}

export function SectionDivider({ label, suffix }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-border" />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {suffix}
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
