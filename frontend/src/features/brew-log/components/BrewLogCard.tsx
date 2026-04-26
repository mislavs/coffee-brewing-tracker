import { Repeat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { BrewLogSummaryDto } from '@/lib/api/schemas'
import { formatDateTime } from '@/lib/date'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getRatingDisplay } from '@/features/brew-log/formatters'

type BrewLogCardProps = {
  brewLog: BrewLogSummaryDto
}

const weightFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

function formatWeight(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return '—'
  }

  return `${weightFormatter.format(value)} g`
}

export function BrewLogCard({ brewLog }: BrewLogCardProps) {
  const beanName = brewLog.beanName ?? 'Unnamed bean'
  const roasterName = brewLog.roasterName?.trim()
  const beanDisplayName = roasterName ? `${beanName} (${roasterName})` : beanName
  const brewerName = brewLog.brewerName || '—'
  const recipeName = brewLog.recipeName?.trim() || '—'
  const brewerAndRecipe = `${brewerName} / ${recipeName}`
  const doseAndWater = `${formatWeight(brewLog.dose)} / ${formatWeight(brewLog.waterAmount)}`
  const grinderAndSetting =
    brewLog.grindSize != null
      ? `${brewLog.grinderName ?? '—'} (${brewLog.grindSize})`
      : (brewLog.grinderName ?? '—')

  return (
    <Card className="card-interactive h-full gap-3 py-3">
      <CardHeader className="px-4 pt-1.5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="break-words text-base leading-snug">
              {brewLog.id ? (
                <Link
                  to={`/brew-log/${brewLog.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {beanDisplayName}
                </Link>
              ) : (
                beanDisplayName
              )}
            </CardTitle>
            <p className="text-xs leading-none text-muted-foreground">
              {formatDateTime(brewLog.brewedAt)}
            </p>
          </div>
          {brewLog.id ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="rounded-lg" asChild>
                    <Link
                      to={`/brew-log/new?repeatFrom=${brewLog.id}`}
                      aria-label={`Repeat brew for ${beanDisplayName}`}
                    >
                      <Repeat className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Repeat brew</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Brewer / Recipe</dt>
          <dd className="min-w-0 break-words font-medium text-foreground">{brewerAndRecipe}</dd>

          <dt className="text-muted-foreground">Bean / Water</dt>
          <dd className="min-w-0 break-words font-medium text-foreground">{doseAndWater}</dd>

          <dt className="text-muted-foreground">Grinder</dt>
          <dd className="min-w-0 break-words font-medium text-foreground">{grinderAndSetting}</dd>

          <dt className="text-muted-foreground">Rating</dt>
          <dd className="min-w-0 break-words font-medium text-foreground">
            {getRatingDisplay(brewLog.rating)}
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}
