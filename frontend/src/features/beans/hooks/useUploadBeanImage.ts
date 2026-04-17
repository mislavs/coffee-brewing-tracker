import type { Guid } from '@/lib/api-types'
import { beanQueryKeys } from '@/features/beans/queryKeys'
import { apiClient } from '@/lib/api-client'
import { useEntityMutation } from '@/lib/useEntityMutation'

type UploadBeanImageInput = {
  id: Guid
  file: File
  silent?: boolean
}

export function useUploadBeanImage() {
  return useEntityMutation<UploadBeanImageInput>({
    mutationFn: ({ id, file }: UploadBeanImageInput) =>
      apiClient.api.beans.byId(id).image.put(file),
    invalidateKeys: (variables) => [
      beanQueryKeys.all,
      beanQueryKeys.detail(variables.id),
    ],
    successMessage: 'Bean image updated.',
    shouldToast: (variables) => !variables.silent,
  })
}
