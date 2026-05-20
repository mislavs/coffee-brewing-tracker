import type { CreateBrewLogRequest, CreateBrewLogResponse } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useCreateBrewLog() {
  return useEntityMutation<CreateBrewLogRequest, CreateBrewLogResponse | undefined>({
    mutationFn: (request) => apiClient.api.brewLogs.post(request),
    invalidateKeys: [
      brewLogQueryKeys.root,
      beanQueryKeys.all,
      statsQueryKeys.dashboard,
      statsQueryKeys.countryMap,
    ],
    successMessage: 'Brew logged.',
  })
}
