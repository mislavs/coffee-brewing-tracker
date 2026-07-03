import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FeatureListToolbarProps = {
  heading: string
  headingId: string
  countLabel: string
  activeChips?: string[]
  actions: ReactNode
  controls?: ReactNode
  className?: string
}

export function FeatureListToolbar({
  heading,
  headingId,
  countLabel,
  activeChips = [],
  actions,
  controls,
  className,
}: FeatureListToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 id={headingId} className="sr-only">
          {heading}
        </h1>
        <p className="text-sm font-medium text-foreground">{countLabel}</p>
        {activeChips.length > 0 ? (
          <div
            aria-label="Active filters"
            className="flex min-w-0 flex-wrap items-center gap-1.5"
          >
            {activeChips.map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                className="inline-flex h-7 max-w-48 items-center truncate rounded-md border bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
        {actions}
        {controls}
      </div>
    </div>
  )
}
