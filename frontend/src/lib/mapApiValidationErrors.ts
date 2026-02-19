export type ValidationPayload = {
  message?: string
  Message?: string
  errors?: Record<string, string[]>
  Errors?: Record<string, string[]>
}

export function extractValidationPayload(error: unknown): ValidationPayload | null {
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

export function normalizeApiFieldName(fieldName: string) {
  return fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
}
