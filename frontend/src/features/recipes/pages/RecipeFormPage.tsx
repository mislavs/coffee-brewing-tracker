import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { RecipeFormCard } from '@/features/recipes/components/RecipeFormCard'
import { useCreateRecipe } from '@/features/recipes/hooks/useCreateRecipe'
import { useRecipe } from '@/features/recipes/hooks/useRecipe'
import { useUpdateRecipe } from '@/features/recipes/hooks/useUpdateRecipe'
import { normalizeOptional } from '@/features/recipes/recipeFormSchema'
import { tryParseGuid } from '@/lib/guid'

function CreateRecipeForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateRecipe()

  return (
    <RecipeFormCard
      title="Create Recipe"
      description="Add a new coffee recipe."
      submitLabel="Create"
      cancelHref="/recipes"
      isSubmitting={isPending}
      initialValues={{
        name: '',
        brewerId: '',
        description: '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          name: values.name.trim(),
          brewerId: values.brewerId as Guid,
          description: normalizeOptional(values.description),
        })
        navigate('/recipes')
      }}
    />
  )
}

function EditRecipeForm({ recipeId }: { recipeId: Guid }) {
  const navigate = useNavigate()
  const { data: recipe } = useRecipe(recipeId)
  const { mutateAsync, isPending } = useUpdateRecipe()

  return (
    <RecipeFormCard
      title="Edit Recipe"
      description="Update recipe information."
      submitLabel="Save"
      cancelHref={`/recipes/${recipeId}`}
      isSubmitting={isPending}
      initialValues={{
        name: recipe.name ?? '',
        brewerId: recipe.brewerId ?? '',
        description: recipe.description ?? '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: recipeId,
          request: {
            name: values.name.trim(),
            brewerId: values.brewerId as Guid,
            description: normalizeOptional(values.description),
          },
        })

        navigate(`/recipes/${recipeId}`)
      }}
    />
  )
}

export function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const recipeId = tryParseGuid(id)

  if (!id || !recipeId) {
    if (id) {
      return <Navigate to="/recipes" replace />
    }

    return <CreateRecipeForm />
  }

  return <EditRecipeForm recipeId={recipeId} />
}
