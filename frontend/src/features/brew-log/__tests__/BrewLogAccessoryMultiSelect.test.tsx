import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BrewLogAccessoryMultiSelect } from '@/features/brew-log/components/BrewLogAccessoryMultiSelect'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'

vi.mock('@/features/equipment/hooks/useAccessories', () => ({
  useAccessories: vi.fn(),
}))

const brewerAId = '22222222-2222-2222-2222-222222222222'
const brewerBId = '33333333-3333-3333-3333-333333333333'

function createQueryResult<T>(data: T) {
  return { data } as const
}

describe('BrewLogAccessoryMultiSelect', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows only accessories compatible with the selected brewer plus universal accessories', async () => {
    const user = userEvent.setup()
    vi.mocked(useAccessories).mockReturnValue(
      createQueryResult([
        {
          id: '77777777-7777-7777-7777-777777777777',
          name: 'Accessory A',
          compatibleBrewers: [{ id: brewerAId, name: 'Brewer A' }],
        },
        {
          id: '12121212-1212-1212-1212-121212121212',
          name: 'Universal Accessory',
          compatibleBrewers: [],
        },
        {
          id: '99999999-9999-9999-9999-999999999999',
          name: 'Accessory B',
          compatibleBrewers: [{ id: brewerBId, name: 'Brewer B' }],
        },
      ]) as ReturnType<typeof useAccessories>,
    )

    render(
      <BrewLogAccessoryMultiSelect
        brewerId={brewerAId}
        selectedIds={[]}
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByText('Accessory A')).toBeTruthy()
    expect(screen.getByText('Universal Accessory')).toBeTruthy()
    expect(screen.queryByText('Accessory B')).toBeNull()
  })
})
