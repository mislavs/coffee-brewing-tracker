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
  geography: string | Record<string, unknown>
  shouldIncludeCountry?: (country: WorldCountryFeature) => boolean
  getCountryFill: (country: WorldCountryFeature) => string
  getCountryStrokeWidth?: (country: WorldCountryFeature) => number
  onCountryPointerEnter?: (country: WorldCountryFeature, pointer: MapPointer) => void
  onCountryPointerMove?: (country: WorldCountryFeature, pointer: MapPointer) => void
  onCountryPointerLeave?: (country: WorldCountryFeature) => void
}
