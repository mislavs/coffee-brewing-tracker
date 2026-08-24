import { useMemo, useState } from 'react'
import {
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { CalendarDays } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoffeeConsumption } from '@/features/stats/hooks/useCoffeeConsumption'
import type {
  CoffeeConsumptionBucketDto,
  CoffeeConsumptionGranularity as CoffeeConsumptionGranularityType,
} from '@/lib/api/schemas'
import { CoffeeConsumptionGranularity } from '@/lib/api/schemas'

const gramsFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

const granularityOptions: Array<{
  label: string
  value: CoffeeConsumptionGranularityType
}> = [
  { label: 'Daily', value: CoffeeConsumptionGranularity.NUMBER_0 },
  { label: 'Weekly', value: CoffeeConsumptionGranularity.NUMBER_1 },
  { label: 'Monthly', value: CoffeeConsumptionGranularity.NUMBER_2 },
]

function toIsoDate(date: Date) {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatRange(range: DateRange) {
  if (!range.from) {
    return 'Select date range'
  }

  if (!range.to || isSameDay(range.from, range.to)) {
    return format(range.from, 'd MMM yyyy')
  }

  return `${format(range.from, 'd MMM yyyy')} – ${format(range.to, 'd MMM yyyy')}`
}

function formatTick(
  value: string,
  granularity: CoffeeConsumptionGranularityType,
) {
  const date = parseISO(value)

  if (granularity === CoffeeConsumptionGranularity.NUMBER_2) {
    return format(date, 'MMM yyyy')
  }

  return format(date, 'd MMM')
}

function formatBucketRange(bucket: CoffeeConsumptionBucketDto) {
  if (!bucket.startDate || !bucket.endDate) {
    return 'Recorded period'
  }

  const start = parseISO(bucket.startDate)
  const end = parseISO(bucket.endDate)

  if (isSameDay(start, end)) {
    return format(start, 'EEEE, d MMM yyyy')
  }

  return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`
}

type ConsumptionTooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{
    payload?: CoffeeConsumptionBucketDto
  }>
}

function ConsumptionTooltip({ active, payload }: ConsumptionTooltipProps) {
  const bucket = payload?.[0]?.payload
  if (!active || !bucket) {
    return null
  }

  const brewCount = bucket.brewCount ?? 0

  return (
    <div className="border-border bg-popover text-popover-foreground min-w-48 rounded-lg border px-3 py-2 shadow-sm">
      <p className="font-medium">{formatBucketRange(bucket)}</p>
      {bucket.isPartial ? (
        <p className="text-muted-foreground mt-0.5 text-xs">Partial period</p>
      ) : null}
      <div className="mt-2 flex items-baseline justify-between gap-5 text-sm">
        <span className="text-muted-foreground">Coffee consumed</span>
        <span className="font-semibold tabular-nums">
          {gramsFormatter.format(bucket.consumedGrams ?? 0)} g
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-5 text-sm">
        <span className="text-muted-foreground">Brews</span>
        <span className="font-medium tabular-nums">{brewCount}</span>
      </div>
    </div>
  )
}

type DateRangeControlProps = {
  range: DateRange
  today: Date
  onChange: (range: DateRange) => void
}

function DateRangeControl({ range, today, onChange }: DateRangeControlProps) {
  const [open, setOpen] = useState(false)

  const applyPreset = (nextRange: DateRange) => {
    onChange(nextRange)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start sm:w-auto"
          aria-label={`Date range: ${formatRange(range)}`}
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          <span className="truncate">{formatRange(range)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[calc(100vw-2rem)] p-0"
        align="end"
      >
        <div className="flex flex-wrap gap-1 border-b p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset({ from: subDays(today, 29), to: today })}
          >
            Last 30 days
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset({ from: subDays(today, 83), to: today })}
          >
            Last 12 weeks
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              applyPreset({
                from: startOfMonth(subMonths(today, 11)),
                to: today,
              })
            }
          >
            Last 12 months
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={range.to ?? range.from ?? today}
          onSelect={(nextRange) => {
            if (nextRange?.from) {
              onChange(nextRange)
            }
          }}
          disabled={{ after: today }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function CoffeeConsumptionGraph() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [granularity, setGranularity] =
    useState<CoffeeConsumptionGranularityType>(
      CoffeeConsumptionGranularity.NUMBER_0,
    )
  const [range, setRange] = useState<DateRange>(() => ({
    from: subDays(today, 29),
    to: today,
  }))
  const from = toIsoDate(range.from ?? today)
  const to = toIsoDate(range.to ?? range.from ?? today)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const { data, isLoading, isError, isFetching, refetch } =
    useCoffeeConsumption({
      from,
      to,
      granularity,
      timeZone,
    })
  const buckets = data?.buckets ?? []
  const totalBrews = data?.totalBrews ?? 0

  return (
    <section
      aria-labelledby="coffee-consumption-heading"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <header className="flex flex-col gap-5 border-b px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2
            id="coffee-consumption-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Coffee consumption
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Coffee used across your recorded brews.
          </p>
          {data && !isLoading ? (
            <p className="mt-3 text-sm" aria-live="polite">
              <span className="font-semibold tabular-nums">
                {gramsFormatter.format(data.totalConsumedGrams ?? 0)} g
              </span>{' '}
              across {totalBrews} {totalBrews === 1 ? 'brew' : 'brews'}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <fieldset className="bg-muted grid grid-cols-3 rounded-lg p-1">
            <legend className="sr-only">Consumption granularity</legend>
            {granularityOptions.map((option) => {
              const isSelected = option.value === granularity

              return (
                <label key={option.label} className="cursor-pointer rounded-md">
                  <input
                    type="radio"
                    name="coffee-consumption-granularity"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setGranularity(option.value)}
                    className="peer sr-only"
                  />
                  <span className="text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-ring/50 flex h-8 min-w-20 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors peer-focus-visible:ring-[3px]">
                    {option.label}
                  </span>
                </label>
              )
            })}
          </fieldset>
          <DateRangeControl range={range} today={today} onChange={setRange} />
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {isLoading && !data ? (
          <div aria-label="Loading coffee consumption">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        ) : isError && !data ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3 text-center">
            <div>
              <h3 className="font-semibold">
                Consumption data is temporarily unavailable
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                We couldn&apos;t load this date range.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => {
                void refetch()
              }}
            >
              Retry
            </Button>
          </div>
        ) : totalBrews === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center text-center">
            <h3 className="font-semibold">No brews in this range</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Choose another date range or log a brew to start building your
              consumption history.
            </p>
          </div>
        ) : (
          <div className="h-80 w-full min-w-0" aria-label="Coffee consumed over time">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={320}
              initialDimension={{ width: 800, height: 320 }}
            >
              <BarChart
                data={buckets}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                accessibilityLayer
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="startDate"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  minTickGap={24}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value: string) =>
                    formatTick(value, granularity)
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={52}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    `${gramsFormatter.format(value)} g`
                  }
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)' }}
                  content={<ConsumptionTooltip />}
                />
                <Bar
                  dataKey="consumedGrams"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}
