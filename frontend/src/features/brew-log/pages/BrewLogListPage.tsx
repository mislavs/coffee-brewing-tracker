import { useEffect, useState } from 'react'
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
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'

export function BrewLogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const [searchDraft, setSearchDraft] = useState(search)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const normalized = searchDraft.trim()
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (normalized) {
            next.set('search', normalized)
          } else {
            next.delete('search')
          }

          return next
        },
        { replace: true },
      )
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchDraft, setSearchParams])

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

  const { data: brewLogs = [], isPending } = useBrewLogs(search, dateFrom, dateTo)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Brew Log</CardTitle>
          <CardDescription>Browse and manage your brew history.</CardDescription>
        </div>
        <Button asChild>
          <Link to="/brew-log/new">Log Brew</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
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
