import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Leaf } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { FeatureListToolbar } from '@/components/FeatureListToolbar'
import { Button } from '@/components/ui/button'
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
import type { BeanSummaryDto } from '@/lib/api/schemas'

const allCountriesValue = '__all_countries__'
const defaultSortField = 'name'
const defaultSortDirection = 'asc'
const sortFields = ['name', 'roastDate', 'remainingQuantity'] as const
const sortDirections = ['asc', 'desc'] as const

type BeanSortField = (typeof sortFields)[number]
type SortDirection = (typeof sortDirections)[number]

function isBeanSortField(value: string | null): value is BeanSortField {
  return sortFields.includes(value as BeanSortField)
}

function isSortDirection(value: string | null): value is SortDirection {
  return sortDirections.includes(value as SortDirection)
}

function getSortField(value: string | null): BeanSortField {
  return isBeanSortField(value) ? value : defaultSortField
}

function getSortDirection(value: string | null): SortDirection {
  return isSortDirection(value) ? value : defaultSortDirection
}

function getSortFieldLabel(field: BeanSortField) {
  if (field === 'roastDate') {
    return 'Roast date'
  }

  if (field === 'remainingQuantity') {
    return 'Available amount'
  }

  return 'Name'
}

function getCountLabel(count: number) {
  return `${count} ${count === 1 ? 'bean' : 'beans'}`
}

