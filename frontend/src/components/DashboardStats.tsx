import { Clock3, Coffee, Compass, Droplets, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useSettings } from '@/hooks/useSettings'
import { StatCard } from '@/components/StatCard'

const wholeNumberFormatter = new Intl.NumberFormat()
const consumptionFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

const mobileScrollContainerClassName =
  '-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0'

const mobileScrollItemClassName = 'min-w-[14rem] shrink-0 sm:min-w-0 sm:shrink'

export function DashboardStats() {
  const { settings } = useSettings()
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats()

  if (!settings.showDashboardStats) {
    return null
  }

  if (isLoading && !data) {
    return (
      <section className="animate-fade-in">
        <div className={cn(mobileScrollContainerClassName, 'sm:grid-cols-2 xl:grid-cols-4')}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={mobileScrollItemClassName}>
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError && !data) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border bg-card/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
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
  const estimatedDaysRemaining = data?.estimatedDaysRemaining
  const averageDailyConsumptionGrams = data?.averageDailyConsumptionGrams
  const hasEstimatedDaysRemaining = estimatedDaysRemaining != null
  const gridClassName = hasEstimatedDaysRemaining ? 'sm:grid-cols-2 xl:grid-cols-5' : 'sm:grid-cols-2 xl:grid-cols-4'

  return (
    <section className="animate-fade-in">
      <div className={cn(mobileScrollContainerClassName, gridClassName)}>
        <div className={mobileScrollItemClassName}>
          <StatCard
            label="Total brews"
            value={wholeNumberFormatter.format(totalBrews)}
            icon={<Coffee className="size-4" />}
          />
        </div>
        <div className={mobileScrollItemClassName}>
          <StatCard
            label="Coffee available"
            value={`${wholeNumberFormatter.format(coffeeAvailableGrams)} g`}
            icon={<Package className="size-4" />}
          />
        </div>
        {hasEstimatedDaysRemaining ? (
          <div className={mobileScrollItemClassName}>
            <StatCard
              label="Days of coffee left"
              value={`${wholeNumberFormatter.format(estimatedDaysRemaining)} days`}
              subtitle={
                averageDailyConsumptionGrams != null
                  ? `at ${consumptionFormatter.format(averageDailyConsumptionGrams)} g/day`
                  : undefined
              }
              icon={<Clock3 className="size-4" />}
            />
          </div>
        ) : null}
        <div className={mobileScrollItemClassName}>
          <StatCard
            label="Beans explored"
            value={wholeNumberFormatter.format(beansExplored)}
            icon={<Compass className="size-4" />}
          />
        </div>
        <div className={mobileScrollItemClassName}>
          <StatCard
            label="Coffee consumed"
            value={`${wholeNumberFormatter.format(totalCoffeeConsumedGrams)} g`}
            icon={<Droplets className="size-4" />}
          />
        </div>
      </div>
    </section>
  )
}
