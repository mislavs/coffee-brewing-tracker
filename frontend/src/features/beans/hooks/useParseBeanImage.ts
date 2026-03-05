import { useMutation } from '@tanstack/react-query'
import type { ParseBeanImageResponse } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'

export function useParseBeanImage() {
  return useMutation<ParseBeanImageResponse | undefined, Error, File>({
    mutationFn: (imageFile: File) => apiClient.api.beans.parseImage(imageFile),
  })
}
