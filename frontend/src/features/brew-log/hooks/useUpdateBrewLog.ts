import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateBrewLogRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'

type UpdateBrewLogInput = {
  id: Guid
  request: UpdateBrewLogRequest
}

export function useUpdateBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateBrewLogInput) =>
      apiClient.api.brewLogs.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
      queryClient.invalidateQueries({ queryKey: beanQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: brewLogQueryKeys.detail(variables.id),
      })
      toast.success('Brew log updated.')
    },
  })
}
