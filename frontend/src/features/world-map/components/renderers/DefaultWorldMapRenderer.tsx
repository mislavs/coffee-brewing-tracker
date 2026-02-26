import { type MouseEvent } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
} from '@vnedyalk0v/react19-simple-maps'
import type {
  WorldCountryFeature,
  WorldMapRendererProps,
} from '@/features/world-map/components/renderers/types'

type GeographyFeature = {
  id?: string | number
  rsmKey: string
  properties?: {
    name?: string
  }
}

function normalizeIsoNumericCode(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalizedValue = String(value).trim()
  if (!normalizedValue) {
    return ''
  }

  return normalizedValue.padStart(3, '0')
}

function toWorldCountryFeature(geography: GeographyFeature): WorldCountryFeature {
  return {
    key: geography.rsmKey,
    isoNumericCode: normalizeIsoNumericCode(geography.id),
    name: geography.properties?.name ?? 'Unknown country',
  }
}

export function DefaultWorldMapRenderer({
  compact = false,
  projection = 'geoMercator',
  geography,
  shouldIncludeCountry,
  getCountryFill,
  getCountryStrokeWidth,
  onCountryPointerEnter,
  onCountryPointerMove,
  onCountryPointerLeave,
}: WorldMapRendererProps) {
  return (
    <ComposableMap
      key={projection}
      projection={projection}
      projectionConfig={{ scale: compact ? 280 : 220 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Geographies geography={geography}>
        {({ geographies }) =>
          geographies
            .map((geo) => ({ geo, country: toWorldCountryFeature(geo as GeographyFeature) }))
            .filter(({ country }) =>
              shouldIncludeCountry ? shouldIncludeCountry(country) : true,
            )
            .map(({ geo, country }) => (
              <Geography
                key={country.key}
                geography={geo}
                fill={getCountryFill(country)}
                stroke="var(--border)"
                strokeWidth={getCountryStrokeWidth ? getCountryStrokeWidth(country) : 0.45}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
                onMouseEnter={(event: MouseEvent<SVGPathElement>) => {
                  onCountryPointerEnter?.(country, {
                    x: event.clientX,
                    y: event.clientY,
                  })
                }}
                onMouseMove={(event: MouseEvent<SVGPathElement>) => {
                  onCountryPointerMove?.(country, {
                    x: event.clientX,
                    y: event.clientY,
                  })
                }}
                onMouseLeave={() => {
                  onCountryPointerLeave?.(country)
                }}
              />
            ))
        }
      </Geographies>
    </ComposableMap>
  )
}
