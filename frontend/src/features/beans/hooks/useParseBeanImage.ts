import { useMutation } from '@tanstack/react-query'
import type { ParseBeanImageResponse } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'

export function useParseBeanImage() {
  return useMutation<ParseBeanImageResponse | undefined, Error, File>({
    // Parsing returns a draft DTO only; no cached bean data changes.
    mutationFn: (imageFile: File) => apiClient.api.beans.parseImage(imageFile),
  })
}
