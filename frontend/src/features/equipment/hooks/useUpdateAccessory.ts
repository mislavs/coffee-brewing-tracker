import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import type { UpdateAccessoryRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'

type UpdateAccessoryInput = {
  id: Guid
  request: UpdateAccessoryRequest
}

export function useUpdateAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateAccessoryInput) =>
      apiClient.api.accessories.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: accessoryQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: accessoryQueryKeys.detail(variables.id),
      })
      toast.success('Accessory updated.')
    },
  })
}
