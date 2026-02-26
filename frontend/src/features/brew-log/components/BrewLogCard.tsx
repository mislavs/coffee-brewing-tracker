import { Link } from 'react-router-dom'
import type { BrewLogSummaryDto } from '@/lib/api/schemas'
import { formatDateTime } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatBrewTime, getRatingDisplay } from '@/features/brew-log/formatters'

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
  const doseAndWater = `${formatWeight(brewLog.dose)} / ${formatWeight(brewLog.waterAmount)}`
  const grinderAndSetting =
    brewLog.grindSize && brewLog.grindSize.trim().length > 0
      ? `${brewLog.grinderName ?? '—'} (${brewLog.grindSize})`
      : (brewLog.grinderName ?? '—')

  return (
    <Card className="h-full py-4">
      <CardHeader className="space-y-1 px-3 pt-2.5 pb-0.5">
        <Badge variant="secondary" className="w-fit">
          {formatDateTime(brewLog.brewedAt)}
        </Badge>
        <CardTitle className="text-base leading-none">
          {brewLog.id ? (
            <Link to={`/brew-log/${brewLog.id}`} className="hover:underline">
              {beanDisplayName}
            </Link>
          ) : (
            beanDisplayName
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <div className="rounded-md border bg-muted/20 px-2.5 py-1">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Brewer:</dt>
            <dd className="font-medium text-foreground">{brewerName}</dd>

            <dt className="text-muted-foreground">Recipe:</dt>
            <dd className="font-medium text-foreground">{recipeName}</dd>

            <dt className="text-muted-foreground">Bean / Water:</dt>
            <dd className="font-medium text-foreground">{doseAndWater}</dd>

            <dt className="text-muted-foreground">Grinder:</dt>
            <dd className="font-medium text-foreground">{grinderAndSetting}</dd>

            <dt className="text-muted-foreground">Time:</dt>
            <dd className="font-medium text-foreground">{formatBrewTime(brewLog.brewTimeSeconds)}</dd>

            <dt className="text-muted-foreground">Rating:</dt>
            <dd className="font-medium text-foreground">{getRatingDisplay(brewLog.rating)}</dd>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}
