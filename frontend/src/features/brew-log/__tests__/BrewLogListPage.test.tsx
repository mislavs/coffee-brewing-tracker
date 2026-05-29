import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrewLogListPage } from '@/features/brew-log/pages/BrewLogListPage'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useBrewLogs } from '@/features/brew-log/hooks/useBrewLogs'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import { useFeatures } from '@/hooks/useFeatures'
import type {
  BeanSummaryDto,
  BrewLogSummaryDtoPaginatedList,
  RecipeSummaryDto,
} from '@/lib/api/schemas'

vi.mock('@/features/beans/hooks/useBeans', () => ({
  useBeans: vi.fn(),
}))

vi.mock('@/features/brew-log/hooks/useBrewLogs', () => ({
  useBrewLogs: vi.fn(),
}))

vi.mock('@/features/recipes/hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/hooks/useFeatures', () => ({
  useFeatures: vi.fn(),
}))

vi.mock('@/features/brew-log/components/quick-log/QuickLogWizardDialog', () => ({
  QuickLogWizardDialog: () => <div>Quick log dialog</div>,
}))

const availableBeanId = '11111111-1111-1111-1111-111111111111'
const unavailableBeanId = '22222222-2222-2222-2222-222222222222'

const beans: BeanSummaryDto[] = [
  { id: availableBeanId, name: 'Available Bean', isAvailable: true },
  { id: unavailableBeanId, name: 'Unavailable Bean', isAvailable: false },
]

function createQueryResult<T>(data: T) {
  return { data } as const
}

function createBrewLogsPage(
  overrides: Partial<BrewLogSummaryDtoPaginatedList> = {},
): BrewLogSummaryDtoPaginatedList {
  return {
    items: [],
    page: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    ...overrides,
  }
}

function LocationProbe() {
  const location = useLocation()

  return <div data-testid="location-search">{location.search}</div>
}

function renderPage(initialEntry = '/brew-log') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <BrewLogListPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('BrewLogListPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(useBeans).mockReset()
    vi.mocked(useBrewLogs).mockReset()
    vi.mocked(useRecipes).mockReset()
    vi.mocked(useFeatures).mockReset()

    vi.mocked(useBeans).mockReturnValue(
      createQueryResult(beans) as ReturnType<typeof useBeans>,
    )
    vi.mocked(useRecipes).mockReturnValue(
      createQueryResult<RecipeSummaryDto[]>([]) as ReturnType<typeof useRecipes>,
    )
    vi.mocked(useBrewLogs).mockReturnValue({
      data: createBrewLogsPage(),
      isPending: false,
    } as ReturnType<typeof useBrewLogs>)
    vi.mocked(useFeatures).mockReturnValue(
      createQueryResult({ voiceBrewLogParsing: false }) as ReturnType<typeof useFeatures>,
    )
  })

  it('includes unavailable beans by default', () => {
    renderPage()

    expect(useBeans).toHaveBeenLastCalledWith(undefined, true)
    expect(useBrewLogs).toHaveBeenLastCalledWith(
      undefined,
      undefined,
      undefined,
      true,
      undefined,
      1,
      12,
      undefined,
    )
  })

  it('can hide unavailable beans from the availability filter', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Show filters' }))
    await user.click(screen.getByRole('switch', { name: 'Hide unavailable beans' }))

    await waitFor(() => {
      expect(useBeans).toHaveBeenLastCalledWith(undefined, false)
      expect(useBrewLogs).toHaveBeenLastCalledWith(
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        1,
        12,
        undefined,
      )
    })
    expect(screen.getByTestId('location-search').textContent).toBe('?hideUnavailable=true')
  })

  it('clears an unavailable bean selection when unavailable beans are hidden', async () => {
    const user = userEvent.setup()
    renderPage(`/brew-log?beanId=${unavailableBeanId}`)

    await user.click(screen.getByRole('switch', { name: 'Hide unavailable beans' }))

    await waitFor(() => {
      expect(useBrewLogs).toHaveBeenLastCalledWith(
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        1,
        12,
        undefined,
      )
    })
    expect(screen.getByTestId('location-search').textContent).toBe('?hideUnavailable=true')
  })
})
