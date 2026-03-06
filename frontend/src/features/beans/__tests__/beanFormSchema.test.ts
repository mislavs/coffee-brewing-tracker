import { describe, expect, it } from 'vitest'
import {
  beanFormSchema,
  normalizeDistinctNameList,
  toOptionalDateOnly,
} from '@/features/beans/beanFormSchema'

const roasterId = '11111111-1111-1111-1111-111111111111'

function buildInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test bean',
    roasterId,
    originType: '0',
    originCountries: ['Brazil'],
    variety: 'Bourbon',
    processingMethod: 'Washed',
    roastProfile: '2',
    roastDate: '2025-03-05',
    altitude: '1200',
    bagWeight: '250',
    price: '14.5',
    isAvailable: true,
    flavorNoteNames: ['Chocolate'],
    ...overrides,
  }
}

describe('beanFormSchema', () => {
  it('coerces numeric enum-like fields from strings', () => {
    const result = beanFormSchema.safeParse(buildInput())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.originType).toBe(0)
      expect(result.data.roastProfile).toBe(2)
    }
  })

  it('rejects out-of-range originType and roastProfile values', () => {
    expect(beanFormSchema.safeParse(buildInput({ originType: 2 })).success).toBe(false)
    expect(beanFormSchema.safeParse(buildInput({ roastProfile: 4 })).success).toBe(false)
  })

  it('normalizes optional positive numbers', () => {
    const emptyResult = beanFormSchema.safeParse(buildInput({ price: '' }))
    expect(emptyResult.success).toBe(true)
    if (emptyResult.success) {
      expect(emptyResult.data.price).toBeUndefined()
    }

    const stringResult = beanFormSchema.safeParse(buildInput({ price: '14.5' }))
    expect(stringResult.success).toBe(true)
    if (stringResult.success) {
      expect(stringResult.data.price).toBe(14.5)
    }

    expect(beanFormSchema.safeParse(buildInput({ price: 0 })).success).toBe(false)
    expect(beanFormSchema.safeParse(buildInput({ price: -1 })).success).toBe(false)
  })

  it('normalizes optional positive integers', () => {
    const emptyResult = beanFormSchema.safeParse(buildInput({ altitude: '' }))
    expect(emptyResult.success).toBe(true)
    if (emptyResult.success) {
      expect(emptyResult.data.altitude).toBeUndefined()
    }

    const stringResult = beanFormSchema.safeParse(buildInput({ altitude: '1200' }))
    expect(stringResult.success).toBe(true)
    if (stringResult.success) {
      expect(stringResult.data.altitude).toBe(1200)
    }

    expect(beanFormSchema.safeParse(buildInput({ altitude: 1.5 })).success).toBe(false)
  })

  it('normalizes optional roastDate values', () => {
    const emptyResult = beanFormSchema.safeParse(buildInput({ roastDate: '' }))
    expect(emptyResult.success).toBe(true)
    if (emptyResult.success) {
      expect(emptyResult.data.roastDate).toBeUndefined()
    }

    expect(beanFormSchema.safeParse(buildInput({ roastDate: '2025-03-05' })).success).toBe(
      true,
    )
    expect(beanFormSchema.safeParse(buildInput({ roastDate: '03/05/2025' })).success).toBe(
      false,
    )
  })

  it('requires positive bagWeight after preprocessing', () => {
    expect(beanFormSchema.safeParse(buildInput({ bagWeight: '' })).success).toBe(false)

    const stringResult = beanFormSchema.safeParse(buildInput({ bagWeight: '250' }))
    expect(stringResult.success).toBe(true)
    if (stringResult.success) {
      expect(stringResult.data.bagWeight).toBe(250)
    }

    expect(beanFormSchema.safeParse(buildInput({ bagWeight: 0 })).success).toBe(false)
  })

  it('applies defaults for omitted array and boolean fields', () => {
    const result = beanFormSchema.safeParse(
      buildInput({
        originCountries: undefined,
        flavorNoteNames: undefined,
        isAvailable: undefined,
      }),
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.originCountries).toEqual([])
      expect(result.data.flavorNoteNames).toEqual([])
      expect(result.data.isAvailable).toBe(true)
    }
  })
})

describe('beanFormSchema helpers', () => {
  describe('normalizeDistinctNameList', () => {
    it('trims values, removes blanks and deduplicates case-insensitively', () => {
      expect(
        normalizeDistinctNameList([
          ' Chocolate ',
          'chocolate',
          '   ',
          'Berry',
          'berry',
          ' Citrus',
        ]),
      ).toEqual(['Chocolate', 'Berry', 'Citrus'])
    })
  })

  describe('toOptionalDateOnly', () => {
    it('returns undefined for empty values', () => {
      expect(toOptionalDateOnly(undefined)).toBeUndefined()
      expect(toOptionalDateOnly('')).toBeUndefined()
    })

    it('returns value for valid date strings', () => {
      expect(toOptionalDateOnly('2025-03-05')).toBe('2025-03-05')
    })
  })
})
