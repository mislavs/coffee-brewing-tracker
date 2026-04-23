import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actions?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  actions,
}: EmptyStateProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center gap-4 py-8 text-center sm:py-16">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : actionLabel && actionHref ? (
        <Button asChild className="mt-2">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}
