import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateBrewerRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'

type UpdateBrewerInput = {
  id: Guid
  request: UpdateBrewerRequest
}

export function useUpdateBrewer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateBrewerInput) =>
      apiClient.api.brewers.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: brewerQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: brewerQueryKeys.detail(variables.id),
      })
      toast.success('Brewer updated.')
    },
  })
}
