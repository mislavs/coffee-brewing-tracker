import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrewLogFormPage } from '@/features/brew-log/pages/BrewLogFormPage'
import type { BrewLogFormValues } from '@/features/brew-log/brewLogFormSchema'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useBeanReview } from '@/features/beans/hooks/useBeanReview'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'

vi.mock('@/features/brew-log/hooks/useCreateBrewLog', () => ({
  useCreateBrewLog: vi.fn(),
}))

vi.mock('@/features/beans/hooks/useBeanReview', () => ({
  useBeanReview: vi.fn(),
}))

vi.mock('@/features/beans/hooks/useSetBeanAvailability', () => ({
  useSetBeanAvailability: vi.fn(),
}))

const beanId = '11111111-1111-1111-1111-111111111111'
const brewerId = '22222222-2222-2222-2222-222222222222'
const grinderId = '33333333-3333-3333-3333-333333333333'
const recipeId = '44444444-4444-4444-4444-444444444444'

const validBrewValues: BrewLogFormValues = {
  beanId,
  brewerId,
  grinderId,
  recipeId,
  dose: 18,
  waterAmount: 300,
  waterTemperature: undefined,
  grindSize: undefined,
  brewTimeMinutes: undefined,
  brewTimeSeconds: undefined,
  rating: 5,
  tastingNotes: undefined,
  adjustmentIdeas: undefined,
  accessoryIds: [],
  brewedAt: '2026-07-23T09:00',
}

vi.mock('@/features/brew-log/components/BrewLogFormCardContainer', () => ({
  BrewLogFormCard: ({
    onSubmit,
  }: {
    onSubmit: (values: BrewLogFormValues) => Promise<void>
  }) => (
    <button type="button" onClick={() => void onSubmit(validBrewValues)}>
      Submit brew form
    </button>
  ),
}))

const createBrew = vi.fn()
const setBeanAvailability = vi.fn()

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/brew-log/new']}>
      <Routes>
        <Route path="/brew-log/new" element={<BrewLogFormPage />} />
        <Route path="/brew-log" element={<div>Brew log list</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BrewLogFormPage low-stock review integration', () => {
  beforeEach(() => {
    createBrew.mockReset()
    createBrew.mockResolvedValue({ remainingBeanQuantity: 8 })
    setBeanAvailability.mockReset()
    setBeanAvailability.mockResolvedValue(undefined)

    vi.mocked(useCreateBrewLog).mockReturnValue({
      mutateAsync: createBrew,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateBrewLog>)
    vi.mocked(useBeanReview).mockReturnValue({
      data: {
        id: beanId,
        rating: 4,
        suggestedRating: 5,
        notes: 'Existing notes',
      },
      isPending: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useBeanReview>)
    vi.mocked(useSetBeanAvailability).mockReturnValue({
      mutateAsync: setBeanAvailability,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useSetBeanAvailability>)
  })

  afterEach(() => {
    cleanup()
  })

  it('completes the shared bean review before navigating back to the brew log', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Submit brew form' }))
    expect(await screen.findByText(/Only 8\.0g remains/)).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Save & mark unavailable' }),
    )

    expect(setBeanAvailability).toHaveBeenCalledWith({
      id: beanId,
      isAvailable: false,
      review: {
        rating: 5,
        notes: 'Existing notes',
      },
    })
    expect(await screen.findByText('Brew log list')).toBeTruthy()
  })
})
