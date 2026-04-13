import type { Guid } from '@/lib/api-types'
import { Link, Navigate } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRoaster } from '@/features/roasters/hooks/useRoaster'
import {
  formatBrewRating,
  formatPricePerKg,
  formatWeightKg,
  getInitials,
  resolveRoasterLogoUrl,
} from '@/features/roasters/roasterPresentation'
import { useEntityFormId } from '@/lib/useEntityFormId'

function RoasterDetailContent({ roasterId }: { roasterId: Guid }) {
  const { data: roaster } = useRoaster(roasterId)
  const logoUrl = resolveRoasterLogoUrl(roaster.logoUrl)
  const name = roaster.name ?? 'Unnamed roaster'
  const beanCount = roaster.beanCount ?? 0

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-muted/20 to-muted/40">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain p-4" />
          ) : (
            <span className="text-4xl font-bold tracking-tight text-muted-foreground/60">
              {getInitials(name)}
            </span>
          )}
        </div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Roaster details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="City" stacked>{roaster.city || '—'}</DetailField>
          <DetailField label="Country" stacked>{roaster.countryName || '—'}</DetailField>
          <DetailField label="Website" stacked>
            {roaster.websiteUrl ? (
              <a
                href={roaster.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all hover:underline"
              >
                {roaster.websiteUrl}
              </a>
            ) : (
              '—'
            )}
          </DetailField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Beans" value={`${beanCount}`} />
          <StatCard
            label="Avg Price per Kg"
            value={formatPricePerKg(roaster.avgPricePerKg)}
          />
          <StatCard
            label="Total Purchased"
            value={formatWeightKg(roaster.totalPurchasedWeightGrams)}
          />
          <StatCard
            label="Top Roast Profile"
            value={roaster.topRoastProfile || 'No data'}
          />
          <StatCard label="Brew Count" value={`${roaster.brewCount ?? 0}`} />
          <StatCard
            label="Avg Brew Rating"
            value={formatBrewRating(roaster.avgBrewRating)}
          />
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Beans
            </p>
            <Badge variant="secondary">{beanCount}</Badge>
            <div className="h-px flex-1 bg-border" />
          </div>
          {roaster.beans && roaster.beans.length > 0 ? (
            <ul className="list-inside list-disc">
              {roaster.beans.map((bean) => (
                <li key={bean.id ?? bean.name ?? 'bean'}>
                  {bean.id ? (
                    <Link to={`/beans/${bean.id}`} className="hover:underline">
                      {bean.name ?? 'Unnamed bean'}
                    </Link>
                  ) : (
                    (bean.name ?? 'Unnamed bean')
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No beans yet.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/roasters/${roasterId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/roasters">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function RoasterDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/roasters" replace />
  }

  return <RoasterDetailContent roasterId={entityId.id} />
}
