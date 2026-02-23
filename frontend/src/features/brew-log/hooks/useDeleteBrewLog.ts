import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Guid } from '@microsoft/kiota-abstractions'
import { apiClient } from '@/lib/api-client'
import { beanQueryKeys } from '@/features/beans/queryKeys'

export function useDeleteBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: Guid) => apiClient.api.brewLogs.byId(id).delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
      queryClient.invalidateQueries({ queryKey: beanQueryKeys.all })
      toast.success('Brew log deleted.')
    },
  })
}
