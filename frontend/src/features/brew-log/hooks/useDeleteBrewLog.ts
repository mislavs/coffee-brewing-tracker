import type { Guid } from '@microsoft/kiota-abstractions'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

export function useDeleteBrewLog() {
  return useEntityMutation<Guid>({
    mutationFn: (id) => apiClient.api.brewLogs.byId(id).delete(),
    invalidateKeys: [brewLogQueryKeys.root, beanQueryKeys.all],
    successMessage: 'Brew log deleted.',
  })
}
