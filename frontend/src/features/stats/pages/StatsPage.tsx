import { lazy, Suspense, type ReactNode } from 'react'
import { Clock3, Coffee, Compass, Droplets, Package } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { cn } from '@/lib/utils'

const CoffeeConsumptionGraph = lazy(async () => {
  const module =
    await import('@/features/stats/components/CoffeeConsumptionGraph')
  return { default: module.CoffeeConsumptionGraph }
})

const wholeNumberFormatter = new Intl.NumberFormat()
const consumptionFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

type StatRowProps = {
  icon: ReactNode
  label: string
  description: string
  value: string
  detail?: string
}

function StatRow({ icon, label, description, value, detail }: StatRowProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
      <dt className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{label}</span>
          <span className="text-muted-foreground mt-0.5 block text-sm">
            {description}
          </span>
        </span>
      </dt>
      <dd className="shrink-0 text-right">
        <span className="block text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
          {value}
        </span>
        {detail ? (
          <span className="text-muted-foreground mt-0.5 block text-xs tabular-nums">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" aria-label="Loading stats">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <section key={groupIndex} className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="divide-y overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: groupIndex === 0 ? 2 : 3 }).map(
              (__, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center gap-4 px-4 py-5 sm:px-6"
                >
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-44 max-w-full" />
                  </div>
                  <Skeleton className="h-7 w-16" />
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export function StatsOverview() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats()

  if (isLoading && !data) {
    return <StatsLoading />
  }

  if (isError && !data) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Stats are temporarily unavailable</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            We couldn&apos;t load your brewing summary.
          </p>
        </div>
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
      </div>
    )
  }

  const estimatedDaysRemaining = data?.estimatedDaysRemaining
  const averageDailyConsumptionGrams = data?.averageDailyConsumptionGrams

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="brewing-history-heading" className="space-y-3">
        <div>
          <h2
            id="brewing-history-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Brewing history
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            What you have recorded and explored so far.
          </p>
        </div>
        <dl className="divide-y overflow-hidden rounded-xl border bg-card">
          <StatRow
            label="Total brews"
            description="Brews recorded in your journal"
            value={wholeNumberFormatter.format(data?.totalBrews ?? 0)}
            icon={<Coffee className="size-5" aria-hidden="true" />}
          />
          <StatRow
            label="Beans explored"
            description="Different coffees in your brewing history"
            value={wholeNumberFormatter.format(data?.beansExplored ?? 0)}
            icon={<Compass className="size-5" aria-hidden="true" />}
          />
        </dl>
      </section>

      <section aria-labelledby="coffee-supply-heading" className="space-y-3">
        <div>
          <h2
            id="coffee-supply-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Coffee supply
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your current stock and recorded consumption.
          </p>
        </div>
        <dl className="divide-y overflow-hidden rounded-xl border bg-card">
          <StatRow
            label="Coffee available"
            description="Coffee currently available to brew"
            value={`${wholeNumberFormatter.format(data?.coffeeAvailableGrams ?? 0)} g`}
            icon={<Package className="size-5" aria-hidden="true" />}
          />
          {estimatedDaysRemaining != null ? (
            <StatRow
              label="Days of coffee left"
              description="Estimated from your recent pace"
              value={`${wholeNumberFormatter.format(estimatedDaysRemaining)} days`}
              detail={
                averageDailyConsumptionGrams != null
                  ? `at ${consumptionFormatter.format(averageDailyConsumptionGrams)} g/day`
                  : undefined
              }
              icon={<Clock3 className="size-5" aria-hidden="true" />}
            />
          ) : null}
          <StatRow
            label="Coffee consumed"
            description="Coffee used across recorded brews"
            value={`${wholeNumberFormatter.format(data?.totalCoffeeConsumedGrams ?? 0)} g`}
            icon={<Droplets className="size-5" aria-hidden="true" />}
          />
        </dl>
      </section>
    </div>
  )
}

export function GraphsPage() {
  return (
    <Suspense
      fallback={
        <div className="overflow-hidden rounded-xl border bg-card p-4 sm:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-5 h-80 w-full rounded-lg" />
        </div>
      }
    >
      <CoffeeConsumptionGraph />
    </Suspense>
  )
}

export function StatsPage() {
  return (
    <section
      aria-labelledby="my-stats-heading"
      className="mx-auto w-full max-w-6xl space-y-8"
    >
      <header className="space-y-2">
        <h1 id="my-stats-heading" className="text-2xl font-bold tracking-tight">
          My Stats
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          See the story your brewing journal tells over time.
        </p>
      </header>

      <nav aria-label="My Stats sections" className="border-b">
        <div className="flex gap-6">
          <NavLink
            to="/stats"
            end
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            Stats
          </NavLink>
          <NavLink
            to="/stats/graphs"
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            Graphs
          </NavLink>
        </div>
      </nav>

      <Outlet />
    </section>
  )
}
