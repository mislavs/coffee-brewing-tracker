import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrewLogLowStockPromptDialog } from '@/features/brew-log/brewLogLowStock'
import { useBeanReview } from '@/features/beans/hooks/useBeanReview'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'

vi.mock('@/features/beans/hooks/useBeanReview', () => ({
  useBeanReview: vi.fn(),
}))

vi.mock('@/features/beans/hooks/useSetBeanAvailability', () => ({
  useSetBeanAvailability: vi.fn(),
}))

const beanId = '11111111-1111-1111-1111-111111111111'
const mutateAsync = vi.fn()
const resetMutation = vi.fn()
const refetchBean = vi.fn()

function mockBeanQuery(
  overrides: Partial<ReturnType<typeof useBeanReview>> = {},
) {
  vi.mocked(useBeanReview).mockReturnValue({
    data: {
      id: beanId,
      rating: 3,
      suggestedRating: 5,
      notes: 'Existing bean notes',
    },
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: refetchBean,
    ...overrides,
  } as unknown as ReturnType<typeof useBeanReview>)
}

function mockAvailabilityMutation(
  overrides: Partial<ReturnType<typeof useSetBeanAvailability>> = {},
) {
  vi.mocked(useSetBeanAvailability).mockReturnValue({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
    reset: resetMutation,
    ...overrides,
  } as unknown as ReturnType<typeof useSetBeanAvailability>)
}

function renderDialog() {
  const onOpenChange = vi.fn()
  const onCompleted = vi.fn()

  render(
    <BrewLogLowStockPromptDialog
      prompt={{ beanId, remainingQuantity: 8.5 }}
      onOpenChange={onOpenChange}
      onCompleted={onCompleted}
    />,
  )

  return { onOpenChange, onCompleted }
}

describe('BrewLogLowStockPromptDialog', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue(undefined)
    resetMutation.mockReset()
    refetchBean.mockReset()
    mockBeanQuery()
    mockAvailabilityMutation()
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps the bean available when the user declines the review flow', async () => {
    const user = userEvent.setup()
    const callbacks = renderDialog()

    expect(
      screen.getByText(
        'Only 8.5g remains for this bean. Do you want to mark it unavailable?',
      ),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Keep available' }))

    expect(mutateAsync).not.toHaveBeenCalled()
    expect(callbacks.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('prefills the highest brew rating and existing notes in the review stage', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )

    const selectedRating = screen
      .getAllByRole('radio')
      .find((radio) => radio.getAttribute('aria-checked') === 'true')
    expect(selectedRating).toBe(screen.getAllByRole('radio')[4])
    expect(
      screen.getByText(/Suggested 5\/5 from your highest-rated brew/),
    ).toBeTruthy()
    expect(
      (screen.getByLabelText('Bean notes') as HTMLTextAreaElement).value,
    ).toBe('Existing bean notes')
  })

  it('falls back to the existing bean rating when no suggestion exists', async () => {
    const user = userEvent.setup()
    mockBeanQuery({
      data: {
        id: beanId,
        rating: 3,
        suggestedRating: null,
        notes: null,
      },
    } as Partial<ReturnType<typeof useBeanReview>>)
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )

    const selectedRating = screen
      .getAllByRole('radio')
      .find((radio) => radio.getAttribute('aria-checked') === 'true')
    expect(selectedRating).toBe(screen.getAllByRole('radio')[2])
    expect(
      screen.getByText(/Your existing bean rating is selected/),
    ).toBeTruthy()
  })

  it('shows a loading state and prevents review until bean details arrive', () => {
    mockBeanQuery({
      data: undefined,
      isPending: true,
      isFetching: true,
    } as Partial<ReturnType<typeof useBeanReview>>)
    renderDialog()

    expect(screen.getByRole('status', { name: 'Loading bean review' })).toBeTruthy()
    expect(
      (
        screen.getByRole('button', {
          name: 'Review & mark unavailable',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })

  it('can return from the review and close without changing availability', async () => {
    const user = userEvent.setup()
    const callbacks = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Keep available' }))

    expect(mutateAsync).not.toHaveBeenCalled()
    expect(callbacks.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('saves an overridden review together with unavailable status', async () => {
    const user = userEvent.setup()
    const callbacks = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )
    await user.click(screen.getAllByRole('radio')[3])
    const notes = screen.getByLabelText('Bean notes')
    await user.clear(notes)
    await user.type(notes, 'Would happily buy again.')
    await user.click(
      screen.getByRole('button', { name: 'Save & mark unavailable' }),
    )

    expect(mutateAsync).toHaveBeenCalledWith({
      id: beanId,
      isAvailable: false,
      review: {
        rating: 4,
        notes: 'Would happily buy again.',
      },
    })
    expect(callbacks.onCompleted).toHaveBeenCalledOnce()
  })

  it('can clear the suggested rating and existing notes', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )
    await user.click(screen.getAllByRole('radio')[4])
    await user.clear(screen.getByLabelText('Bean notes'))
    await user.click(
      screen.getByRole('button', { name: 'Save & mark unavailable' }),
    )

    expect(mutateAsync).toHaveBeenCalledWith({
      id: beanId,
      isAvailable: false,
      review: {
        rating: null,
        notes: null,
      },
    })
  })

  it('requires the current bean review to load before continuing and supports retry', async () => {
    const user = userEvent.setup()
    mockBeanQuery({
      data: undefined,
      isError: true,
    } as Partial<ReturnType<typeof useBeanReview>>)
    renderDialog()

    const continueButton = screen.getByRole('button', {
      name: 'Review & mark unavailable',
    }) as HTMLButtonElement
    expect(continueButton.disabled).toBe(true)
    expect(screen.getByRole('alert').textContent).toMatch(/couldn't load/i)

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetchBean).toHaveBeenCalledOnce()
  })

  it('keeps the draft visible when saving fails', async () => {
    const user = userEvent.setup()
    mockAvailabilityMutation({
      isError: true,
      error: new Error('Network unavailable.'),
    } as Partial<ReturnType<typeof useSetBeanAvailability>>)
    mutateAsync.mockRejectedValue(new Error('Network unavailable.'))
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Review & mark unavailable' }),
    )
    const notes = screen.getByLabelText('Bean notes')
    await user.clear(notes)
    await user.type(notes, 'Keep this draft')
    await user.click(
      screen.getByRole('button', { name: 'Save & mark unavailable' }),
    )

    expect(screen.getByText('Network unavailable.')).toBeTruthy()
    expect(
      (screen.getByLabelText('Bean notes') as HTMLTextAreaElement).value,
    ).toBe('Keep this draft')
  })
})
