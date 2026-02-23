import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  formatDecimal,
  formatOriginType,
  formatPricePerKg,
  formatRoastDate,
  formatRoastProfile,
} from '@/features/beans/formatters'
import { useBean } from '@/features/beans/hooks/useBean'
import { tryParseGuid } from '@/lib/guid'

function BeanDetailContent({ beanId }: { beanId: Guid }) {
  const { data: bean } = useBean(beanId)
  const bagWeight = bean.bagWeight ?? 0
  const remainingQuantity = bean.remainingQuantity ?? bagWeight
  const clampedRemainingQuantity = Math.max(remainingQuantity, 0)
  const isLowStock = bagWeight > 0 && clampedRemainingQuantity / bagWeight < 0.2
  const remainingPercentage = bagWeight > 0
    ? Math.min(100, (clampedRemainingQuantity / bagWeight) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bean.name ?? 'Unnamed bean'}</CardTitle>
        <CardDescription>Bean details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="font-medium">Roaster:</span>{' '}
            {bean.roasterId ? (
              <Link to={`/roasters/${bean.roasterId}`} className="hover:underline">
                {bean.roasterName ?? 'Unnamed roaster'}
              </Link>
            ) : (
              (bean.roasterName ?? '—')
            )}
          </div>
          <div>
            <span className="font-medium">Origin Type:</span>{' '}
            {formatOriginType(bean.originType)}
          </div>
          <div>
            <span className="font-medium">Roast Profile:</span>{' '}
            {formatRoastProfile(bean.roastProfile)}
          </div>
          <div>
            <span className="font-medium">Bag Weight:</span>{' '}
            {bean.bagWeight ?? '—'}
            {bean.bagWeight ? ' g' : ''}
          </div>
          <div>
            <span className="font-medium">Price:</span> {formatDecimal(bean.price)}
          </div>
          <div>
            <span className="font-medium">Price / kg:</span>{' '}
            {formatPricePerKg(bean.pricePerKg)}
          </div>
          <div>
            <span className="font-medium">Roast Date:</span>{' '}
            {formatRoastDate(bean.roastDate)}
          </div>
          <div>
            <span className="font-medium">Altitude:</span>{' '}
            {bean.altitude ?? '—'}
            {bean.altitude ? ' m' : ''}
          </div>
        </div>

        <div>
          <span className="font-medium">Variety:</span> {bean.variety || '—'}
        </div>
        <div>
          <span className="font-medium">Processing Method:</span>{' '}
          {bean.processingMethod || '—'}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Remaining Quantity</p>
          <p className={isLowStock ? 'font-medium text-destructive' : 'text-muted-foreground'}>
            {formatDecimal(clampedRemainingQuantity)} g / {formatDecimal(bean.bagWeight)} g
          </p>
          <Progress value={remainingPercentage} />
        </div>

        <div className="space-y-2">
          <p className="font-medium">Origin Countries</p>
          {bean.originCountries && bean.originCountries.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {bean.originCountries.map((country) => (
                <Badge key={country} variant="secondary">
                  {country}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No origin countries set.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Flavor Notes</p>
          {bean.flavorNotes && bean.flavorNotes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {bean.flavorNotes
                .map((flavorNote) => flavorNote.name?.trim())
                .filter((name): name is string => Boolean(name))
                .map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No flavor notes set.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/beans/${beanId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/beans">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function BeanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const beanId = tryParseGuid(id)

  if (!beanId) {
    return <Navigate to="/beans" replace />
  }

  return <BeanDetailContent beanId={beanId} />
}
