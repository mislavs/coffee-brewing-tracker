export function normalizeOptional(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const errorRecord = error as { message?: unknown }
  return typeof errorRecord.message === 'string' ? errorRecord.message : undefined
}
