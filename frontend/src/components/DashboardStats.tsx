import { Coffee, Compass, Droplets, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useSettings } from '@/hooks/useSettings'
import { StatCard } from '@/components/StatCard'

const wholeNumberFormatter = new Intl.NumberFormat()

export function DashboardStats() {
  const { settings } = useSettings()
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats()

  if (!settings.showDashboardStats) {
    return null
  }

  if (isLoading && !data) {
    return (
      <section className="animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border bg-card p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError && !data) {
    return (
      <section className="flex items-center justify-between gap-3 rounded-xl border bg-card/50 px-1 py-3">
        <p className="text-muted-foreground text-sm">
          Dashboard stats are temporarily unavailable.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch()
          }}
          disabled={isFetching}
        >
          Retry
        </Button>
      </section>
    )
  }

  const totalBrews = data?.totalBrews ?? 0
  const coffeeAvailableGrams = data?.coffeeAvailableGrams ?? 0
  const beansExplored = data?.beansExplored ?? 0
  const totalCoffeeConsumedGrams = data?.totalCoffeeConsumedGrams ?? 0

  return (
    <section className="animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total brews"
          value={wholeNumberFormatter.format(totalBrews)}
          icon={<Coffee className="size-4" />}
        />
        <StatCard
          label="Coffee available"
          value={`${wholeNumberFormatter.format(coffeeAvailableGrams)} g`}
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Beans explored"
          value={wholeNumberFormatter.format(beansExplored)}
          icon={<Compass className="size-4" />}
        />
        <StatCard
          label="Coffee consumed"
          value={`${wholeNumberFormatter.format(totalCoffeeConsumedGrams)} g`}
          icon={<Droplets className="size-4" />}
        />
      </div>
    </section>
  )
}
