import { Link } from 'react-router-dom'
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
  formatDecimal,
  formatPricePerKg,
  formatRoastProfile,
} from '@/features/beans/formatters'

type BeanCardProps = {
  bean: BeanSummaryDto
}

function getRoastToneClass(roastProfile: number | null | undefined) {
  switch (roastProfile) {
    case 0:
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case 1:
      return 'border-stone-300 bg-stone-200 text-stone-900'
    case 2:
      return 'border-orange-200 bg-orange-100 text-orange-900'
    default:
      return 'border-muted bg-muted/40 text-muted-foreground'
  }
}

export function BeanCard({ bean }: BeanCardProps) {
  const name = bean.name ?? 'Unnamed bean'
  const roasterName = bean.roasterName || '—'
  const roastProfileLabel = formatRoastProfile(bean.roastProfile)
  const isLowStock = Boolean(
    bean.bagWeight &&
      bean.remainingQuantity !== null &&
      bean.remainingQuantity !== undefined &&
      bean.remainingQuantity / bean.bagWeight < 0.2,
  )

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div
          className={`flex h-28 w-full items-center justify-center rounded-md border text-sm font-medium ${getRoastToneClass(bean.roastProfile)}`}
        >
          {roastProfileLabel}
        </div>
        <div>
          <CardTitle className="text-base">
            {bean.id ? (
              <Link to={`/beans/${bean.id}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription>{roasterName}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="secondary">{roastProfileLabel}</Badge>
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
