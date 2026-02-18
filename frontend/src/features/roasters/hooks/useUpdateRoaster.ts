import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateRoasterRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'

type UpdateRoasterInput = {
  id: Guid
  request: UpdateRoasterRequest
}

export function useUpdateRoaster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateRoasterInput) =>
      apiClient.api.roasters.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: roasterQueryKeys.detail(variables.id),
      })
      toast.success('Roaster updated.')
    },
  })
}
