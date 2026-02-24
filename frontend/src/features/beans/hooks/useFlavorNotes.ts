import { useQuery } from '@tanstack/react-query'
import type { FlavorNoteDto } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'
import { flavorNoteQueryKeys } from '@/features/beans/queryKeys'

export function useFlavorNotes() {
  return useQuery({
    queryKey: flavorNoteQueryKeys.all,
    queryFn: async (): Promise<FlavorNoteDto[]> =>
      (await apiClient.api.flavorNotes.get()) ?? [],
  })
}
