import { Link } from 'react-router-dom'
import type { RoasterSummaryDto } from '@/lib/api/generated/models/index.js'
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
  const country = roaster.country || '—'
  const beanCount = roaster.beanCount ?? 0

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="bg-muted/30 flex h-28 w-full items-center justify-center overflow-hidden rounded-md border">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain" />
          ) : (
            <span className="text-muted-foreground text-xl font-semibold">
              {getInitials(name)}
            </span>
          )}
        </div>
        <div>
          <CardTitle className="text-base">
            {roaster.id ? (
              <Link to={`/roasters/${roaster.id}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription>
            {city} • {country}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="secondary">{beanCount} beans</Badge>
        <Badge variant="outline">{formatPricePerKg(roaster.avgPricePerKg)}</Badge>
      </CardContent>
    </Card>
  )
}
