import { describe, expect, it } from 'vitest'
import type {
  BrewLogFormInput,
  BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import {
  brewLogFormSchema,
  normalizeBrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'

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
    grindSize: 12.5,
    brewTimeMinutes: 3,
    brewTimeSeconds: 30,
    rating: 4,
    tastingNotes: 'balanced',
    adjustmentIdeas: 'slightly finer',
    brewedAt: '2025-03-05T14:30:00.000Z',
    ...overrides,
  }
}

function buildInput(
  overrides: Partial<BrewLogFormInput> = {},
): BrewLogFormInput {
  return {
    beanId,
    brewerId,
    grinderId,
    recipeId,
    accessoryIds: [],
    dose: '18' as never,
    waterAmount: '300' as never,
    waterTemperature: '94' as never,
    grindSize: '12.5' as never,
    brewTimeMinutes: '3' as never,
    brewTimeSeconds: '30' as never,
    rating: '4' as never,
    tastingNotes: 'balanced',
    adjustmentIdeas: 'slightly finer',
    brewedAt: '2025-03-05T14:30:00.000Z',
    ...overrides,
  }
}

function issuesFor(result: ReturnType<typeof brewLogFormSchema.safeParse>) {
  return result.success ? [] : result.error.issues
}

describe('brewLogFormSchema', () => {
  it('coerces required positive numbers from strings', () => {
    const result = brewLogFormSchema.safeParse(buildInput())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dose).toBe(18)
      expect(result.data.waterAmount).toBe(300)
    }
  })

  it('fails required positive numbers when empty, nullish, or zero', () => {
    for (const value of ['', null, undefined]) {
      const result = brewLogFormSchema.safeParse(buildInput({ dose: value as never }))
      expect(result.success).toBe(false)
      expect(issuesFor(result).some((issue) => issue.path[0] === 'dose')).toBe(true)
    }

    const zeroResult = brewLogFormSchema.safeParse(buildInput({ dose: 0 as never }))
    expect(zeroResult.success).toBe(false)
    expect(
      issuesFor(zeroResult).some(
        (issue) =>
          issue.path[0] === 'dose' &&
          issue.message === 'Dose must be greater than 0.',
      ),
    ).toBe(true)
  })

  it('coerces optional numbers and normalizes empty or invalid values to undefined', () => {
    const stringResult = brewLogFormSchema.safeParse(
      buildInput({ waterTemperature: '94' as never }),
    )

    expect(stringResult.success).toBe(true)
    if (stringResult.success) {
      expect(stringResult.data.waterTemperature).toBe(94)
    }

    for (const value of ['', null, 'abc']) {
      const result = brewLogFormSchema.safeParse(
        buildInput({ waterTemperature: value as never }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.waterTemperature).toBeUndefined()
      }
    }
  })

  it('enforces numeric refinement boundaries', () => {
    expect(
      brewLogFormSchema.safeParse(buildInput({ waterTemperature: '0' as never })).success,
    ).toBe(true)
    expect(
      brewLogFormSchema.safeParse(buildInput({ waterTemperature: '100' as never })).success,
    ).toBe(true)
    expect(
      brewLogFormSchema.safeParse(buildInput({ waterTemperature: '101' as never }))
        .success,
    ).toBe(false)

    expect(
      brewLogFormSchema.safeParse(buildInput({ brewTimeSeconds: '59' as never })).success,
    ).toBe(true)
    expect(
      brewLogFormSchema.safeParse(buildInput({ brewTimeSeconds: '60' as never })).success,
    ).toBe(false)

    expect(brewLogFormSchema.safeParse(buildInput({ rating: '1' as never })).success).toBe(
      true,
    )
    expect(brewLogFormSchema.safeParse(buildInput({ rating: '5' as never })).success).toBe(
      true,
    )
    expect(brewLogFormSchema.safeParse(buildInput({ rating: '0' as never })).success).toBe(
      false,
    )
    expect(brewLogFormSchema.safeParse(buildInput({ rating: '6' as never })).success).toBe(
      false,
    )
  })

  it('validates grind size as a non-negative number', () => {
    expect(
      brewLogFormSchema.safeParse(buildInput({ grindSize: '0' as never })).success,
    ).toBe(true)
    expect(
      brewLogFormSchema.safeParse(buildInput({ grindSize: '12.5' as never })).success,
    ).toBe(true)
    expect(
      brewLogFormSchema.safeParse(buildInput({ grindSize: '-0.1' as never })).success,
    ).toBe(false)
  })

  it('validates brewedAt values', () => {
    expect(brewLogFormSchema.safeParse(buildInput({ brewedAt: '' })).success).toBe(false)
    expect(
      brewLogFormSchema.safeParse(buildInput({ brewedAt: 'not-a-date' })).success,
    ).toBe(false)
    expect(
      brewLogFormSchema.safeParse(buildInput({ brewedAt: '2025-03-05T14:30:00.000Z' }))
        .success,
    ).toBe(true)
  })
})

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
        grindSize: undefined,
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
