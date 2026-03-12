import type { Guid } from '@/lib/api-types'
import { Link, Navigate } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGrinder } from '@/features/equipment/hooks/useGrinder'
import { useEntityFormId } from '@/lib/useEntityFormId'

function GrinderDetailContent({ grinderId }: { grinderId: Guid }) {
  const { data: grinder } = useGrinder(grinderId)
  const recipeStats = grinder.recipeStats ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{grinder.name ?? 'Unnamed grinder'}</CardTitle>
        <CardDescription>Grinder details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <DetailField label="Name">{grinder.name ?? '—'}</DetailField>
        {(grinder.totalBrews ?? 0) > 0 && (
          <div className="space-y-2 pt-2">
            <p className="font-medium text-muted-foreground">Brew Statistics</p>
            <DetailField label="Total Brews">{grinder.totalBrews ?? 0}</DetailField>
            <DetailField label="Total Coffee Ground">
              {grinder.totalCoffeeGround ?? 0}g
            </DetailField>
            <DetailField label="Grind Setting Range">
              {grinder.grindSettingMin != null && grinder.grindSettingMax != null
                ? `${grinder.grindSettingMin} - ${grinder.grindSettingMax}`
                : '—'}
            </DetailField>
          </div>
        )}
        {recipeStats.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="font-medium text-muted-foreground">
              Average grind size per recipe
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recipeStats.map((stat, index) => (
                <Link
                  key={stat.recipeId ?? `${stat.recipeName ?? 'recipe-stat'}-${index}`}
                  to={stat.recipeId ? `/recipes/${stat.recipeId}` : '#'}
                  className={stat.recipeId ? 'block' : undefined}
                >
                  <StatCard
                    label={stat.recipeName ?? 'Unknown recipe'}
                    value={`${
                      stat.averageGrindSize ?? '—'
                    } (${formatBrewCount(stat.brewCount ?? 0)})`}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/equipment/grinders/${grinderId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/equipment?tab=grinders">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function GrinderDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/equipment" replace />
  }

  return <GrinderDetailContent grinderId={entityId.id} />
}

function formatBrewCount(count: number) {
  return `${count} ${count === 1 ? 'brew' : 'brews'}`
}
