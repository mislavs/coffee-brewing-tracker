import { describe, expect, it } from 'vitest'
import {
  isAccessoryCompatibleWithBrewer,
  sortOptionsByUsage,
} from '@/features/brew-log/components/brewLogFormShared'
import type { AccessoryDto } from '@/lib/api/schemas'

const brewerId = '22222222-2222-2222-2222-222222222222'
const otherBrewerId = '33333333-3333-3333-3333-333333333333'

function createAccessory(compatibleBrewers: AccessoryDto['compatibleBrewers']): AccessoryDto {
  return {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Accessory One',
    compatibleBrewers,
  }
}

describe('isAccessoryCompatibleWithBrewer', () => {
  it('treats accessories without compatible brewers as universal', () => {
    expect(isAccessoryCompatibleWithBrewer(createAccessory([]), brewerId)).toBe(true)
  })

  it('matches accessories that explicitly include the selected brewer', () => {
    expect(
      isAccessoryCompatibleWithBrewer(
        createAccessory([{ id: brewerId, name: 'Brewer One' }]),
        brewerId,
      ),
    ).toBe(true)
  })

  it('rejects accessories that only include another brewer', () => {
    expect(
      isAccessoryCompatibleWithBrewer(
        createAccessory([{ id: otherBrewerId, name: 'Brewer Two' }]),
        brewerId,
      ),
    ).toBe(false)
  })

  it('shows every accessory before a brewer is selected', () => {
    expect(
      isAccessoryCompatibleWithBrewer(
        createAccessory([{ id: otherBrewerId, name: 'Brewer Two' }]),
        '',
      ),
    ).toBe(true)
  })

  it('treats null and undefined compatible brewers as universal', () => {
    expect(isAccessoryCompatibleWithBrewer(createAccessory(null), brewerId)).toBe(true)
    expect(isAccessoryCompatibleWithBrewer(createAccessory(undefined), brewerId)).toBe(true)
  })
})

describe('sortOptionsByUsage', () => {
  const options = [
    { id: 'option-c', name: 'Chemex' },
    { id: 'option-a', name: 'Aeropress' },
    { id: 'option-v', name: 'V60' },
    { id: 'option-k', name: 'Kalita' },
  ]

  it('pins the preferred option before frequency-ranked options', () => {
    const result = sortOptionsByUsage(
      options,
      [
        { id: 'option-a', usageCount: 8 },
        { id: 'option-c', usageCount: 5 },
        { id: 'option-v', usageCount: 1 },
      ],
      'option-v',
    )

    expect(result.map((option) => option.id)).toEqual([
      'option-v',
      'option-a',
      'option-c',
      'option-k',
    ])
  })

  it('uses name and then id to break equal-frequency ties', () => {
    const result = sortOptionsByUsage(
      [
        { id: 'option-b', name: 'V60' },
        { id: 'option-a', name: 'V60' },
        { id: 'option-c', name: 'Aeropress' },
      ],
      [
        { id: 'option-a', usageCount: 2 },
        { id: 'option-b', usageCount: 2 },
        { id: 'option-c', usageCount: 2 },
      ],
    )

    expect(result.map((option) => option.id)).toEqual([
      'option-c',
      'option-a',
      'option-b',
    ])
  })

  it('falls back to alphabetical ordering when usage data is unavailable', () => {
    const result = sortOptionsByUsage(options, undefined)

    expect(result.map((option) => option.name)).toEqual([
      'Aeropress',
      'Chemex',
      'Kalita',
      'V60',
    ])
  })
})
