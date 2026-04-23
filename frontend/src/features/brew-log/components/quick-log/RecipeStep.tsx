import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import { toIdNameOptions } from '@/features/brew-log/components/brewLogFormShared'
import { EntitySingleSelectStep } from '@/features/brew-log/components/quick-log/EntitySingleSelectStep'
import type { QuickLogSingleSelectStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'

export function RecipeStep({ form, onSelect, disabled = false }: QuickLogSingleSelectStepProps) {
  const selectedBrewerId = useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const selectedRecipeId = useWatch({ control: form.control, name: 'recipeId' }) ?? ''
  const { data: recipes = [] } = useRecipes(selectedBrewerId)
  const options = useMemo(() => {
    if (!selectedBrewerId) {
      return []
    }

    return toIdNameOptions(recipes, 'Unnamed recipe')
  }, [recipes, selectedBrewerId])

  if (!selectedBrewerId) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Choose a brewer first.
        </div>
        <FieldErrorText message={form.formState.errors.recipeId?.message} />
      </div>
    )
  }

  return (
    <EntitySingleSelectStep
      options={options}
      selectedId={selectedRecipeId}
      onSelect={onSelect}
      error={form.formState.errors.recipeId?.message}
      emptyMessage="No recipes yet for this brewer. Add one in the Recipes section."
      disabled={disabled}
    />
  )
}
