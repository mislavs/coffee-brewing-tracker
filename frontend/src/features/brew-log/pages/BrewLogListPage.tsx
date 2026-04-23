import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, Coffee, Mic } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { BrewLogCardSkeleton } from '@/components/skeletons/BrewLogCardSkeleton'
import { getSkeletonVisibilityClassName } from '@/components/skeletons/utils'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { QuickLogWizardDialog } from '@/features/brew-log/components/quick-log/QuickLogWizardDialog'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'
import { useFeatures } from '@/hooks/useFeatures'
import { useDebouncedSearchParam } from '@/hooks/useDebouncedSearchParam'

const BREW_LOG_PAGE_SIZE = 12

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? '1', 10)

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | 'start-ellipsis' | 'end-ellipsis'> = [1]
  const siblingStart = Math.max(2, currentPage - 1)
  const siblingEnd = Math.min(totalPages - 1, currentPage + 1)

  if (siblingStart > 2) {
    items.push('start-ellipsis')
  }

  for (let page = siblingStart; page <= siblingEnd; page += 1) {
    items.push(page)
  }

  if (siblingEnd < totalPages - 1) {
    items.push('end-ellipsis')
  }

  items.push(totalPages)

  return items
}

export function BrewLogListPage() {
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const includeUnavailable = searchParams.get('includeUnavailable') === 'true'
  const page = parsePageParam(searchParams.get('page'))
  const setFilterSearchParams = useCallback(
    (
      nextInit: Parameters<typeof setSearchParams>[0],
      navigateOptions?: Parameters<typeof setSearchParams>[1],
    ) => {
      setSearchParams(
        (previous) => {
          const nextValue = typeof nextInit === 'function' ? nextInit(previous) : nextInit
          const next =
            nextValue instanceof URLSearchParams ||
            Array.isArray(nextValue) ||
            typeof nextValue === 'string'
              ? new URLSearchParams(nextValue)
              : new URLSearchParams()

          if (
            nextValue &&
            !(nextValue instanceof URLSearchParams) &&
            !Array.isArray(nextValue) &&
            typeof nextValue !== 'string'
          ) {
            for (const [key, value] of Object.entries(nextValue)) {
              if (Array.isArray(value)) {
                for (const item of value) {
                  next.append(key, item)
                }
              } else {
                next.set(key, value)
              }
            }
          }

          next.delete('page')
          return next
        },
        navigateOptions,
      )
    },
    [setSearchParams],
  )
  const [searchDraft, setSearchDraft] = useDebouncedSearchParam({
    paramName: 'search',
    value: search,
    setSearchParams: setFilterSearchParams,
  })

  const setDateFilter = (name: 'dateFrom' | 'dateTo', nextIsoDate: string | undefined) => {
    setFilterSearchParams(
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
    setFilterSearchParams(
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

  const setPage = (nextPage: number) => {
    const normalizedPage = Math.max(nextPage, 1)

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (normalizedPage === 1) {
        next.delete('page')
      } else {
        next.set('page', normalizedPage.toString())
      }

      return next
    })
  }

  const { data: brewLogsPage, isPending } = useBrewLogs(
    search,
    dateFrom,
    dateTo,
    includeUnavailable,
    undefined,
    page,
    BREW_LOG_PAGE_SIZE,
  )
  const brewLogs = brewLogsPage?.items ?? []
  const totalCount = brewLogsPage?.totalCount ?? 0
  const pageSize = brewLogsPage?.pageSize ?? BREW_LOG_PAGE_SIZE
  const totalPages = Math.max(1, brewLogsPage?.totalPages ?? 1)
  const currentPage = brewLogsPage?.page ?? page
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)
  const paginationItems = getPaginationItems(currentPage, totalPages)
  const { data: features } = useFeatures()

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Brew Log</CardTitle>
            <CardDescription>Browse and manage your brew history.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {features?.voiceBrewLogParsing ? (
              <Button variant="outline" asChild>
                <Link to="/brew-log/new?dictate=true">
                  <Mic className="size-4" />
                  Dictate brew
                </Link>
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => setQuickLogOpen(true)}>
              Quick Log
            </Button>
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
                  className={getSkeletonVisibilityClassName(index)}
                />
              ))}
            </div>
          ) : brewLogs.length === 0 ? (
            <EmptyState
              icon={<Coffee className="size-6" />}
              title="No brews yet"
              description="Log your first brew to start tracking your coffee journey."
              actions={
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setQuickLogOpen(true)}
                  >
                    Quick Log
                  </Button>
                  <Button asChild>
                    <Link to="/brew-log/new">Log Brew</Link>
                  </Button>
                </>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {brewLogs.map((brewLog) => (
                  <BrewLogCard
                    key={brewLog.id ?? `${brewLog.beanName ?? 'brew'}-${brewLog.brewedAt ?? ''}`}
                    brewLog={brewLog}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {showingFrom}-{showingTo} of {totalCount}
                </p>

                <Pagination className="mx-0 w-full justify-start overflow-x-auto sm:w-auto sm:justify-end">
                  <PaginationContent className="min-w-max">
                    <PaginationItem>
                      <PaginationLink asChild size="default">
                        <button
                          type="button"
                          onClick={() => setPage(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          <ChevronLeft className="size-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>
                      </PaginationLink>
                    </PaginationItem>

                    {paginationItems.map((item) =>
                      typeof item === 'number' ? (
                        <PaginationItem key={item}>
                          <PaginationLink asChild isActive={item === currentPage}>
                            <button type="button" onClick={() => setPage(item)}>
                              {item}
                            </button>
                          </PaginationLink>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationLink asChild size="default">
                        <button
                          type="button"
                          onClick={() => setPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="size-4" />
                        </button>
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {quickLogOpen ? (
        <QuickLogWizardDialog open={quickLogOpen} onOpenChange={setQuickLogOpen} />
      ) : null}
    </>
  )
}
