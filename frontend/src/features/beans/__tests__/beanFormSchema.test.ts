import { describe, expect, it } from 'vitest'
import {
  normalizeDistinctNameList,
  toOptionalDateOnly,
} from '@/features/beans/beanFormSchema'

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
