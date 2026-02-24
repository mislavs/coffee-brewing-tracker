import { useEffect, useState, useTransition } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { BeanCard } from '@/features/beans/components/BeanCard'
import { useBeans } from '@/features/beans/hooks/useBeans'

export function BeanListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const showUnavailable = searchParams.get('showUnavailable') === 'true'
  const [searchDraft, setSearchDraft] = useState(search)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  function handleToggleUnavailable(checked: boolean) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (checked) {
        next.set('showUnavailable', 'true')
      } else {
        next.delete('showUnavailable')
      }

      return next
    }, { replace: true })
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const normalized = searchDraft.trim()
      startTransition(() => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous)
          if (normalized) {
            next.set('search', normalized)
          } else {
            next.delete('search')
          }

          return next
        }, { replace: true })
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchDraft, setSearchParams, startTransition])

  const { data: beans = [], isPending } = useBeans(search, showUnavailable)
  const availableBeans = beans.filter((bean) => bean.isAvailable !== false)
  const unavailableBeans = beans.filter((bean) => bean.isAvailable === false)

  function getBeanKey(index: number, beanName: string) {
    return `${beanName}-${index}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Beans</CardTitle>
          <CardDescription>
            Browse and manage your coffee bean library.
          </CardDescription>
        </div>
        <Button asChild>
          <Link to="/beans/new">Add Bean</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-md space-y-2">
          <label htmlFor="bean-search" className="text-sm font-medium">
            Search by name
          </label>
          <Input
            id="bean-search"
            placeholder="Filter beans..."
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="show-unavailable"
            checked={showUnavailable}
            onCheckedChange={handleToggleUnavailable}
          />
          <label htmlFor="show-unavailable" className="text-sm font-medium">
            Show unavailable
          </label>
        </div>

        {isPending && beans.length === 0 ? (
          <p className="text-muted-foreground">Loading beans...</p>
        ) : beans.length === 0 ? (
          <p className="text-muted-foreground">
            No beans yet. Add your first bean to get started.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {availableBeans.map((bean, index) => (
                <BeanCard
                  key={bean.id ?? getBeanKey(index, bean.name ?? 'bean')}
                  bean={bean}
                />
              ))}
            </div>

            {showUnavailable && unavailableBeans.length > 0 ? (
              <>
                {availableBeans.length > 0 ? (
                  <hr className="border-border" />
                ) : null}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Unavailable beans
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {unavailableBeans.map((bean, index) => (
                      <BeanCard
                        key={bean.id ?? getBeanKey(index, bean.name ?? 'bean')}
                        bean={bean}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
