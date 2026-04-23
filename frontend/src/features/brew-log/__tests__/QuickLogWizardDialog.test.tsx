import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuickLogWizardDialog } from '@/features/brew-log/components/quick-log/QuickLogWizardDialog'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'

vi.mock('@/features/beans/hooks/useBeans', () => ({
  useBeans: vi.fn(),
}))

vi.mock('@/features/equipment/hooks/useBrewers', () => ({
  useBrewers: vi.fn(),
}))

vi.mock('@/features/recipes/hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/features/equipment/hooks/useGrinders', () => ({
  useGrinders: vi.fn(),
}))

vi.mock('@/features/equipment/hooks/useAccessories', () => ({
  useAccessories: vi.fn(),
}))

vi.mock('@/features/brew-log/hooks/useCreateBrewLog', () => ({
  useCreateBrewLog: vi.fn(),
}))

vi.mock('@/features/beans/hooks/useSetBeanAvailability', () => ({
  useSetBeanAvailability: vi.fn(),
}))

const beanId = '11111111-1111-1111-1111-111111111111'
const brewerAId = '22222222-2222-2222-2222-222222222222'
const brewerBId = '33333333-3333-3333-3333-333333333333'
const recipeAId = '44444444-4444-4444-4444-444444444444'
const recipeBId = '55555555-5555-5555-5555-555555555555'
const grinderId = '66666666-6666-6666-6666-666666666666'
const accessoryId = '77777777-7777-7777-7777-777777777777'

const mutateAsyncMock = vi.fn()
const setBeanAvailabilityMock = vi.fn()

function createQueryResult<T>(data: T) {
  return { data } as const
}

function renderDialog() {
  return render(<QuickLogWizardDialog open onOpenChange={vi.fn()} />)
}

async function goToBrewParameters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Bean One' }))
  await screen.findByRole('heading', { name: 'Brewer' })

  await user.click(screen.getByRole('radio', { name: 'Brewer A' }))
  await screen.findByRole('heading', { name: 'Recipe' })

  await user.click(screen.getByRole('radio', { name: 'Recipe A' }))
  await screen.findByRole('heading', { name: 'Grinder' })

  await user.click(screen.getByRole('radio', { name: 'Grinder One' }))
  await screen.findByRole('heading', { name: 'Accessories' })

  await user.click(screen.getByRole('button', { name: 'Skip' }))
  await screen.findByRole('heading', { name: 'Brew parameters' })
}

async function completeRequiredFlow(user: ReturnType<typeof userEvent.setup>) {
  await goToBrewParameters(user)

  const doseInput = screen.getByLabelText('Dose (g)')
  const waterInput = screen.getByLabelText('Water (ml)')

  fireEvent.change(doseInput, { target: { value: '18' } })
  fireEvent.change(waterInput, { target: { value: '300' } })
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await screen.findByRole('heading', { name: 'Brew time' })
  await user.click(screen.getByRole('button', { name: 'Skip' }))

  await screen.findByRole('heading', { name: 'Rating' })
  await user.click(screen.getByRole('button', { name: 'Skip' }))

  await screen.findByRole('heading', { name: 'Notes' })
}

