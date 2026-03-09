import { Link } from 'react-router-dom'
import type { RecipeSummaryDto } from '@/lib/api/schemas'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type RecipeCardProps = {
  recipe: RecipeSummaryDto
}

function truncateDescription(value: string | null | undefined) {
  if (!value) {
    return '—'
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return '—'
  }

  if (trimmed.length <= 120) {
    return trimmed
  }

  return `${trimmed.slice(0, 117)}...`
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const name = recipe.name ?? 'Unnamed recipe'
  const brewerName = recipe.brewerName || '—'
  const grindStats = (recipe.grindStats ?? []).filter(
    (stat) => Boolean(stat.grinderName?.trim()) && stat.mostCommonGrindSize != null,
  )

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base">
            {recipe.id ? (
              <Link to={`/recipes/${recipe.id}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </CardTitle>
          <CardDescription>{brewerName}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{brewerName}</Badge>
          {grindStats.length > 0 ? (
            grindStats.map((stat, index) => (
              <Badge
                key={stat.grinderId ?? `${stat.grinderName ?? 'grinder'}-${index}`}
                variant="outline"
              >
                {stat.grinderName}: {stat.mostCommonGrindSize}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Common grind: —
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{truncateDescription(recipe.description)}</p>
      </CardContent>
    </Card>
  )
}
