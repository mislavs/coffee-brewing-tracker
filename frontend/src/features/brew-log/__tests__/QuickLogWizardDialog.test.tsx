import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuickLogWizardDialog } from '@/features/brew-log/components/quick-log/QuickLogWizardDialog'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useLatestBrewLogForBean } from '@/features/brew-log/hooks/useLatestBrewLogForBean'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import type { BrewLogDto } from '@/lib/api/schemas'

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

vi.mock('@/features/brew-log/hooks/useLatestBrewLogForBean', () => ({
  useLatestBrewLogForBean: vi.fn(),
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
const grinderBId = '88888888-8888-8888-8888-888888888888'
const accessoryId = '77777777-7777-7777-7777-777777777777'
const accessoryBId = '99999999-9999-9999-9999-999999999999'

const mutateAsyncMock = vi.fn()
const setBeanAvailabilityMock = vi.fn()

function createQueryResult<T>(data: T) {
  return { data } as const
}

function renderDialog() {
  return render(<QuickLogWizardDialog open onOpenChange={vi.fn()} />)
}

async function findCurrentStepButton(name: string) {
  const buttons = await screen.findAllByRole('button', { name, current: 'step' })
  expect(buttons.length).toBeGreaterThan(0)
  return buttons[0]
}

function expectCurrentStepButton(name: string) {
  expect(screen.getAllByRole('button', { name, current: 'step' }).length).toBeGreaterThan(0)
}

function getReachedStepButton(name: string) {
  const button = screen
    .getAllByRole('button', { name })
    .find((button) => !(button as HTMLButtonElement).disabled)

  if (!button) {
    throw new Error(`Could not find reached step button named "${name}".`)
  }

  return button
}

async function goToBrewParameters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Bean One' }))
  await findCurrentStepButton('Brewer')

  await user.click(screen.getByRole('radio', { name: 'Brewer A' }))
  await findCurrentStepButton('Recipe')

  await user.click(screen.getByRole('radio', { name: 'Recipe A' }))
  await findCurrentStepButton('Grinder')

  await user.click(screen.getByRole('radio', { name: 'Grinder One' }))
  await findCurrentStepButton('Accessories')

  await user.click(screen.getByRole('button', { name: 'Skip' }))
  await findCurrentStepButton('Parameters')
}

async function completeRequiredFlow(user: ReturnType<typeof userEvent.setup>) {
  await goToBrewParameters(user)

  const doseInput = screen.getByLabelText('Dose (g)')
  const waterInput = screen.getByLabelText('Water (ml)')

  fireEvent.change(doseInput, { target: { value: '18' } })
  fireEvent.change(waterInput, { target: { value: '300' } })
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await findCurrentStepButton('Brew time')
  await user.click(screen.getByRole('button', { name: 'Skip' }))

  await findCurrentStepButton('Rating')
  await user.click(screen.getByRole('button', { name: 'Skip' }))

  await findCurrentStepButton('Notes')
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
    vi.mocked(useLatestBrewLogForBean).mockReturnValue(
      createQueryResult(null) as ReturnType<typeof useLatestBrewLogForBean>,
    )
    vi.mocked(useSetBeanAvailability).mockReturnValue({
      mutateAsync: setBeanAvailabilityMock,
      isPending: false,
    } as unknown as ReturnType<typeof useSetBeanAvailability>)
  })

  it('shows bean options on the first step', () => {
    renderDialog()

    expectCurrentStepButton('Bean')
    expect(screen.getByRole('radio', { name: 'Bean One' })).toBeTruthy()
  })

  it('auto-advances to the brewer step after selecting a bean', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Bean One' }))

    expect(await findCurrentStepButton('Brewer')).toBeTruthy()
  })

  it('skips the accessories step when no accessories are defined', async () => {
    const user = userEvent.setup()
    vi.mocked(useAccessories).mockReturnValue(
      createQueryResult([]) as ReturnType<typeof useAccessories>,
    )
    renderDialog()

    expect(screen.queryByRole('button', { name: 'Accessories' })).toBeNull()

    await user.click(screen.getByRole('radio', { name: 'Bean One' }))
    await findCurrentStepButton('Brewer')

    await user.click(screen.getByRole('radio', { name: 'Brewer A' }))
    await findCurrentStepButton('Recipe')

    await user.click(screen.getByRole('radio', { name: 'Recipe A' }))
    await findCurrentStepButton('Grinder')

    await user.click(screen.getByRole('radio', { name: 'Grinder One' }))

    expect(await findCurrentStepButton('Parameters')).toBeTruthy()
  })

  it('keeps the user on the brew parameters step when required values are missing', async () => {
    const user = userEvent.setup()
    renderDialog()

    await goToBrewParameters(user)
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expectCurrentStepButton('Parameters')
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

    await findCurrentStepButton('Accessories')
    await user.click(getReachedStepButton('Brewer'))
    await findCurrentStepButton('Brewer')
    await user.click(screen.getByRole('radio', { name: 'Brewer B' }))

    expect(await findCurrentStepButton('Recipe')).toBeTruthy()
    expect(screen.queryByRole('radio', { name: 'Recipe A' })).toBeNull()
    expect(screen.getByRole('radio', { name: 'Recipe B' })).toBeTruthy()
    expect(
      screen
        .getAllByRole('button', { name: 'Grinder' })
        .every((button) => (button as HTMLButtonElement).disabled),
    ).toBe(true)
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

    expect(await findCurrentStepButton('Parameters')).toBeTruthy()
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

  it('uses the selected bean latest brew as quick-log defaults without copying results', async () => {
    const user = userEvent.setup()
    const latestBrew: BrewLogDto = {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      beanId,
      brewerId: brewerBId,
      recipeId: recipeBId,
      grinderId: grinderBId,
      accessories: [{ id: accessoryBId, name: 'Accessory Two' }],
      dose: 20,
      waterAmount: 320,
      waterTemperature: 94,
      grindSize: 6.5,
      brewTimeSeconds: 165,
      rating: 5,
      notes: 'Do not copy this note.',
      adjustmentIdeas: 'Do not copy this adjustment.',
      brewedAt: '2026-04-26T08:00:00Z',
    }
    vi.mocked(useLatestBrewLogForBean).mockReturnValue(
      createQueryResult(latestBrew) as ReturnType<typeof useLatestBrewLogForBean>,
    )
    vi.mocked(useGrinders).mockReturnValue(
      createQueryResult([
        { id: grinderId, name: 'Grinder One' },
        { id: grinderBId, name: 'Grinder Two' },
      ]) as ReturnType<typeof useGrinders>,
    )
    vi.mocked(useAccessories).mockReturnValue(
      createQueryResult([
        { id: accessoryId, name: 'Accessory One' },
        { id: accessoryBId, name: 'Accessory Two' },
      ]) as ReturnType<typeof useAccessories>,
    )
    renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Bean One' }))

    await findCurrentStepButton('Brewer')
    const brewerOptions = screen.getAllByRole('radio')
    expect(brewerOptions[0].textContent).toBe('Brewer B')
    expect(brewerOptions[0].getAttribute('aria-checked')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await findCurrentStepButton('Recipe')
    const recipeOptions = screen.getAllByRole('radio')
    expect(recipeOptions[0].textContent).toBe('Recipe B')
    expect(recipeOptions[0].getAttribute('aria-checked')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await findCurrentStepButton('Grinder')
    const grinderOptions = screen.getAllByRole('radio')
    expect(grinderOptions[0].textContent).toBe('Grinder Two')
    expect(grinderOptions[0].getAttribute('aria-checked')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await findCurrentStepButton('Accessories')
    const accessoryOptions = screen.getAllByRole('button').filter((button) =>
      button.textContent?.startsWith('Accessory'),
    )
    expect(accessoryOptions[0].textContent).toBe('Accessory Two')
    expect(accessoryOptions[0].getAttribute('aria-pressed')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await findCurrentStepButton('Parameters')
    expect((screen.getByLabelText('Dose (g)') as HTMLInputElement).value).toBe('20')
    expect((screen.getByLabelText('Water (ml)') as HTMLInputElement).value).toBe('320')
    expect((screen.getByLabelText('Temp (°C)') as HTMLInputElement).value).toBe('94')
    expect((screen.getByLabelText('Grind size') as HTMLInputElement).value).toBe('6.5')

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await findCurrentStepButton('Brew time')
    expect((screen.getByLabelText('Minutes') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Seconds') as HTMLInputElement).value).toBe('')

    await user.click(screen.getByRole('button', { name: 'Skip' }))
    await findCurrentStepButton('Rating')
    expect(screen.queryByRole('radio', { checked: true })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Skip' }))
    await findCurrentStepButton('Notes')
    expect((screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement).value).toBe(
      '',
    )
    expect((screen.getByLabelText('Adjustment ideas') as HTMLTextAreaElement).value).toBe('')
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
