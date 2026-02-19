import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Guid } from '@microsoft/kiota-abstractions'
import { toast } from 'sonner'
import type { UpdateBeanRequest } from '@/lib/api/generated/models/index.js'
import { apiClient } from '@/lib/api-client'
import {
  beanQueryKeys,
  countryQueryKeys,
  flavorNoteQueryKeys,
} from '@/features/beans/queryKeys'

type UpdateBeanInput = {
  id: Guid
  request: UpdateBeanRequest
}

export function useUpdateBean() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: UpdateBeanInput) =>
      apiClient.api.beans.byId(id).put(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: beanQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: beanQueryKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: countryQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: flavorNoteQueryKeys.all })
      toast.success('Bean updated.')
    },
  })
}
