export function normalizeIsoNumericCode(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalizedValue = String(value).trim()
  if (!normalizedValue) {
    return ''
  }

  return normalizedValue.padStart(3, '0')
}
