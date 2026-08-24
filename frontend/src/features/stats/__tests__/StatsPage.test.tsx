import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GraphsPlaceholder,
  StatsOverview,
  StatsPage,
} from '@/features/stats/pages/StatsPage'
import { useDashboardStats } from '@/hooks/useDashboardStats'

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(),
}))

afterEach(cleanup)

function renderStatsPage(initialEntry = '/stats') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="stats" element={<StatsPage />}>
          <Route index element={<StatsOverview />} />
          <Route path="graphs" element={<GraphsPlaceholder />} />
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
    expect(screen.getByRole('heading', { name: 'Brewing history' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Coffee supply' })).toBeTruthy()
    expect(screen.getByText('128')).toBeTruthy()
    expect(screen.getByText('750 g')).toBeTruthy()
    expect(screen.getByText('19')).toBeTruthy()
    expect(screen.getByText('2,345 g')).toBeTruthy()
    expect(screen.getByText('24 days')).toBeTruthy()
    expect(screen.getByText('at 31.5 g/day')).toBeTruthy()
  })

  it('navigates to the graphs placeholder', async () => {
    const user = userEvent.setup()
    renderStatsPage()

    await user.click(screen.getByRole('link', { name: 'Graphs' }))

    expect(screen.getByRole('heading', { name: 'Graphs' })).toBeTruthy()
    expect(screen.getByText('This is where the graphs will be.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Graphs' }).getAttribute('aria-current')).toBe(
      'page',
    )
  })
})
