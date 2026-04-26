import { useState } from 'react'
import { Filter, Leaf } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSkeletonVisibilityClassName } from '@/components/skeletons/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BeanCard } from '@/features/beans/components/BeanCard'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useCountryMapStats } from '@/features/world-map/hooks/useCountryMapStats'
import { useDebouncedSearchParam } from '@/hooks/useDebouncedSearchParam'

const allCountriesValue = '__all_countries__'

export function BeanListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const showUnavailable = searchParams.get('showUnavailable') === 'true'
  const countryId = searchParams.get('country') ?? ''
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    Boolean(search) || Boolean(countryId) || showUnavailable,
  )
  const [searchDraft, setSearchDraft] = useDebouncedSearchParam({
    paramName: 'search',
    value: search,
    setSearchParams,
  })
  const { data: countryStats = [] } = useCountryMapStats()

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

  const { data: beans = [], isPending } = useBeans(
    search,
    showUnavailable,
    countryId || undefined,
  )
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isFiltersOpen ? 'secondary' : 'ghost'}
            size="icon"
            aria-expanded={isFiltersOpen}
            aria-controls="bean-filters"
            aria-label={isFiltersOpen ? 'Hide filters' : 'Show filters'}
            title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            <Filter className="size-4" />
          </Button>
          <Button asChild>
            <Link to="/beans/new">Add Bean</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFiltersOpen ? (
          <div id="bean-filters" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <label htmlFor="bean-country-filter" className="text-sm font-medium">
                  Filter by country
                </label>
                <Select
                  value={countryId || allCountriesValue}
                  onValueChange={(nextValue) => {
                    setSearchParams((previous) => {
                      const next = new URLSearchParams(previous)
                      if (nextValue === allCountriesValue) {
                        next.delete('country')
                      } else {
                        next.set('country', nextValue)
                      }
                      return next
                    }, { replace: true })
                  }}
                >
                  <SelectTrigger id="bean-country-filter" className="w-full">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allCountriesValue}>All countries</SelectItem>
                    {countryStats.map((country) =>
                      country.countryId ? (
                        <SelectItem key={country.countryId} value={country.countryId}>
                          {country.countryName ?? 'Unnamed country'}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
              </div>
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
          </div>
        ) : null}

        {isPending && beans.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton
                key={`bean-skeleton-${index}`}
                badgeCount={3}
                className={getSkeletonVisibilityClassName(index)}
              />
            ))}
          </div>
        ) : beans.length === 0 ? (
          <EmptyState
            icon={<Leaf className="size-6" />}
            title="No beans yet"
            description="Add your first bean to start building your coffee library."
            actionLabel="Add Bean"
            actionHref="/beans/new"
          />
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
