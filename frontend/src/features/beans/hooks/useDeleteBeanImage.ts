import type { Guid } from '@/lib/api-types'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

type DeleteBeanImageInput = {
  id: Guid
  silent?: boolean
}

export function useDeleteBeanImage() {
  return useEntityMutation<DeleteBeanImageInput>({
    mutationFn: ({ id }: DeleteBeanImageInput) =>
      apiClient.api.beans.byId(id).image.delete(),
    invalidateKeys: (variables) => [
      beanQueryKeys.all,
      beanQueryKeys.detail(variables.id),
    ],
    successMessage: 'Bean image removed.',
    shouldToast: (variables) => !variables.silent,
  })
}
