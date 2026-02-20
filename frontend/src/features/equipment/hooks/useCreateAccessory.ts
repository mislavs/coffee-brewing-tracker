import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateAccessoryRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { accessoryQueryKeys } from '@/features/equipment/queryKeys'

export function useCreateAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateAccessoryRequest) =>
      apiClient.api.accessories.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoryQueryKeys.all })
      toast.success('Accessory created.')
    },
  })
}