describe('QuickLogWizardDialog', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mutateAsyncMock.mockReset()
    setBeanAvailabilityMock.mockReset()

    vi.mocked(useBeans).mockReturnValue(
      createQueryResult([{ id: beanId, name: 'Bean One' }]) as ReturnType<typeof useBeans>,
    )
    vi.mocked(useBrewers).mockReturnValue(
      createQueryResult([
        { id: brewerAId, name: 'Brewer A' },
        { id: brewerBId, name: 'Brewer B' },
      ]) as ReturnType<typeof useBrewers>,
    )
    vi.mocked(useRecipes).mockImplementation(
      ((brewerId?: string) =>
        createQueryResult(
          brewerId === brewerBId
            ? [{ id: recipeBId, name: 'Recipe B' }]
            : [{ id: recipeAId, name: 'Recipe A' }],
        )) as typeof useRecipes,
    )
    vi.mocked(useGrinders).mockReturnValue(
      createQueryResult([{ id: grinderId, name: 'Grinder One' }]) as ReturnType<
        typeof useGrinders
      >,
    )
    vi.mocked(useAccessories).mockReturnValue(
      createQueryResult([{ id: accessoryId, name: 'Accessory One' }]) as ReturnType<
        typeof useAccessories
      >,
    )
    vi.mocked(useCreateBrewLog).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateBrewLog>)
    vi.mocked(useSetBeanAvailability).mockReturnValue({
      mutateAsync: setBeanAvailabilityMock,
      isPending: false,
    } as unknown as ReturnType<typeof useSetBeanAvailability>)
  })

  it('shows bean options on the first step', () => {
    renderDialog()

    expect(screen.getByRole('heading', { name: 'Bean' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Bean One' })).toBeTruthy()
  })

  it('auto-advances to the brewer step after selecting a bean', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Bean One' }))

    expect(await screen.findByRole('heading', { name: 'Brewer' })).toBeTruthy()
  })

  it('keeps the user on the brew parameters step when required values are missing', async () => {
    const user = userEvent.setup()
    renderDialog()

    await goToBrewParameters(user)
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'Brew parameters' })).toBeTruthy()
    expect(screen.getByText('Dose must be greater than 0.')).toBeTruthy()
    expect(screen.getByText('Water amount must be greater than 0.')).toBeTruthy()
  })

  it('forces recipe re-entry after changing the brewer', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Bean One' }))
    await user.click(await screen.findByRole('radio', { name: 'Brewer A' }))
    await user.click(await screen.findByRole('radio', { name: 'Recipe A' }))
    await user.click(await screen.findByRole('radio', { name: 'Grinder One' }))

    await screen.findByRole('heading', { name: 'Accessories' })
    await user.click(screen.getByRole('button', { name: 'Brewer' }))
    await screen.findByRole('heading', { name: 'Brewer' })
    await user.click(screen.getByRole('radio', { name: 'Brewer B' }))

    expect(await screen.findByRole('heading', { name: 'Recipe' })).toBeTruthy()
    expect(screen.queryByRole('radio', { name: 'Recipe A' })).toBeNull()
    expect(screen.getByRole('radio', { name: 'Recipe B' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Grinder' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })

  it('jumps back to the matching step when submit returns server validation errors', async () => {
    const user = userEvent.setup()
    mutateAsyncMock.mockRejectedValue({
      errors: {
        dose: ['Dose is invalid.'],
      },
    })
    renderDialog()

    await completeRequiredFlow(user)
    await user.click(screen.getByRole('button', { name: 'Log brew' }))

    expect(await screen.findByRole('heading', { name: 'Brew parameters' })).toBeTruthy()
    expect(screen.getByText('Dose is invalid.')).toBeTruthy()
  })

  it('submits the normalized payload after skipping optional steps', async () => {
    const user = userEvent.setup()
    mutateAsyncMock.mockResolvedValue(undefined)
    renderDialog()

    await completeRequiredFlow(user)

    await user.click(screen.getByRole('button', { name: 'Log brew' }))

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
    })

    const [request] = mutateAsyncMock.mock.calls[0]
    expect(request).toMatchObject({
      beanId,
      brewerId: brewerAId,
      recipeId: recipeAId,
      grinderId,
      dose: 18,
      waterAmount: 300,
      waterTemperature: undefined,
      grindSize: undefined,
      brewTimeSeconds: undefined,
      rating: undefined,
      notes: undefined,
      adjustmentIdeas: undefined,
      accessoryIds: undefined,
    })
    expect(typeof request.brewedAt).toBe('string')
    expect(Number.isNaN(Date.parse(request.brewedAt))).toBe(false)
  })

  it('opens the low-stock prompt when the remaining bean quantity is low', async () => {
    const user = userEvent.setup()
    mutateAsyncMock.mockResolvedValue({ remainingBeanQuantity: 10 })
    renderDialog()

    await completeRequiredFlow(user)

    await user.click(screen.getByRole('button', { name: 'Log brew' }))

    expect(
      await screen.findByRole('heading', { name: 'Mark bean as unavailable?' }),
    ).toBeTruthy()
    expect(screen.getByText(/Only 10\.0g remains for this bean\./)).toBeTruthy()
  })
})
