import { describe, expect, it } from 'vitest'
import { optionalTrimmedStringSchema } from '@/lib/zodUtils'

describe('optionalTrimmedStringSchema', () => {
  it('trims non-empty strings', () => {
    expect(optionalTrimmedStringSchema.parse('  text  ')).toBe('text')
  })

  it('normalizes empty strings to undefined', () => {
    expect(optionalTrimmedStringSchema.parse('')).toBeUndefined()
    expect(optionalTrimmedStringSchema.parse('   ')).toBeUndefined()
  })

  it('accepts undefined', () => {
    expect(optionalTrimmedStringSchema.parse(undefined)).toBeUndefined()
  })
})
