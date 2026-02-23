import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateBrewLogRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useCreateBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateBrewLogRequest) =>
      apiClient.api.brewLogs.post(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
      queryClient.invalidateQueries({ queryKey: beanQueryKeys.all })
      toast.success('Brew logged.')
    },
  })
}
