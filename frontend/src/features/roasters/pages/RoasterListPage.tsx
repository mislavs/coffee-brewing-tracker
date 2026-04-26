import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSkeletonVisibilityClassName } from '@/components/skeletons/utils'
import { RoasterCard } from '@/features/roasters/components/RoasterCard'
import { useRoasters } from '@/features/roasters/hooks/useRoasters'

export function RoasterListPage() {
  const { data: roasters = [], isPending } = useRoasters()

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-end gap-2">
        <Button asChild>
          <Link to="/roasters/new">Add Roaster</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && roasters.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton
                key={`roaster-skeleton-${index}`}
                badgeCount={2}
                className={getSkeletonVisibilityClassName(index)}
              />
            ))}
          </div>
        ) : roasters.length === 0 ? (
          <EmptyState
            icon={<Store className="size-6" />}
            title="No roasters yet"
            description="Add your first roaster to organize your beans by source."
            actionLabel="Add Roaster"
            actionHref="/roasters/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {roasters.map((roaster) => (
              <RoasterCard
                key={
                  roaster.id ??
                  `${roaster.name ?? 'roaster'}-${roaster.city ?? ''}-${roaster.countryName ?? ''}`
                }
                roaster={roaster}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
