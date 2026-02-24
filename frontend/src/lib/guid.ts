import type { Guid } from '@microsoft/kiota-abstractions'

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function tryParseGuid(value: string | undefined): Guid | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!guidPattern.test(trimmed)) {
    return null
  }

  return trimmed as Guid
}
