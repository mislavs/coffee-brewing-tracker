export const statsQueryKeys = {
  all: ['stats'] as const,
  dashboard: ['stats', 'dashboard'] as const,
  countryMap: ['stats', 'country-map'] as const,
  coffeeConsumption: (
    from: string,
    to: string,
    granularity: number,
    timeZone: string,
  ) =>
    ['stats', 'coffee-consumption', from, to, granularity, timeZone] as const,
}
