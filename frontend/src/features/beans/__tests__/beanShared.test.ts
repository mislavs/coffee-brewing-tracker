import { describe, expect, it } from 'vitest'
import {
  toDateInputValue,
  toOriginTypeValue,
  toRoastProfileValue,
} from '@/features/beans/beanShared'

describe('beanShared helpers', () => {
  describe('toOriginTypeValue', () => {
    it('supports numeric values and string aliases', () => {
      expect(toOriginTypeValue(0)).toBe(0)
      expect(toOriginTypeValue(1)).toBe(1)
      expect(toOriginTypeValue('single-origin')).toBe(0)
      expect(toOriginTypeValue('Single_Origin')).toBe(0)
      expect(toOriginTypeValue('blend')).toBe(1)
    })

    it('returns undefined for unknown values', () => {
      expect(toOriginTypeValue('other')).toBeUndefined()
      expect(toOriginTypeValue(2)).toBeUndefined()
    })
  })

  describe('toRoastProfileValue', () => {
    it('supports numeric values and string aliases', () => {
      expect(toRoastProfileValue(0)).toBe(0)
      expect(toRoastProfileValue(1)).toBe(1)
      expect(toRoastProfileValue(2)).toBe(2)
      expect(toRoastProfileValue(3)).toBe(3)
      expect(toRoastProfileValue('filter')).toBe(0)
      expect(toRoastProfileValue('espresso')).toBe(1)
      expect(toRoastProfileValue('omni')).toBe(2)
    })

    it('returns undefined for unknown values', () => {
      expect(toRoastProfileValue('dark')).toBeUndefined()
      expect(toRoastProfileValue(4)).toBeUndefined()
    })
  })

  describe('toDateInputValue', () => {
    it('supports string values', () => {
      expect(toDateInputValue('2025-03-05')).toBe('2025-03-05')
      expect(toDateInputValue('2025-03-05T14:30:00')).toBe('2025-03-05')
    })

    it('supports Date and date-only object values', () => {
      expect(toDateInputValue(new Date('2025-03-05T00:00:00.000Z'))).toBe('2025-03-05')
      expect(toDateInputValue({ year: 2025, month: 3, day: 5 })).toBe('2025-03-05')
    })

    it('returns undefined for empty and invalid values', () => {
      expect(toDateInputValue(undefined)).toBeUndefined()
      expect(toDateInputValue(null)).toBeUndefined()
      expect(toDateInputValue('   ')).toBeUndefined()
      expect(toDateInputValue(new Date('bad'))).toBeUndefined()
    })
  })
})
