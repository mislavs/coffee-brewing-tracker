import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateRoasterRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'

export function useCreateRoaster() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateRoasterRequest) =>
      apiClient.api.roasters.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      toast.success('Roaster created.')
    },
  })
}
