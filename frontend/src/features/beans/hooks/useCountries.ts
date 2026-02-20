import { useQuery } from '@tanstack/react-query'
import type { CountryDto } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { countryQueryKeys } from '@/features/beans/queryKeys'

export function useCountries() {
  return useQuery({
    queryKey: countryQueryKeys.all,
    queryFn: async (): Promise<CountryDto[]> =>
      (await apiClient.api.countries.get()) ?? [],
  })
}
