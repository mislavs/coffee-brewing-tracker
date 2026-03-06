import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  toDisplayDate,
  toDisplayDateTime,
  toIsoDate,
  toIsoDateTime,
} from '@/lib/date'

describe('date utilities', () => {
  describe('formatDate', () => {
    it('returns placeholder for nullish or invalid values', () => {
      expect(formatDate(null)).toBe('—')
      expect(formatDate(undefined)).toBe('—')
      expect(formatDate('not-a-date')).toBe('—')
    })

    it('formats ISO date strings and date-only objects', () => {
      expect(formatDate('2025-03-05')).toBe('05.03.2025')
      expect(formatDate({ year: 2025, month: 3, day: 5 })).toBe('05.03.2025')
    })

    it('formats Date instances', () => {
      expect(formatDate(new Date(2025, 2, 5))).toBe('05.03.2025')
    })
  })

  describe('formatDateTime', () => {
    it('formats valid date-time values and returns placeholder for invalid values', () => {
      expect(formatDateTime('2025-03-05T14:30:45')).toBe('05.03.2025 14:30')
      expect(formatDateTime('bad-value')).toBe('—')
    })
  })

  describe('toDisplayDate', () => {
    it('returns empty string for empty values', () => {
      expect(toDisplayDate(undefined)).toBe('')
      expect(toDisplayDate('   ')).toBe('')
    })

    it('converts ISO date to display date', () => {
      expect(toDisplayDate('2025-03-05')).toBe('05.03.2025')
    })
  })

  describe('toIsoDate', () => {
    it('returns undefined for empty or invalid values', () => {
      expect(toIsoDate(undefined)).toBeUndefined()
      expect(toIsoDate('   ')).toBeUndefined()
      expect(toIsoDate('2025-02-30')).toBeUndefined()
      expect(toIsoDate('31.02.2025')).toBeUndefined()
    })

    it('supports ISO and display date formats', () => {
      expect(toIsoDate('2025-03-05')).toBe('2025-03-05')
      expect(toIsoDate('05.03.2025')).toBe('2025-03-05')
    })
  })

  describe('toDisplayDateTime', () => {
    it('returns empty string for empty or invalid values', () => {
      expect(toDisplayDateTime(undefined)).toBe('')
      expect(toDisplayDateTime('bad-value')).toBe('')
    })

    it('supports ISO and display date-time formats', () => {
      expect(toDisplayDateTime('2025-03-05T14:30:59.123')).toBe('05.03.2025 14:30')
      expect(toDisplayDateTime('05.03.2025 14:30')).toBe('05.03.2025 14:30')
    })
  })

  describe('toIsoDateTime', () => {
    it('returns undefined for empty or invalid values', () => {
      expect(toIsoDateTime(undefined)).toBeUndefined()
      expect(toIsoDateTime('   ')).toBeUndefined()
      expect(toIsoDateTime('05.03.2025 25:30')).toBeUndefined()
      expect(toIsoDateTime('31.02.2025 14:30')).toBeUndefined()
    })

    it('supports ISO and display date-time formats', () => {
      expect(toIsoDateTime('2025-03-05T14:30:59')).toBe('2025-03-05T14:30')
      expect(toIsoDateTime('05.03.2025 14:30')).toBe('2025-03-05T14:30')
    })
  })
})
