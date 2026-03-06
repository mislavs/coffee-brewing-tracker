import { describe, expect, it } from 'vitest'
import { normalizeIsoNumericCode } from '@/features/world-map/worldMapUtils'

describe('normalizeIsoNumericCode', () => {
  it('normalizes and left-pads to 3 digits', () => {
    expect(normalizeIsoNumericCode('4')).toBe('004')
    expect(normalizeIsoNumericCode(840)).toBe('840')
    expect(normalizeIsoNumericCode(' 56 ')).toBe('056')
  })

  it('returns empty string for nullish and empty values', () => {
    expect(normalizeIsoNumericCode(null)).toBe('')
    expect(normalizeIsoNumericCode(undefined)).toBe('')
    expect(normalizeIsoNumericCode('   ')).toBe('')
  })
})
