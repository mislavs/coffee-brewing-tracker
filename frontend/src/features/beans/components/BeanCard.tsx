import { Repeat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { BeanSummaryDto } from '@/lib/api/schemas'
import { Badge } from '@/components/ui/badge'
import {
  Card,
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
import {
  getBeanInitials,
  resolveBeanImageUrl,
} from '@/features/beans/beanPresentation'
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
  const imageUrl = resolveBeanImageUrl(bean.imageUrl)
  const initials = getBeanInitials(bean.name)
  const roastAge = formatAgeInDays(bean.roastDate)
  const isLowStock = Boolean(
    bean.bagWeight &&
      bean.remainingQuantity !== null &&
      bean.remainingQuantity !== undefined &&
      bean.remainingQuantity / bean.bagWeight < 0.2,
  )

  return (
    <Card className="card-interactive h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="relative shrink-0">
          <div
            className={
              imageUrl
                ? 'flex aspect-[3/4] w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/20'
                : `flex aspect-[3/4] w-24 items-center justify-center rounded-lg border text-xl font-semibold ${getRoastToneClass(bean.roastProfile)}`
            }
          >
            {imageUrl ? (
              <img src={imageUrl} alt={`${name} bean`} className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          {bean.id ? (
            <div className="absolute top-1 right-1">
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
        <div className="flex min-w-0 flex-1 flex-col gap-2">
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
          <div className="flex flex-wrap gap-1.5">
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
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
