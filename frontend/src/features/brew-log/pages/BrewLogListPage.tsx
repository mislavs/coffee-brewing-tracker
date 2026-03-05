import { Mic } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BrewLogCardSkeleton } from '@/components/skeletons/BrewLogCardSkeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'
import { useFeatures } from '@/hooks/useFeatures'
import { useDebouncedSearchParam } from '@/hooks/useDebouncedSearchParam'

export function BrewLogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const includeUnavailable = searchParams.get('includeUnavailable') === 'true'
  const [searchDraft, setSearchDraft] = useDebouncedSearchParam({
    paramName: 'search',
    value: search,
    setSearchParams,
  })

  const setDateFilter = (name: 'dateFrom' | 'dateTo', nextIsoDate: string | undefined) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (nextIsoDate) {
          next.set(name, nextIsoDate)
        } else {
          next.delete(name)
        }

        return next
      },
      { replace: true },
    )
  }

  const handleToggleUnavailable = (checked: boolean) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (checked) {
          next.set('includeUnavailable', 'true')
        } else {
          next.delete('includeUnavailable')
        }

        return next
      },
      { replace: true },
    )
  }

  const { data: brewLogs = [], isPending } = useBrewLogs(
    search,
    dateFrom,
    dateTo,
    includeUnavailable,
  )
  const { data: features } = useFeatures()

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Brew Log</CardTitle>
          <CardDescription>Browse and manage your brew history.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {features?.voiceBrewLogParsing ? (
            <Button variant="outline" asChild>
              <Link to="/brew-log/new?dictate=true">
                <Mic className="size-4" />
                Dictate brew
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link to="/brew-log/new">Log Brew</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-1">
            <label htmlFor="brew-log-search" className="text-sm font-medium">
              Search by bean
            </label>
            <Input
              id="brew-log-search"
              placeholder="Filter by bean..."
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brew-log-date-from" className="text-sm font-medium">
              Date from
            </label>
            <DatePicker
              id="brew-log-date-from"
              value={dateFrom || undefined}
              onChange={(nextValue) => setDateFilter('dateFrom', nextValue)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brew-log-date-to" className="text-sm font-medium">
              Date to
            </label>
            <DatePicker
              id="brew-log-date-to"
              value={dateTo || undefined}
              onChange={(nextValue) => setDateFilter('dateTo', nextValue)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brew-log-include-unavailable" className="text-sm font-medium">
              Availability
            </label>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="brew-log-include-unavailable"
                checked={includeUnavailable}
                onCheckedChange={handleToggleUnavailable}
              />
              <label htmlFor="brew-log-include-unavailable" className="text-sm font-medium">
                Show unavailable beans
              </label>
            </div>
          </div>
        </div>

        {isPending && brewLogs.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <BrewLogCardSkeleton
                key={`brew-log-skeleton-${index}`}
                className={
                  index === 3
                    ? 'hidden sm:block'
                    : index >= 4
                      ? 'hidden xl:block'
                      : undefined
                }
              />
            ))}
          </div>
        ) : brewLogs.length === 0 ? (
          <p className="text-muted-foreground">
            No brew logs yet. Add your first brew to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brewLogs.map((brewLog) => (
              <BrewLogCard
                key={brewLog.id ?? `${brewLog.beanName ?? 'brew'}-${brewLog.brewedAt ?? ''}`}
                brewLog={brewLog}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
