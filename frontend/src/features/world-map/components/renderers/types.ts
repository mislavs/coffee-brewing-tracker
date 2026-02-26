export const worldMapProjectionOptions = [
  'geoEquirectangular',
  'geoNaturalEarth1',
  'geoEqualEarth',
  'geoMercator',
  'geoConicEquidistant',
  'geoAlbers',
  'geoAlbersUsa',
  'geoAzimuthalEqualArea',
  'geoAzimuthalEquidistant',
  'geoConicConformal',
  'geoConicEqualArea',
  'geoGnomonic',
  'geoIdentity',
  'geoOrthographic',
  'geoStereographic',
  'geoTransverseMercator',
] as const

export type WorldMapProjection = (typeof worldMapProjectionOptions)[number]

export type MapPointer = {
  x: number
  y: number
}

export type WorldCountryFeature = {
  key: string
  isoNumericCode: string
  name: string
}

export type WorldMapRendererProps = {
  compact?: boolean
  projection?: WorldMapProjection
  geography: string | Record<string, unknown>
  shouldIncludeCountry?: (country: WorldCountryFeature) => boolean
  getCountryFill: (country: WorldCountryFeature) => string
  getCountryStrokeWidth?: (country: WorldCountryFeature) => number
  onCountryPointerEnter?: (country: WorldCountryFeature, pointer: MapPointer) => void
  onCountryPointerMove?: (country: WorldCountryFeature, pointer: MapPointer) => void
  onCountryPointerLeave?: (country: WorldCountryFeature) => void
}
