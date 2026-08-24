import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GraphsPage,
  StatsOverview,
  StatsPage,
} from '@/features/stats/pages/StatsPage'
import { useDashboardStats } from '@/hooks/useDashboardStats'

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(),
}))

vi.mock('@/features/stats/components/CoffeeConsumptionGraph', () => ({
  CoffeeConsumptionGraph: () => <h2>Coffee consumption</h2>,
}))

afterEach(cleanup)

function renderStatsPage(initialEntry = '/stats') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="stats" element={<StatsPage />}>
          <Route index element={<StatsOverview />} />
          <Route path="graphs" element={<GraphsPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('StatsPage', () => {
  beforeEach(() => {
    vi.mocked(useDashboardStats).mockReturnValue({
      data: {
        totalBrews: 128,
        coffeeAvailableGrams: 750,
        beansExplored: 19,
        totalCoffeeConsumedGrams: 2345,
        estimatedDaysRemaining: 24,
        averageDailyConsumptionGrams: 31.5,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboardStats>)
  })

  it('shows all quick stats in a full-page grouped layout', () => {
    renderStatsPage()

    expect(screen.getByRole('heading', { name: 'My Stats' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Brewing history' }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Coffee supply' })).toBeTruthy()
    expect(screen.getByText('128')).toBeTruthy()
    expect(screen.getByText('750 g')).toBeTruthy()
    expect(screen.getByText('19')).toBeTruthy()
    expect(screen.getByText('2,345 g')).toBeTruthy()
    expect(screen.getByText('24 days')).toBeTruthy()
    expect(screen.getByText('at 31.5 g/day')).toBeTruthy()
  })

  it('navigates to the coffee consumption graph', async () => {
    const user = userEvent.setup()
    renderStatsPage()

    await user.click(screen.getByRole('link', { name: 'Graphs' }))

    expect(
      await screen.findByRole('heading', { name: 'Coffee consumption' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Graphs' }).getAttribute('aria-current'),
    ).toBe('page')
  })
})
