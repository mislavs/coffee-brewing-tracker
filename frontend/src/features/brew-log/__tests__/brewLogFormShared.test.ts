import { describe, expect, it } from 'vitest'
import { isAccessoryCompatibleWithBrewer } from '@/features/brew-log/components/brewLogFormShared'
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
