import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { FeatureListToolbar } from '@/components/FeatureListToolbar'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSkeletonVisibilityClassName } from '@/components/skeletons/utils'
import { RoasterCard } from '@/features/roasters/components/RoasterCard'
import { useRoasters } from '@/features/roasters/hooks/useRoasters'

function getCountLabel(count: number) {
  return `${count} ${count === 1 ? 'roaster' : 'roasters'}`
}

export function RoasterListPage() {
  const { data: roasters = [], isPending } = useRoasters()

  return (
    <section aria-labelledby="roasters-heading" className="space-y-4">
      <FeatureListToolbar
        heading="Roasters"
        headingId="roasters-heading"
        countLabel={getCountLabel(roasters.length)}
        actions={
          <Button className="col-span-2 sm:col-span-1" asChild>
            <Link to="/roasters/new">Add Roaster</Link>
          </Button>
        }
      />

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
    </section>
  )
}