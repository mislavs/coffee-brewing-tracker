import { memo, useMemo, useState } from 'react'
import countriesGeoRaw from 'world-atlas/countries-110m.json?raw'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WorldMapRenderer } from '@/features/world-map/components/renderers/WorldMapRenderer'
import type {
  WorldCountryFeature,
  WorldMapProjection,
} from '@/features/world-map/components/renderers/types'
import { useCountryMapStats } from '@/features/world-map/hooks/useCountryMapStats'
import { WorldMapTooltip } from '@/features/world-map/components/WorldMapTooltip'
import { normalizeIsoNumericCode } from '@/features/world-map/worldMapUtils'
import { cn } from '@/lib/utils'

const antarcticaIsoNumericCode = '010'
const countriesGeoData = JSON.parse(countriesGeoRaw) as Record<string, unknown>

type WorldMapProps = {
  compact?: boolean
  projection?: WorldMapProjection
  mapHeightClassName?: string
  onCountryClick?: (country: SelectedWorldMapCountry) => void
}

type SelectedWorldMapCountry = {
  countryId: string
  countryName: string
  isoNumericCode: string
}

type HoveredCountry = {
  isoNumericCode: string
  countryName: string
  beanCount: number
  totalBagWeightGrams: number
  avgBrewRating: number | null | undefined
  totalBrews: number
  x: number
  y: number
}

function getMapHeightClass(compact: boolean, mapHeightClassName?: string) {
  if (mapHeightClassName) {
    return mapHeightClassName
  }

  return compact ? 'h-[22rem] sm:h-[34rem]' : 'h-[32rem] sm:h-[48rem]'
}

function getCountryFill(beanCount: number, maxBeanCount: number, isHovered: boolean) {
  if (beanCount <= 0 || maxBeanCount <= 0) {
    return 'color-mix(in hsl, var(--muted) 85%, var(--background) 15%)'
  }

  const normalized = beanCount / maxBeanCount
  const baseMix = 30 + normalized * 60
  const hoverBoost = isHovered ? 10 : 0
  const primaryMix = Math.min(95, baseMix + hoverBoost)
  const mutedMix = 100 - primaryMix
  return `color-mix(in hsl, var(--muted) ${mutedMix}%, var(--primary) ${primaryMix}%)`
}

function WorldMapComponent({
  compact = false,
  projection = 'geoMercator',
  mapHeightClassName,
  onCountryClick,
}: WorldMapProps) {
  const { data: countryStats = [], isLoading, isError, refetch, isFetching } =
    useCountryMapStats()
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(
    null,
  )

  const maxBeanCount = useMemo(
    () =>
      countryStats.reduce(
        (currentMax, country) => Math.max(currentMax, country.beanCount ?? 0),
        0,
      ),
    [countryStats],
  )

  const statsByIsoNumericCode = useMemo(() => {
    const lookup = new Map<string, (typeof countryStats)[number]>()

    for (const country of countryStats) {
      const isoNumericCode = normalizeIsoNumericCode(country.isoNumericCode)
      if (isoNumericCode) {
        lookup.set(isoNumericCode, country)
      }
    }

    return lookup
  }, [countryStats])

  function resolveCountryStats(country: WorldCountryFeature) {
    return statsByIsoNumericCode.get(country.isoNumericCode)
  }

  function toHoveredCountry(
    country: WorldCountryFeature,
    pointer: { x: number; y: number },
  ): HoveredCountry | null {
    const stats = resolveCountryStats(country)
    if (!stats) {
      return null
    }

    return {
      isoNumericCode: country.isoNumericCode,
      countryName: stats.countryName ?? country.name,
      beanCount: stats.beanCount ?? 0,
      totalBagWeightGrams: stats.totalBagWeightGrams ?? 0,
      avgBrewRating: stats.avgBrewRating,
      totalBrews: stats.totalBrews ?? 0,
      x: pointer.x,
      y: pointer.y,
    }
  }

  const mapHeightClass = getMapHeightClass(compact, mapHeightClassName)

  if (isLoading && countryStats.length === 0) {
    return (
      <section className="w-full">
        <Skeleton className={cn('w-full', mapHeightClass)} />
      </section>
    )
  }

  return (
    <section className="w-full">
      {isFetching ? (
        <div className="mb-2 flex justify-end">
          <span className="text-muted-foreground text-xs">Refreshing map…</span>
        </div>
      ) : null}
      {isError && countryStats.length === 0 ? (
        <div className="mb-3 flex flex-col gap-3 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Stats are unavailable. Showing base map only.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch()
            }}
            disabled={isFetching}
          >
            Retry
          </Button>
        </div>
      ) : null}
      <div
        className={cn(
          'relative w-full overflow-hidden transition-[height] duration-[900ms] ease-in-out motion-reduce:transition-none',
          mapHeightClass,
        )}
      >
        <WorldMapRenderer
          compact={compact}
          projection={projection}
          geography={countriesGeoData}
          shouldIncludeCountry={(country) => {
            if (country.isoNumericCode === antarcticaIsoNumericCode) {
              return false
            }

            return country.name !== 'Antarctica'
          }}
          getCountryFill={(country) => {
            const stats = resolveCountryStats(country)
            const beanCount = stats?.beanCount ?? 0
            const isHovered = hoveredCountry?.isoNumericCode === country.isoNumericCode
            return getCountryFill(beanCount, maxBeanCount, isHovered)
          }}
          getCountryStrokeWidth={(country) =>
            hoveredCountry?.isoNumericCode === country.isoNumericCode ? 0.9 : 0.45
          }
          onCountryPointerEnter={(country, pointer) => {
            setHoveredCountry(toHoveredCountry(country, pointer))
          }}
          onCountryPointerMove={(country, pointer) => {
            const hovered = toHoveredCountry(country, pointer)
            if (!hovered) {
              return
            }

            setHoveredCountry((current) => {
              if (!current || current.isoNumericCode !== country.isoNumericCode) {
                return hovered
              }

              return {
                ...current,
                x: hovered.x,
                y: hovered.y,
              }
            })
          }}
          onCountryPointerLeave={(country) => {
            setHoveredCountry((current) => {
              if (current?.isoNumericCode === country.isoNumericCode) {
                return null
              }

              return current
            })
          }}
          onCountryClick={(country) => {
            const stats = resolveCountryStats(country)
            if (!stats?.countryId) {
              return
            }

            setHoveredCountry(null)
            onCountryClick?.({
              countryId: stats.countryId,
              countryName: stats.countryName ?? country.name,
              isoNumericCode: country.isoNumericCode,
            })
          }}
        />
      </div>
      {hoveredCountry ? (
        <WorldMapTooltip
          x={hoveredCountry.x}
          y={hoveredCountry.y}
          countryName={hoveredCountry.countryName}
          beanCount={hoveredCountry.beanCount}
          totalBagWeightGrams={hoveredCountry.totalBagWeightGrams}
          avgBrewRating={hoveredCountry.avgBrewRating}
          totalBrews={hoveredCountry.totalBrews}
        />
      ) : null}
    </section>
  )
}

export const WorldMap = memo(WorldMapComponent)