function getRoastDateTimestamp(bean: BeanSummaryDto) {
  if (!bean.roastDate) {
    return undefined
  }

  const timestamp = Date.parse(bean.roastDate)
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function getAvailableAmount(bean: BeanSummaryDto) {
  return bean.remainingQuantity ?? bean.bagWeight ?? 0
}

function compareOptionalNumbers(
  first: number | undefined,
  second: number | undefined,
  direction: SortDirection,
) {
  if (first === undefined && second === undefined) {
    return 0
  }

  if (first === undefined) {
    return 1
  }

  if (second === undefined) {
    return -1
  }

  const result = first - second
  return direction === 'asc' ? result : -result
}

function compareBeans(
  first: BeanSummaryDto,
  second: BeanSummaryDto,
  field: BeanSortField,
  direction: SortDirection,
) {
  if (field === 'name') {
    const result = (first.name ?? '').localeCompare(second.name ?? '', undefined, {
      sensitivity: 'base',
    })
    return direction === 'asc' ? result : -result
  }

  if (field === 'roastDate') {
    return compareOptionalNumbers(
      getRoastDateTimestamp(first),
      getRoastDateTimestamp(second),
      direction,
    )
  }

  return compareOptionalNumbers(
    getAvailableAmount(first),
    getAvailableAmount(second),
    direction,
  )
}

export function BeanListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const showUnavailable = searchParams.get('showUnavailable') === 'true'
  const countryId = searchParams.get('country') ?? ''
  const sortField = getSortField(searchParams.get('sort'))
  const sortDirection = getSortDirection(searchParams.get('dir'))
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    Boolean(search) || Boolean(countryId) || showUnavailable,
  )
  const [isSortOpen, setIsSortOpen] = useState(
    sortField !== defaultSortField || sortDirection !== defaultSortDirection,
  )
  const [searchDraft, setSearchDraft] = useDebouncedSearchParam({
    paramName: 'search',
    value: search,
    setSearchParams,
  })
  const { data: countryStats = [] } = useCountryMapStats()

  function handleToggleUnavailable(checked: boolean) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (checked) {
          next.set('showUnavailable', 'true')
        } else {
          next.delete('showUnavailable')
        }

        return next
      },
      { replace: true },
    )
  }

  function handleSortFieldChange(nextValue: BeanSortField) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (nextValue === defaultSortField) {
          next.delete('sort')
        } else {
          next.set('sort', nextValue)
        }

        return next
      },
      { replace: true },
    )
  }

  function handleToggleSortDirection() {
    const nextDirection = sortDirection === 'asc' ? 'desc' : 'asc'

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (nextDirection === defaultSortDirection) {
          next.delete('dir')
        } else {
          next.set('dir', nextDirection)
        }

        return next
      },
      { replace: true },
    )
  }

  const { data: beans = [], isPending } = useBeans(
    search,
    showUnavailable,
    countryId || undefined,
  )
  const availableBeans = beans
    .filter((bean) => bean.isAvailable !== false)
    .sort((first, second) => compareBeans(first, second, sortField, sortDirection))
  const unavailableBeans = beans
    .filter((bean) => bean.isAvailable === false)
    .sort((first, second) => compareBeans(first, second, sortField, sortDirection))
  const selectedCountry = countryStats.find(
    (country) => country.countryId === countryId,
  )
  const filterChips = [
    search ? `Search: ${search}` : null,
    countryId ? (selectedCountry?.countryName ?? 'Selected country') : null,
    showUnavailable ? 'Show unavailable' : null,
  ].filter((chip): chip is string => Boolean(chip))
  const sortChips = [
    sortField !== defaultSortField ? `Sort: ${getSortFieldLabel(sortField)}` : null,
    sortDirection !== defaultSortDirection ? 'Descending' : null,
  ].filter((chip): chip is string => Boolean(chip))
  const activeChips = [
    ...(!isFiltersOpen ? filterChips : []),
    ...(!isSortOpen ? sortChips : []),
  ]

  function getBeanKey(index: number, beanName: string) {
    return `${beanName}-${index}`
  }

  return (
    <section aria-labelledby="beans-heading" className="space-y-4">
      <FeatureListToolbar
        heading="Beans"
        headingId="beans-heading"
        countLabel={getCountLabel(beans.length)}
        activeChips={activeChips}
        actions={
          <Button className="col-span-2 sm:col-span-1" asChild>
            <Link to="/beans/new">Add Bean</Link>
          </Button>
        }
        controls={
          <>
            <Button
              type="button"
              variant={isFiltersOpen ? 'secondary' : 'outline'}
              size="sm"
              aria-expanded={isFiltersOpen}
              aria-controls="bean-filters"
              aria-label={isFiltersOpen ? 'Hide filters' : 'Show filters'}
              title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
              onClick={() => setIsFiltersOpen((current) => !current)}
            >
              <Filter className="size-4" />
              Filters
              {filterChips.length > 0 ? (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary"
                >
                  {filterChips.length}
                </span>
              ) : null}
            </Button>
            <Button
              type="button"
              variant={isSortOpen ? 'secondary' : 'outline'}
              size="sm"
              aria-expanded={isSortOpen}
              aria-controls="bean-sort"
              aria-label={isSortOpen ? 'Hide sort' : 'Show sort'}
              title={isSortOpen ? 'Hide sort' : 'Show sort'}
              onClick={() => setIsSortOpen((current) => !current)}
            >
              <ArrowUpDown className="size-4" />
              Sort
              {sortChips.length > 0 ? (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary"
                >
                  {sortChips.length}
                </span>
              ) : null}
            </Button>
          </>
        }
      />

      {isFiltersOpen ? (
        <div
          id="bean-filters"
          className="grid gap-4 rounded-lg border bg-card/60 p-3 md:grid-cols-2"
        >
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
                setSearchParams(
                  (previous) => {
                    const next = new URLSearchParams(previous)
                    if (nextValue === allCountriesValue) {
                      next.delete('country')
                    } else {
                      next.set('country', nextValue)
                    }
                    return next
                  },
                  { replace: true },
                )
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
          <div className="flex items-center gap-3 md:col-span-2">
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

      {isSortOpen ? (
        <div
          id="bean-sort"
          className="grid gap-4 rounded-lg border bg-card/60 p-3 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label htmlFor="bean-sort-field" className="text-sm font-medium">
              Order by
            </label>
            <Select
              value={sortField}
              onValueChange={(nextValue) => handleSortFieldChange(getSortField(nextValue))}
            >
              <SelectTrigger id="bean-sort-field" className="w-full">
                <SelectValue placeholder="Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="roastDate">Roast date</SelectItem>
                <SelectItem value="remainingQuantity">Available amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Direction</span>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleToggleSortDirection}
            >
              {sortDirection === 'asc' ? (
                <>
                  <ArrowUp className="size-4" />
                  Ascending
                </>
              ) : (
                <>
                  <ArrowDown className="size-4" />
                  Descending
                </>
              )}
            </Button>
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
              {availableBeans.length > 0 ? <hr className="border-border" /> : null}
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
    </section>
  )
}