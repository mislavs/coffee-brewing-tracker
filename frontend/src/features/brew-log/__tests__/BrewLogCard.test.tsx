import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { useSetBrewLogRating } from '@/features/brew-log/hooks/useSetBrewLogRating'
import { useUpdateBrewLog } from '@/features/brew-log/hooks/useUpdateBrewLog'
import type { BrewLogDto, BrewLogSummaryDto } from '@/lib/api/schemas'

const apiClientMocks = vi.hoisted(() => ({
  byId: vi.fn(),
  get: vi.fn(),
}))

vi.mock('@/features/brew-log/hooks/useSetBrewLogRating', () => ({
  useSetBrewLogRating: vi.fn(),
}))

vi.mock('@/features/brew-log/hooks/useUpdateBrewLog', () => ({
  useUpdateBrewLog: vi.fn(),
}))

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    api: {
      brewLogs: {
        byId: apiClientMocks.byId,
      },
    },
  },
}))

const brewLogId = '11111111-1111-1111-1111-111111111111'
const setRatingMock = vi.fn()
const updateBrewLogMock = vi.fn()

function createBrewLog(overrides: Partial<BrewLogSummaryDto> = {}): BrewLogSummaryDto {
  return {
    id: brewLogId,
    brewedAt: '2026-04-27T08:00:00Z',
    beanName: 'Test Bean',
    roasterName: 'Test Roaster',
    brewerName: 'V60',
    recipeName: 'Default',
    dose: 18,
    waterAmount: 300,
    grinderName: 'Test Grinder',
    grindSize: 12,
    rating: null,
    ...overrides,
  }
}

function createFullBrewLog(overrides: Partial<BrewLogDto> = {}): BrewLogDto {
  return {
    id: brewLogId,
    beanId: '22222222-2222-2222-2222-222222222222',
    beanName: 'Test Bean',
    brewerId: '33333333-3333-3333-3333-333333333333',
    brewerName: 'V60',
    grinderId: '44444444-4444-4444-4444-444444444444',
    grinderName: 'Test Grinder',
    recipeId: '55555555-5555-5555-5555-555555555555',
    recipeName: 'Default',
    accessories: [
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Paper filter',
      },
    ],
    dose: 18,
    waterAmount: 300,
    waterTemperature: 93,
    grindSize: 12,
    brewTimeSeconds: 180,
    rating: null,
    notes: 'Existing tasting notes',
    adjustmentIdeas: 'Existing adjustment ideas',
    brewedAt: '2026-04-27T08:00:00Z',
    brewRatio: 16.6666666667,
    beanCostPerCup: 1.25,
    ...overrides,
  }
}

function renderCard(brewLog: BrewLogSummaryDto) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BrewLogCard brewLog={brewLog} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BrewLogCard', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    setRatingMock.mockReset()
    setRatingMock.mockResolvedValue(undefined)
    updateBrewLogMock.mockReset()
    updateBrewLogMock.mockResolvedValue(undefined)
    apiClientMocks.byId.mockReset()
    apiClientMocks.get.mockReset()
    apiClientMocks.get.mockResolvedValue(createFullBrewLog())
    apiClientMocks.byId.mockReturnValue({
      get: apiClientMocks.get,
    })
    vi.mocked(useSetBrewLogRating).mockReturnValue({
      mutateAsync: setRatingMock,
      isPending: false,
    } as unknown as ReturnType<typeof useSetBrewLogRating>)
    vi.mocked(useUpdateBrewLog).mockReturnValue({
      mutateAsync: updateBrewLogMock,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateBrewLog>)
  })

  it('hides the rate button when the brew already has a rating', () => {
    // Arrange
    const brewLog = createBrewLog({ rating: 4 })

    // Act
    renderCard(brewLog)

    // Assert
    expect(screen.queryByRole('button', { name: /rate brew/i })).toBeNull()
    expect(screen.getByRole('link', { name: /repeat brew/i })).toBeTruthy()
  })

  it('opens the rating dialog and saves the selected rating', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard(createBrewLog())

    // Act
    await user.click(screen.getByRole('button', { name: /rate brew/i }))
    await screen.findByRole('dialog')
    await user.click(screen.getAllByRole('radio')[4]!)

    // Assert
    expect(setRatingMock).toHaveBeenCalledWith({ id: brewLogId, rating: 5 })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('expands the rating dialog to edit notes and saves the brew log update', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard(createBrewLog())

    // Act
    await user.click(screen.getByRole('button', { name: /rate brew/i }))
    await user.click(screen.getByRole('button', { name: /add additional notes/i }))
    const notesInput = await screen.findByLabelText(/^notes$/i)
    const adjustmentIdeasInput = await screen.findByLabelText(/adjustment ideas/i)
    await user.clear(notesInput)
    await user.type(notesInput, 'Updated tasting notes')
    await user.clear(adjustmentIdeasInput)
    await user.type(adjustmentIdeasInput, 'Updated adjustment ideas')
    await user.click(screen.getAllByRole('radio')[3]!)
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    // Assert
    expect(setRatingMock).not.toHaveBeenCalled()
    expect(updateBrewLogMock).toHaveBeenCalledWith({
      id: brewLogId,
      request: {
        beanId: '22222222-2222-2222-2222-222222222222',
        brewerId: '33333333-3333-3333-3333-333333333333',
        grinderId: '44444444-4444-4444-4444-444444444444',
        recipeId: '55555555-5555-5555-5555-555555555555',
        accessoryIds: ['66666666-6666-6666-6666-666666666666'],
        dose: 18,
        waterAmount: 300,
        waterTemperature: 93,
        grindSize: 12,
        brewTimeSeconds: 180,
        rating: 4,
        notes: 'Updated tasting notes',
        adjustmentIdeas: 'Updated adjustment ideas',
        brewedAt: '2026-04-27T08:00:00Z',
      },
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
