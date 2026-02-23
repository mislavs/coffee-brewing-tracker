import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
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
  formatPrice,
  formatPricePerKg,
  formatRoastDate,
  formatRoastProfile,
} from '@/features/beans/formatters'
import { useBean } from '@/features/beans/hooks/useBean'
import { useEntityFormId } from '@/lib/useEntityFormId'

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
      <CardContent className="space-y-2 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <DetailField label="Roaster">
            {bean.roasterId ? (
              <Link to={`/roasters/${bean.roasterId}`} className="hover:underline">
                {bean.roasterName ?? 'Unnamed roaster'}
              </Link>
            ) : (
              (bean.roasterName ?? '—')
            )}
          </DetailField>
          <DetailField label="Origin Type">{formatOriginType(bean.originType)}</DetailField>
          <DetailField label="Roast Profile">{formatRoastProfile(bean.roastProfile)}</DetailField>
          <DetailField label="Bag Weight">
            {bean.bagWeight ?? '—'}
            {bean.bagWeight ? ' g' : ''}
          </DetailField>
          <DetailField label="Price">{formatPrice(bean.price)}</DetailField>
          <DetailField label="Price / kg">{formatPricePerKg(bean.pricePerKg)}</DetailField>
          <DetailField label="Roast Date">{formatRoastDate(bean.roastDate)}</DetailField>
          <DetailField label="Altitude">
            {bean.altitude ?? '—'}
            {bean.altitude ? ' m' : ''}
          </DetailField>
        </div>

        <DetailField label="Variety">{bean.variety || '—'}</DetailField>
        <DetailField label="Processing Method">{bean.processingMethod || '—'}</DetailField>

        <div className="space-y-2">
          <p className="font-medium text-muted-foreground">Remaining Quantity</p>
          <p className={isLowStock ? 'font-medium text-destructive' : 'font-medium'}>
            {formatDecimal(clampedRemainingQuantity)} g / {formatDecimal(bean.bagWeight)} g
          </p>
          <Progress value={remainingPercentage} />
        </div>

        <div className="space-y-2">
          <p className="font-medium text-muted-foreground">Origin Countries</p>
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
          <p className="font-medium text-muted-foreground">Flavor Notes</p>
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
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/beans" replace />
  }

  return <BeanDetailContent beanId={entityId.id} />
}
