export type ValidationPayload = {
  title?: string
  errors?: Record<string, string[]>
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

  if (
    (errorRecord.title && typeof errorRecord.title === 'string') ||
    (errorRecord.errors && typeof errorRecord.errors === 'object')
  ) {
    return errorRecord as ValidationPayload
  }

  return null
}

export function normalizeApiFieldName(fieldName: string) {
  return fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
}
