import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EquipmentPage } from '@/features/equipment/pages/EquipmentPage'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'
import type {
  AccessorySummaryDto,
  BrewerSummaryDto,
  GrinderSummaryDto,
} from '@/lib/api/schemas'

vi.mock('@/features/equipment/hooks/useAccessories', () => ({
  useAccessories: vi.fn(),
}))

vi.mock('@/features/equipment/hooks/useBrewers', () => ({
  useBrewers: vi.fn(),
}))

vi.mock('@/features/equipment/hooks/useGrinders', () => ({
  useGrinders: vi.fn(),
}))

const brewers: BrewerSummaryDto[] = [
  { id: 'brewer-1', name: 'V60' },
]
const grinders: GrinderSummaryDto[] = [
  { id: 'grinder-1', name: 'Ode' },
  { id: 'grinder-2', name: 'C40' },
]
const accessories: AccessorySummaryDto[] = []

function renderPage(initialEntry = '/equipment') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EquipmentPage />
    </MemoryRouter>,
  )
}

describe('EquipmentPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(useAccessories).mockReset()
    vi.mocked(useBrewers).mockReset()
    vi.mocked(useGrinders).mockReset()

    vi.mocked(useAccessories).mockReturnValue({
      data: accessories,
      isPending: false,
    } as ReturnType<typeof useAccessories>)
    vi.mocked(useBrewers).mockReturnValue({
      data: brewers,
      isPending: false,
    } as ReturnType<typeof useBrewers>)
    vi.mocked(useGrinders).mockReturnValue({
      data: grinders,
      isPending: false,
    } as ReturnType<typeof useGrinders>)
  })

  it('uses a tab-specific toolbar for the selected equipment list', () => {
    renderPage('/equipment?tab=grinders')

    expect(screen.getByText('2 grinders')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Add Grinder' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Grinders' }).classList.contains('sr-only')).toBe(true)
  })
})