import { describe, expect, it } from 'vitest'
import { tryParseGuid } from '@/lib/guid'

describe('tryParseGuid', () => {
  it('parses valid GUID values', () => {
    expect(tryParseGuid('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    )
    expect(tryParseGuid('550E8400-E29B-41D4-A716-446655440000')).toBe(
      '550E8400-E29B-41D4-A716-446655440000',
    )
  })

  it('returns trimmed GUID values', () => {
    expect(tryParseGuid(' 550e8400-e29b-41d4-a716-446655440000 ')).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    )
  })

  it('returns null for invalid values', () => {
    expect(tryParseGuid(undefined)).toBeNull()
    expect(tryParseGuid('')).toBeNull()
    expect(tryParseGuid('550e8400e29b41d4a716446655440000')).toBeNull()
    expect(tryParseGuid('550e8400-e29b-41d4-a716-44665544000')).toBeNull()
  })
})
