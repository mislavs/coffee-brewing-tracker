import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateBrewLogRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UpdateBrewLogInput = {
  id: Guid
  request: UpdateBrewLogRequest
}

export function useUpdateBrewLog() {
  return useEntityMutation<UpdateBrewLogInput>({
    mutationFn: ({ id, request }) => apiClient.api.brewLogs.byId(id).put(request),
    invalidateKeys: (variables) => [
      brewLogQueryKeys.root,
      beanQueryKeys.all,
      brewLogQueryKeys.detail(variables.id),
    ],
    successMessage: 'Brew log updated.',
  })
}
