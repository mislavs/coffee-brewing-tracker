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
import { BeanCard } from '@/features/beans/components/BeanCard'
import { useBeans } from '@/features/beans/hooks/useBeans'

export function BeanListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const [searchDraft, setSearchDraft] = useState(search)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const normalized = searchDraft.trim()
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        if (normalized) {
          next.set('search', normalized)
        } else {
          next.delete('search')
        }

        return next
      }, { replace: true })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchDraft, setSearchParams])

  const { data: beans = [], isPending } = useBeans(search)

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

        {isPending && beans.length === 0 ? (
          <p className="text-muted-foreground">Loading beans...</p>
        ) : beans.length === 0 ? (
          <p className="text-muted-foreground">
            No beans yet. Add your first bean to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {beans.map((bean) => (
              <BeanCard
                key={
                  bean.id ??
                  `${bean.name ?? 'bean'}-${bean.roasterName ?? ''}-${bean.bagWeight ?? ''}`
                }
                bean={bean}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
