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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'
import { formatDate, toDisplayDate, toIsoDate } from '@/lib/date'

function getRatingEmoji(rating: number | null | undefined) {
  switch (rating) {
    case 1:
      return '😞'
    case 2:
      return '🙁'
    case 3:
      return '😐'
    case 4:
      return '🙂'
    case 5:
      return '🤩'
    default:
      return '—'
  }
}

function formatRatio(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return '—'
  }

  return `1:${value.toFixed(1)}`
}

export function BrewLogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''
  const [searchDraft, setSearchDraft] = useState(search)
  const [dateFromDraft, setDateFromDraft] = useState(toDisplayDate(dateFrom))
  const [dateToDraft, setDateToDraft] = useState(toDisplayDate(dateTo))

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    setDateFromDraft(toDisplayDate(dateFrom))
  }, [dateFrom])

  useEffect(() => {
    setDateToDraft(toDisplayDate(dateTo))
  }, [dateTo])

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

  const commitDateFilter = (name: 'dateFrom' | 'dateTo', draftValue: string) => {
    const normalized = draftValue.trim()
    const nextIsoDate = toIsoDate(normalized)

    setSearchParams(
      (previous) => {
        if (normalized && !nextIsoDate) {
          return previous
        }

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
            <Input
              id="brew-log-date-from"
              type="text"
              inputMode="numeric"
              placeholder="dd.mm.yyyy"
              value={dateFromDraft}
              onChange={(event) => setDateFromDraft(event.target.value)}
              onBlur={() => commitDateFilter('dateFrom', dateFromDraft)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitDateFilter('dateFrom', dateFromDraft)
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brew-log-date-to" className="text-sm font-medium">
              Date to
            </label>
            <Input
              id="brew-log-date-to"
              type="text"
              inputMode="numeric"
              placeholder="dd.mm.yyyy"
              value={dateToDraft}
              onChange={(event) => setDateToDraft(event.target.value)}
              onBlur={() => commitDateFilter('dateTo', dateToDraft)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitDateFilter('dateTo', dateToDraft)
                }
              }}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bean</TableHead>
              <TableHead>Brewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && brewLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Loading brew logs...
                </TableCell>
              </TableRow>
            ) : brewLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No brew logs found. Log your first brew to get started.
                </TableCell>
              </TableRow>
            ) : (
              brewLogs.map((brewLog) => (
                <TableRow
                  key={brewLog.id ?? `${brewLog.beanName ?? 'brew'}-${brewLog.brewedAt ?? ''}`}
                >
                  <TableCell>{formatDate(brewLog.brewedAt)}</TableCell>
                  <TableCell className="font-medium">
                    {brewLog.id ? (
                      <Link to={`/brew-log/${brewLog.id}`} className="hover:underline">
                        {brewLog.beanName ?? 'Unnamed bean'}
                      </Link>
                    ) : (
                      (brewLog.beanName ?? 'Unnamed bean')
                    )}
                  </TableCell>
                  <TableCell>{brewLog.brewerName || '—'}</TableCell>
                  <TableCell>{getRatingEmoji(brewLog.rating)}</TableCell>
                  <TableCell>{formatRatio(brewLog.brewRatio)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
