import { describe, expect, it } from 'vitest'
import {
  formatDecimal,
  formatOriginType,
  formatPrice,
  formatPricePerKg,
  formatRoastProfile,
} from '@/features/beans/formatters'

describe('beans formatters', () => {
  describe('formatOriginType', () => {
    it('formats known and unknown values', () => {
      expect(formatOriginType(0)).toBe('Single Origin')
      expect(formatOriginType(1)).toBe('Blend')
      expect(formatOriginType(99)).toBe('Unknown')
    })

    it('returns placeholder for nullish values', () => {
      expect(formatOriginType(null)).toBe('—')
      expect(formatOriginType(undefined)).toBe('—')
    })
  })

  describe('formatRoastProfile', () => {
    it('formats known and unknown values', () => {
      expect(formatRoastProfile(0)).toBe('Filter')
      expect(formatRoastProfile(1)).toBe('Espresso')
      expect(formatRoastProfile(2)).toBe('Omni')
      expect(formatRoastProfile(3)).toBe('Unknown')
      expect(formatRoastProfile(99)).toBe('Unknown')
    })

    it('returns placeholder for nullish values', () => {
      expect(formatRoastProfile(null)).toBe('—')
      expect(formatRoastProfile(undefined)).toBe('—')
    })
  })

  describe('formatDecimal', () => {
    it('formats numbers using local number formatting', () => {
      const expected = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(1234.567)
      expect(formatDecimal(1234.567)).toBe(expected)
    })

    it('returns placeholder for nullish values', () => {
      expect(formatDecimal(null)).toBe('—')
      expect(formatDecimal(undefined)).toBe('—')
    })
  })

  describe('formatPrice and formatPricePerKg', () => {
    it('formats non-null values with expected suffix', () => {
      expect(formatPrice(14.2).endsWith(' €')).toBe(true)
      expect(formatPricePerKg(28.4).endsWith(' € / kg')).toBe(true)
    })

    it('returns fallback values for nullish values', () => {
      expect(formatPrice(null)).toBe('—')
      expect(formatPricePerKg(undefined)).toBe('—')
      expect(formatPricePerKg(undefined, 'n/a')).toBe('n/a')
    })
  })
})
