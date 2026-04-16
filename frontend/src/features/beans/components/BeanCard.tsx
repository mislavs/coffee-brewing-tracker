import { Repeat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { BeanSummaryDto } from '@/lib/api/schemas'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  formatDecimal,
  formatPricePerKg,
  formatRoastProfile,
} from '@/features/beans/formatters'
import { formatAgeInDays } from '@/lib/date'

type BeanCardProps = {
  bean: BeanSummaryDto
}

function getRoastToneClass(roastProfile: number | null | undefined) {
  switch (roastProfile) {
    case 0:
      return 'border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-900'
    case 1:
      return 'border-stone-300/60 bg-gradient-to-br from-stone-100 to-stone-200/80 text-stone-900'
    case 2:
      return 'border-orange-200/60 bg-gradient-to-br from-orange-50 to-orange-100/80 text-orange-900'
    default:
      return 'border-muted bg-gradient-to-br from-muted/30 to-muted/50 text-muted-foreground'
  }
}

export function BeanCard({ bean }: BeanCardProps) {
  const name = bean.name ?? 'Unnamed bean'
  const roasterName = bean.roasterName || '—'
  const roastProfileLabel = formatRoastProfile(bean.roastProfile)
  const roastAge = formatAgeInDays(bean.roastDate)
  const isLowStock = Boolean(
    bean.bagWeight &&
      bean.remainingQuantity !== null &&
      bean.remainingQuantity !== undefined &&
      bean.remainingQuantity / bean.bagWeight < 0.2,
  )

  return (
    <Card className="card-interactive h-full">
      <CardHeader className="space-y-3">
        <div className="relative">
          <div
            className={`flex h-28 w-full items-center justify-center rounded-lg border text-sm font-semibold ${getRoastToneClass(bean.roastProfile)}`}
          >
            {roastProfileLabel}
          </div>
          {bean.id ? (
            <div className="absolute top-2 right-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="rounded-lg bg-background/80 backdrop-blur-sm" asChild>
                      <Link to={`/beans/new?repeatFrom=${bean.id}`} aria-label={`Repeat bean for ${name}`}>
                        <Repeat className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Repeat bean</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : null}
        </div>
        <div>
          <CardTitle className="text-base">
            {bean.id ? (
              <Link
                to={`/beans/${bean.id}`}
                className="transition-colors hover:text-primary"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription className="mt-0.5">{roasterName}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{roastProfileLabel}</Badge>
        {roastAge ? <Badge variant="outline">{roastAge}</Badge> : null}
        {bean.isAvailable === false ? (
          <Badge variant="outline" className="text-muted-foreground">
            Unavailable
          </Badge>
        ) : null}
        <Badge variant="outline">{formatPricePerKg(bean.pricePerKg)}</Badge>
        <Badge
          variant="outline"
          className={isLowStock ? 'border-destructive/40 text-destructive' : undefined}
        >
          Remaining: {formatDecimal(bean.remainingQuantity)} g
        </Badge>
      </CardContent>
    </Card>
  )
}
