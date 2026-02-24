import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useSettings } from '@/hooks/useSettings'

const wholeNumberFormatter = new Intl.NumberFormat()

export function DashboardStats() {
  const { settings } = useSettings()
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats()

  if (!settings.showDashboardStats) {
    return null
  }

  if (isLoading && !data) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-md border bg-muted/20 p-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError && !data) {
    return (
      <section className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4">
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
    <section className="rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatItem
          label="Total brews"
          value={wholeNumberFormatter.format(totalBrews)}
        />
        <StatItem
          label="Coffee available"
          value={`${wholeNumberFormatter.format(coffeeAvailableGrams)} g`}
        />
        <StatItem
          label="Beans explored"
          value={wholeNumberFormatter.format(beansExplored)}
        />
        <StatItem
          label="Coffee consumed"
          value={`${wholeNumberFormatter.format(totalCoffeeConsumedGrams)} g`}
        />
      </div>
    </section>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-md border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
