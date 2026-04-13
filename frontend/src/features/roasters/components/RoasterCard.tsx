import { Link } from 'react-router-dom'
import type { RoasterSummaryDto } from '@/lib/api/schemas'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatPricePerKg,
  getInitials,
  resolveRoasterLogoUrl,
} from '@/features/roasters/roasterPresentation'

type RoasterCardProps = {
  roaster: RoasterSummaryDto
}

export function RoasterCard({ roaster }: RoasterCardProps) {
  const logoUrl = resolveRoasterLogoUrl(roaster.logoUrl)
  const name = roaster.name ?? 'Unnamed roaster'
  const city = roaster.city || '—'
  const country = roaster.countryName || '—'
  const websiteUrl = roaster.websiteUrl || null
  const beanCount = roaster.beanCount ?? 0

  return (
    <Card className="card-interactive h-full">
      <CardHeader className="space-y-3">
        <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-muted/20 to-muted/40">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain p-2" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-muted-foreground/70">
              {getInitials(name)}
            </span>
          )}
        </div>
        <div>
          <CardTitle className="text-base">
            {roaster.id ? (
              <Link
                to={`/roasters/${roaster.id}`}
                className="transition-colors hover:text-primary"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription className="mt-0.5">
            {city} · {country}
          </CardDescription>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-sm text-primary hover:underline"
            >
              {websiteUrl}
            </a>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{beanCount} beans</Badge>
        <Badge variant="outline">{formatPricePerKg(roaster.avgPricePerKg)}</Badge>
      </CardContent>
    </Card>
  )
}
