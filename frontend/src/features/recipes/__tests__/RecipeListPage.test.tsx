import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecipeListPage } from '@/features/recipes/pages/RecipeListPage'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import type { BrewerSummaryDto, RecipeSummaryDto } from '@/lib/api/schemas'

vi.mock('@/features/equipment/hooks/useBrewers', () => ({
  useBrewers: vi.fn(),
}))

vi.mock('@/features/recipes/hooks/useRecipes', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/features/recipes/components/RecipeCard', () => ({
  RecipeCard: ({ recipe }: { recipe: RecipeSummaryDto }) => (
    <div>{recipe.name ?? 'Unnamed recipe'}</div>
  ),
}))

const brewers: BrewerSummaryDto[] = [{ id: 'brewer-1', name: 'V60' }]
const recipes: RecipeSummaryDto[] = [
  { id: 'recipe-1', name: 'Morning V60', brewerName: 'V60' },
]

function createQueryResult<T>(data: T) {
  return { data } as const
}

function renderPage(initialEntry = '/recipes') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <RecipeListPage />
    </MemoryRouter>,
  )
}

describe('RecipeListPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(useBrewers).mockReset()
    vi.mocked(useRecipes).mockReset()

    vi.mocked(useBrewers).mockReturnValue(
      createQueryResult(brewers) as ReturnType<typeof useBrewers>,
    )
    vi.mocked(useRecipes).mockReturnValue({
      data: recipes,
      isPending: false,
    } as ReturnType<typeof useRecipes>)
  })

  it('passes the brewer query parameter through and shows its chip when closed', async () => {
    const user = userEvent.setup()
    renderPage('/recipes?brewerId=brewer-1')

    expect(useRecipes).toHaveBeenLastCalledWith('brewer-1')
    expect(screen.getByRole('button', { name: 'Hide filters' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Hide filters' }))

    expect(screen.getByText('V60')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Show filters' })).toBeTruthy()
  })
})