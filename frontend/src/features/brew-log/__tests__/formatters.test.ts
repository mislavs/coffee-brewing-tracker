import { describe, expect, it } from 'vitest'
import {
  formatBrewTime,
  formatRatio,
  getRatingDisplay,
} from '@/features/brew-log/formatters'

describe('brew-log formatters', () => {
  describe('formatRatio', () => {
    it('formats positive values', () => {
      expect(formatRatio(16)).toBe('1:16.0')
      expect(formatRatio(16.37)).toBe('1:16.4')
    })

    it('returns placeholder for invalid values', () => {
      expect(formatRatio(0)).toBe('—')
      expect(formatRatio(-1)).toBe('—')
      expect(formatRatio(Number.NaN)).toBe('—')
      expect(formatRatio(null)).toBe('—')
      expect(formatRatio(undefined)).toBe('—')
    })
  })

  describe('formatBrewTime', () => {
    it('formats seconds into m:ss', () => {
      expect(formatBrewTime(210)).toBe('3:30')
      expect(formatBrewTime(0)).toBe('0:00')
    })

    it('returns placeholder for invalid values', () => {
      expect(formatBrewTime(-1)).toBe('—')
      expect(formatBrewTime(null)).toBe('—')
      expect(formatBrewTime(undefined)).toBe('—')
    })
  })

  describe('getRatingDisplay', () => {
    it('returns emoji for ratings 1 through 5', () => {
      expect(getRatingDisplay(1)).toBe('😞')
      expect(getRatingDisplay(2)).toBe('🙁')
      expect(getRatingDisplay(3)).toBe('😐')
      expect(getRatingDisplay(4)).toBe('🙂')
      expect(getRatingDisplay(5)).toBe('🤩')
    })

    it('returns placeholder for out-of-range values', () => {
      expect(getRatingDisplay(0)).toBe('—')
      expect(getRatingDisplay(6)).toBe('—')
      expect(getRatingDisplay(null)).toBe('—')
      expect(getRatingDisplay(undefined)).toBe('—')
    })
  })
})
