import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrewLogCard } from '@/features/brew-log/components/BrewLogCard'
import { useSetBrewLogRating } from '@/features/brew-log/hooks/useSetBrewLogRating'
import type { BrewLogSummaryDto } from '@/lib/api/schemas'

vi.mock('@/features/brew-log/hooks/useSetBrewLogRating', () => ({
  useSetBrewLogRating: vi.fn(),
}))

const brewLogId = '11111111-1111-1111-1111-111111111111'
const mutateAsyncMock = vi.fn()

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

function renderCard(brewLog: BrewLogSummaryDto) {
  return render(
    <MemoryRouter>
      <BrewLogCard brewLog={brewLog} />
    </MemoryRouter>,
  )
}

describe('BrewLogCard', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mutateAsyncMock.mockReset()
    mutateAsyncMock.mockResolvedValue(undefined)
    vi.mocked(useSetBrewLogRating).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useSetBrewLogRating>)
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
    expect(mutateAsyncMock).toHaveBeenCalledWith({ id: brewLogId, rating: 5 })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
