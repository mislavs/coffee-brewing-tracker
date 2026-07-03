import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BeanListPage } from '@/features/beans/pages/BeanListPage'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useCountryMapStats } from '@/features/world-map/hooks/useCountryMapStats'
import { useDebouncedSearchParam } from '@/hooks/useDebouncedSearchParam'
import type { BeanSummaryDto, CountryMapStatsDto } from '@/lib/api/schemas'

vi.mock('@/features/beans/hooks/useBeans', () => ({
  useBeans: vi.fn(),
}))

vi.mock('@/features/world-map/hooks/useCountryMapStats', () => ({
  useCountryMapStats: vi.fn(),
}))

vi.mock('@/hooks/useDebouncedSearchParam', () => ({
  useDebouncedSearchParam: vi.fn(),
}))

vi.mock('@/features/beans/components/BeanCard', () => ({
  BeanCard: ({ bean }: { bean: BeanSummaryDto }) => (
    <div>{bean.name ?? 'Unnamed bean'}</div>
  ),
}))

const beans: BeanSummaryDto[] = [
  { id: 'bean-1', name: 'Geometry', isAvailable: true },
]

const countryStats: CountryMapStatsDto[] = [
  { countryId: 'ethiopia', countryName: 'Ethiopia' },
]

function createQueryResult<T>(data: T) {
  return { data } as const
}

function LocationProbe() {
  const location = useLocation()

  return <div data-testid="location-search">{location.search}</div>
}

function renderPage(initialEntry = '/beans') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <BeanListPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('BeanListPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(useBeans).mockReset()
    vi.mocked(useCountryMapStats).mockReset()
    vi.mocked(useDebouncedSearchParam).mockReset()

    vi.mocked(useBeans).mockReturnValue({
      data: beans,
      isPending: false,
    } as ReturnType<typeof useBeans>)
    vi.mocked(useCountryMapStats).mockReturnValue(
      createQueryResult(countryStats) as ReturnType<typeof useCountryMapStats>,
    )
    vi.mocked(useDebouncedSearchParam).mockImplementation(({ value }) => [
      value,
      vi.fn(),
    ])
  })

  it('keeps filter and sort controls accessible and shows chips when panels are closed', async () => {
    const user = userEvent.setup()
    renderPage('/beans?country=ethiopia&showUnavailable=true&sort=roastDate&dir=desc')

    expect(screen.getByRole('button', { name: 'Hide filters' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hide sort' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Hide filters' }))
    await user.click(screen.getByRole('button', { name: 'Hide sort' }))

    expect(screen.getByText('Ethiopia')).toBeTruthy()
    expect(screen.getByText('Show unavailable')).toBeTruthy()
    expect(screen.getByText('Sort: Roast date')).toBeTruthy()
    expect(screen.getByText('Descending')).toBeTruthy()
  })

  it('preserves the showUnavailable query parameter behavior', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Show filters' }))
    await user.click(screen.getByRole('switch', { name: 'Show unavailable' }))

    await waitFor(() => {
      expect(useBeans).toHaveBeenLastCalledWith('', true, undefined)
    })
    expect(screen.getByTestId('location-search').textContent).toBe(
      '?showUnavailable=true',
    )
  })
})