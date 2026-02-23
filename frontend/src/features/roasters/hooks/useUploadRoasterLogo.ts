import type { Guid } from '@microsoft/kiota-abstractions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roasterQueryKeys } from '@/features/roasters/queryKeys'
import { API_URL } from '@/lib/config'

type UploadRoasterLogoInput = {
  id: Guid
  file: File
}

export function useUploadRoasterLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file }: UploadRoasterLogoInput) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/api/roasters/${id}/logo`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw await buildApiError(response, 'Unable to upload roaster logo.')
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: roasterQueryKeys.all })
      await queryClient.invalidateQueries({
        queryKey: roasterQueryKeys.detail(variables.id),
      })
      toast.success('Roaster logo updated.')
    },
  })
}

async function buildApiError(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as {
      title?: unknown
      errors?: Record<string, string[]>
    }

    if (payload.errors) {
      const firstError = Object.values(payload.errors).flat()[0]
      if (typeof firstError === 'string') {
        return new Error(firstError)
      }
    }

    if (typeof payload.title === 'string' && payload.title.trim().length > 0) {
      return new Error(payload.title)
    }
  } catch {
    // Ignore parse errors and use fallback message.
  }

  return new Error(fallbackMessage)
}
