import { describe, expect, it } from 'vitest'
import { getFieldErrorMessage, normalizeOptional } from '@/lib/formUtils'

describe('form utils', () => {
  describe('normalizeOptional', () => {
    it('returns trimmed value when non-empty', () => {
      expect(normalizeOptional('  hello  ')).toBe('hello')
    })

    it('returns undefined for empty values', () => {
      expect(normalizeOptional(undefined)).toBeUndefined()
      expect(normalizeOptional('')).toBeUndefined()
      expect(normalizeOptional('   ')).toBeUndefined()
    })
  })

  describe('getFieldErrorMessage', () => {
    it('returns string message from object errors', () => {
      expect(getFieldErrorMessage({ message: 'Required.' })).toBe('Required.')
    })

    it('returns undefined for unsupported values', () => {
      expect(getFieldErrorMessage(null)).toBeUndefined()
      expect(getFieldErrorMessage(undefined)).toBeUndefined()
      expect(getFieldErrorMessage('bad')).toBeUndefined()
      expect(getFieldErrorMessage({ message: 123 })).toBeUndefined()
    })
  })
})
