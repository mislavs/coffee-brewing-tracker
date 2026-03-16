import { Coffee } from 'lucide-react'
import type { Guid } from '@/lib/api-types'
import { Link, Navigate } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { BrewLogCardSkeleton } from '@/components/skeletons/BrewLogCardSkeleton'
import { DetailField } from '@/components/DetailField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'
import { useEntityFormId } from '@/lib/useEntityFormId'

function BeanDetailContent({ beanId }: { beanId: Guid }) {
  const { data: bean } = useBean(beanId)
  const { data: brewLogsPage, isPending: isBrewLogsPending } = useBrewLogs(
    undefined,
    undefined,
    undefined,
    true,
    beanId,
    1,
    100,
  )
  const brewLogs = brewLogsPage?.items ?? []
  const bagWeight = bean.bagWeight ?? 0
  const remainingQuantity = bean.remainingQuantity ?? bagWeight
  const clampedRemainingQuantity = Math.max(remainingQuantity, 0)
  const isLowStock = bagWeight > 0 && clampedRemainingQuantity / bagWeight < 0.2
  const remainingPercentage = bagWeight > 0
    ? Math.min(100, (clampedRemainingQuantity / bagWeight) * 100)
    : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardAction className="flex items-center gap-2">
            <Button asChild>
              <Link to={`/beans/${beanId}/edit`}>Edit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/beans/new?repeatFrom=${beanId}`}>Repeat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/beans">Back</Link>
            </Button>
          </CardAction>
          <CardTitle>{bean.name ?? 'Unnamed bean'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Origin
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-3">
                  <DetailField label="Roaster" stacked>
                    {bean.roasterId ? (
                      <Link to={`/roasters/${bean.roasterId}`} className="hover:underline">
                        {bean.roasterName ?? 'Unnamed roaster'}
                      </Link>
                    ) : (
                      (bean.roasterName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Origin Type" stacked>
                    {formatOriginType(bean.originType)}
                  </DetailField>
                  <DetailField label="Origin Countries" stacked>
                    {bean.originCountries && bean.originCountries.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {bean.originCountries
                          .map((country) => {
                            const countryName = country.name?.trim()
                            if (!countryName) {
                              return null
                            }

                            return (
                              <Badge
                                key={country.id ?? countryName}
                                variant="secondary"
                              >
                                {countryName}
                              </Badge>
                            )
                          })
                          .filter(Boolean)}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No origin countries set.</p>
                    )}
                  </DetailField>
                  <DetailField label="Variety" stacked>
                    {bean.variety || '—'}
                  </DetailField>
                  <DetailField label="Processing Method" stacked>
                    {bean.processingMethod || '—'}
                  </DetailField>
                  <DetailField label="Altitude" stacked>
                    {bean.altitude ?? '—'}
                    {bean.altitude ? ' m' : ''}
                  </DetailField>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Roast & Purchase
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-3">
                  <DetailField label="Roast Profile" stacked>
                    {formatRoastProfile(bean.roastProfile)}
                  </DetailField>
                  <DetailField label="Roast Date" stacked>
                    {formatRoastDate(bean.roastDate)}
                  </DetailField>
                  <DetailField label="Bag Weight" stacked>
                    {bean.bagWeight ?? '—'}
                    {bean.bagWeight ? ' g' : ''}
                  </DetailField>
                  <DetailField label="Price" stacked>
                    {formatPrice(bean.price)}
                  </DetailField>
                  <DetailField label="Price / kg" stacked>
                    {formatPricePerKg(bean.pricePerKg)}
                  </DetailField>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Stock
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  <p className={isLowStock ? 'font-medium text-destructive' : 'font-medium'}>
                    {formatDecimal(clampedRemainingQuantity)} g / {formatDecimal(bean.bagWeight)} g
                  </p>
                  <Progress value={remainingPercentage} />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Tasting
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
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
              </section>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brew History</CardTitle>
          <CardDescription>All brews you have logged with this bean.</CardDescription>
        </CardHeader>
        <CardContent>
          {isBrewLogsPending && brewLogs.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <BrewLogCardSkeleton key={`bean-brew-history-skeleton-${index}`} />
              ))}
            </div>
          ) : brewLogs.length === 0 ? (
            <EmptyState
              icon={<Coffee className="size-6" />}
              title="No brews logged for this bean yet"
              description="Once you log brews with this bean, they will appear here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {brewLogs.map((brewLog) => (
                <BrewLogCard
                  key={brewLog.id ?? `${brewLog.beanName ?? 'brew'}-${brewLog.brewedAt ?? ''}`}
                  brewLog={brewLog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function BeanDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/beans" replace />
  }

  return <BeanDetailContent beanId={entityId.id} />
}
