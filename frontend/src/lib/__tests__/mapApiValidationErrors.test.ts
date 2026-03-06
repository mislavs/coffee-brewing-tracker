import { describe, expect, it, vi } from 'vitest'
import {
  applyFormServerErrors,
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

describe('mapApiValidationErrors', () => {
  describe('extractValidationPayload', () => {
    it('returns payload from responseBody shape', () => {
      const payload = {
        title: 'Validation failed',
        errors: { Name: ['Name is required.'] },
      }

      expect(extractValidationPayload({ responseBody: payload })).toEqual(payload)
    })

    it('returns payload from top-level error shape', () => {
      const payload = {
        title: 'Validation failed',
        errors: { Name: ['Name is required.'] },
      }

      expect(extractValidationPayload(payload)).toEqual(payload)
    })

    it('returns null for unsupported values', () => {
      expect(extractValidationPayload(null)).toBeNull()
      expect(extractValidationPayload('bad')).toBeNull()
    })
  })

  describe('normalizeApiFieldName', () => {
    it('normalizes leading character casing', () => {
      expect(normalizeApiFieldName('Name')).toBe('name')
      expect(normalizeApiFieldName('brewerId')).toBe('brewerId')
    })
  })

  describe('applyFormServerErrors', () => {
    it('applies fallback root error when payload cannot be extracted', () => {
      const setError = vi.fn()
      const result = applyFormServerErrors(
        null,
        setError as never,
        { entityName: 'bean' },
      )

      expect(result).toEqual({ payload: null })
      expect(setError).toHaveBeenCalledWith('root.serverError', {
        message: 'Unable to save bean. Please try again.',
      })
    })

    it('maps known fields and tracks first unhandled message', () => {
      const setError = vi.fn()
      const result = applyFormServerErrors(
        {
          title: 'Validation failed',
          errors: {
            Name: ['Name is required.'],
            UnknownField: ['Unknown is invalid.'],
          },
        },
        setError as never,
        {
          entityName: 'bean',
          fieldMap: {
            name: 'name',
          },
        },
      )

      expect(result.firstUnhandledValidationMessage).toBe('Unknown is invalid.')
      expect(setError).toHaveBeenCalledWith('name', { message: 'Name is required.' })
      expect(setError).toHaveBeenCalledWith('root.serverError', {
        message: 'Validation failed',
      })
    })

    it('can skip title-to-root mapping', () => {
      const setError = vi.fn()
      applyFormServerErrors(
        {
          title: 'Validation failed',
          errors: {},
        },
        setError as never,
        {
          entityName: 'bean',
          applyTitleToRoot: false,
        },
      )

      expect(setError).not.toHaveBeenCalled()
    })
  })
})
