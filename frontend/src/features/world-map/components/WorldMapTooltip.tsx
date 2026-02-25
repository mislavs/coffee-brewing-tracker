const wholeNumberFormatter = new Intl.NumberFormat()
const oneDecimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

type WorldMapTooltipProps = {
  x: number
  y: number
  countryName: string
  beanCount: number
  totalBagWeightGrams: number
  avgBrewRating: number | null | undefined
  totalBrews: number
}

function formatBagWeight(totalBagWeightGrams: number) {
  if (totalBagWeightGrams >= 1_000) {
    return `${oneDecimalFormatter.format(totalBagWeightGrams / 1_000)} kg`
  }

  return `${wholeNumberFormatter.format(Math.round(totalBagWeightGrams))} g`
}

export function WorldMapTooltip({
  x,
  y,
  countryName,
  beanCount,
  totalBagWeightGrams,
  avgBrewRating,
  totalBrews,
}: WorldMapTooltipProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 w-56 rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
      style={{
        left: `${x + 14}px`,
        top: `${y + 14}px`,
      }}
    >
      <p className="mb-2 text-sm font-semibold">{countryName}</p>
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Beans</dt>
          <dd>{wholeNumberFormatter.format(beanCount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Total weight</dt>
          <dd>{formatBagWeight(totalBagWeightGrams)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Avg rating</dt>
          <dd>
            {avgBrewRating === null || avgBrewRating === undefined
              ? 'No ratings'
              : oneDecimalFormatter.format(avgBrewRating)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Total brews</dt>
          <dd>{wholeNumberFormatter.format(totalBrews)}</dd>
        </div>
      </dl>
    </div>
  )
}
