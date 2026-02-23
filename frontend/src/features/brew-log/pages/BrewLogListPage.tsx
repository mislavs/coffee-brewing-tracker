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

function formatBrewDate(value: Date | null | undefined) {
  if (!value) {
    return '—'
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }

  return parsed.toLocaleDateString()
}

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
              type="date"
              value={dateFrom}
              onChange={(event) => {
                const nextValue = event.target.value
                setSearchParams(
                  (previous) => {
                    const next = new URLSearchParams(previous)
                    if (nextValue) {
                      next.set('dateFrom', nextValue)
                    } else {
                      next.delete('dateFrom')
                    }

                    return next
                  },
                  { replace: true },
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brew-log-date-to" className="text-sm font-medium">
              Date to
            </label>
            <Input
              id="brew-log-date-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                const nextValue = event.target.value
                setSearchParams(
                  (previous) => {
                    const next = new URLSearchParams(previous)
                    if (nextValue) {
                      next.set('dateTo', nextValue)
                    } else {
                      next.delete('dateTo')
                    }

                    return next
                  },
                  { replace: true },
                )
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
                  <TableCell>{formatBrewDate(brewLog.brewedAt)}</TableCell>
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
