import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateBrewerRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { brewerQueryKeys } from '@/features/equipment/queryKeys'

export function useCreateBrewer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateBrewerRequest) =>
      apiClient.api.brewers.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brewerQueryKeys.all })
      toast.success('Brewer created.')
    },
  })
}
