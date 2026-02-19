import type { UseFormSetError } from 'react-hook-form'
import type { RoasterFormValues } from '@/features/roasters/roasterFormSchema'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

export function applyRoasterFormServerErrors(
  error: unknown,
  setError: UseFormSetError<RoasterFormValues>,
) {
  const payload = extractValidationPayload(error)
  if (!payload) {
    setError('root.serverError', {
      message: 'Unable to save roaster. Please try again.',
    })
    return
  }

  const validationErrors = payload.errors ?? payload.Errors
  if (validationErrors) {
    for (const [fieldName, messages] of Object.entries(validationErrors)) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)

      if (
        normalizedFieldName === 'name' ||
        normalizedFieldName === 'city' ||
        normalizedFieldName === 'country'
      ) {
        setError(normalizedFieldName, {
          message: messages[0] ?? 'Invalid value.',
        })
      }
    }
  }

  const message = payload.message ?? payload.Message
  if (message) {
    setError('root.serverError', { message })
  }
}
