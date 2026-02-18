import type { UseFormSetError } from 'react-hook-form'
import type { RoasterFormValues } from '@/features/roasters/roasterFormSchema'

type ValidationPayload = {
  message?: string
  Message?: string
  errors?: Record<string, string[]>
  Errors?: Record<string, string[]>
}

function extractValidationPayload(error: unknown): ValidationPayload | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const errorRecord = error as Record<string, unknown>

  const fromResponseBody = errorRecord.responseBody
  if (fromResponseBody && typeof fromResponseBody === 'object') {
    return fromResponseBody as ValidationPayload
  }

  if (typeof errorRecord.message === 'string') {
    try {
      return JSON.parse(errorRecord.message) as ValidationPayload
    } catch {
      return null
    }
  }

  if (
    (errorRecord.errors && typeof errorRecord.errors === 'object') ||
    (errorRecord.Errors && typeof errorRecord.Errors === 'object')
  ) {
    return errorRecord as ValidationPayload
  }

  return null
}

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
      const normalizedFieldName =
        fieldName.charAt(0).toLowerCase() + fieldName.slice(1)

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
