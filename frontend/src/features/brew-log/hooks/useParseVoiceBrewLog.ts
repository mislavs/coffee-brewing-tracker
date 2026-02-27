import { useMutation } from '@tanstack/react-query'
import type { ParseVoiceBrewLogResponse } from '@/lib/api/schemas'
import { apiClient } from '@/lib/api-client'

export function useParseVoiceBrewLog() {
  return useMutation<ParseVoiceBrewLogResponse | undefined, Error, Blob>({
    mutationFn: (audioBlob: Blob) => apiClient.api.brewLogs.parseVoice(audioBlob),
  })
}
