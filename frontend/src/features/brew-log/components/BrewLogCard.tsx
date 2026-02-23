import { Link } from 'react-router-dom'
import type { BrewLogSummaryDto } from '@/lib/api/generated/models/index.js'
import { formatDate } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatRatio, getRatingDisplay } from '@/features/brew-log/formatters'

type BrewLogCardProps = {
  brewLog: BrewLogSummaryDto
}

export function BrewLogCard({ brewLog }: BrewLogCardProps) {
  const beanName = brewLog.beanName ?? 'Unnamed bean'
  const brewerName = brewLog.brewerName || '—'

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">
          {brewLog.id ? (
            <Link to={`/brew-log/${brewLog.id}`} className="hover:underline">
              {beanName}
            </Link>
          ) : (
            beanName
          )}
        </CardTitle>
        <CardDescription>{brewerName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="secondary">{formatDate(brewLog.brewedAt)}</Badge>
        <Badge variant="outline">Rating: {getRatingDisplay(brewLog.rating)}</Badge>
        <Badge variant="outline">Ratio: {formatRatio(brewLog.brewRatio)}</Badge>
      </CardContent>
    </Card>
  )
}
