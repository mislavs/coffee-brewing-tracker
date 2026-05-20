import type { Guid } from '@/lib/api-types'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { statsQueryKeys } from '@/features/stats/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useDeleteBrewLog() {
  return useEntityMutation<Guid>({
    mutationFn: (id) => apiClient.api.brewLogs.byId(id).delete(),
    invalidateKeys: [
      brewLogQueryKeys.root,
      beanQueryKeys.all,
      statsQueryKeys.dashboard,
      statsQueryKeys.countryMap,
    ],
    successMessage: 'Brew log deleted.',
  })
}
