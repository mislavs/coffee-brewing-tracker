import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateGrinderRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { grinderQueryKeys } from '@/features/equipment/queryKeys'

type UpdateGrinderInput = {
  id: Guid
  request: UpdateGrinderRequest
}

export function useUpdateGrinder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateGrinderInput) =>
      apiClient.api.grinders.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: grinderQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: grinderQueryKeys.detail(variables.id),
      })
      toast.success('Grinder updated.')
    },
  })
}
