import { describe, expect, it } from 'vitest'
import type { BrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'
import { normalizeBrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'

const beanId = '11111111-1111-1111-1111-111111111111'
const brewerId = '22222222-2222-2222-2222-222222222222'
const grinderId = '33333333-3333-3333-3333-333333333333'
const recipeId = '44444444-4444-4444-4444-444444444444'
const accessoryId = '55555555-5555-5555-5555-555555555555'

function buildValues(
  overrides: Partial<BrewLogFormValues> = {},
): BrewLogFormValues {
  return {
    beanId,
    brewerId,
    grinderId,
    recipeId,
    accessoryIds: [],
    dose: 18,
    waterAmount: 300,
    waterTemperature: 94,
    grindSize: 'medium',
    brewTimeMinutes: 3,
    brewTimeSeconds: 30,
    rating: 4,
    tastingNotes: 'balanced',
    adjustmentIdeas: 'slightly finer',
    brewedAt: '2025-03-05T14:30:00.000Z',
    ...overrides,
  }
}

describe('normalizeBrewLogFormValues', () => {
  it('maps form values and aggregates brew time', () => {
    const result = normalizeBrewLogFormValues(
      buildValues({ accessoryIds: [accessoryId] }),
    )

    expect(result.beanId).toBe(beanId)
    expect(result.brewerId).toBe(brewerId)
    expect(result.grinderId).toBe(grinderId)
    expect(result.recipeId).toBe(recipeId)
    expect(result.accessoryIds).toEqual([accessoryId])
    expect(result.brewTimeSeconds).toBe(210)
    expect(result.brewedAt).toBe('2025-03-05T14:30:00.000Z')
  })

  it('omits brew time when both minute and second values are zero', () => {
    const result = normalizeBrewLogFormValues(
      buildValues({ brewTimeMinutes: 0, brewTimeSeconds: 0 }),
    )

    expect(result.brewTimeSeconds).toBeUndefined()
  })

  it('normalizes optional values and omits empty accessory list', () => {
    const result = normalizeBrewLogFormValues(
      buildValues({
        accessoryIds: [],
        grindSize: '   ',
        tastingNotes: '   ',
        adjustmentIdeas: '   ',
      }),
    )

    expect(result.accessoryIds).toBeUndefined()
    expect(result.grindSize).toBeUndefined()
    expect(result.notes).toBeUndefined()
    expect(result.adjustmentIdeas).toBeUndefined()
  })
})
