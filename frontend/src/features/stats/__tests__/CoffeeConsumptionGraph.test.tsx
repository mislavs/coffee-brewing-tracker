import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CoffeeConsumptionGraph } from '@/features/stats/components/CoffeeConsumptionGraph'
import { useCoffeeConsumption } from '@/features/stats/hooks/useCoffeeConsumption'
import { CoffeeConsumptionGranularity } from '@/lib/api/schemas'

vi.mock('@/features/stats/hooks/useCoffeeConsumption', () => ({
  useCoffeeConsumption: vi.fn(),
}))

vi.mock('recharts', () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  )
  const Empty = () => null

  return {
    ResponsiveContainer: Container,
    BarChart: Container,
    CartesianGrid: Empty,
    XAxis: Empty,
    YAxis: Empty,
    Tooltip: Empty,
    Bar: Empty,
  }
})

afterEach(cleanup)

describe('CoffeeConsumptionGraph', () => {
  beforeEach(() => {
    vi.mocked(useCoffeeConsumption).mockReturnValue({
      data: {
        from: '2026-08-01',
        to: '2026-08-24',
        granularity: CoffeeConsumptionGranularity.NUMBER_0,
        timeZone: 'Europe/Zagreb',
        totalConsumedGrams: 60,
        totalBrews: 3,
        buckets: [
          {
            startDate: '2026-08-23',
            endDate: '2026-08-23',
            consumedGrams: 18,
            brewCount: 1,
            isPartial: false,
          },
          {
            startDate: '2026-08-24',
            endDate: '2026-08-24',
            consumedGrams: 42,
            brewCount: 2,
            isPartial: true,
          },
        ],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCoffeeConsumption>)
  })

  it('renders backend-provided totals with daily granularity selected', () => {
    render(<CoffeeConsumptionGraph />)

    expect(
      screen.getByRole('heading', { name: 'Coffee consumption' }),
    ).toBeTruthy()
    expect(screen.getByText('60 g')).toBeTruthy()
    expect(screen.getByText('across 3 brews')).toBeTruthy()
    expect(
      (screen.getByRole('radio', { name: 'Daily' }) as HTMLInputElement)
        .checked,
    ).toBe(true)
  })

  it('requests weekly consumption when weekly granularity is selected', async () => {
    const user = userEvent.setup()
    render(<CoffeeConsumptionGraph />)

    await user.click(screen.getByRole('radio', { name: 'Weekly' }))

    expect(useCoffeeConsumption).toHaveBeenLastCalledWith(
      expect.objectContaining({
        granularity: CoffeeConsumptionGranularity.NUMBER_1,
      }),
    )
  })

  it('shows an instructive empty state when the range has no brews', () => {
    vi.mocked(useCoffeeConsumption).mockReturnValue({
      data: {
        totalConsumedGrams: 0,
        totalBrews: 0,
        buckets: [],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCoffeeConsumption>)

    render(<CoffeeConsumptionGraph />)

    expect(screen.getByText('No brews in this range')).toBeTruthy()
    expect(screen.getByText(/Choose another date range/)).toBeTruthy()
  })

  it('retries after the consumption query fails', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useCoffeeConsumption).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch,
    } as unknown as ReturnType<typeof useCoffeeConsumption>)

    render(<CoffeeConsumptionGraph />)
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledOnce()
  })
})
