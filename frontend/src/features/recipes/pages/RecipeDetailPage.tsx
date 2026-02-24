import { useState } from 'react'
import type { Guid } from '@/lib/api-types'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { DetailField } from '@/components/DetailField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDeleteRecipe } from '@/features/recipes/hooks/useDeleteRecipe'
import { useRecipe } from '@/features/recipes/hooks/useRecipe'
import { useEntityFormId } from '@/lib/useEntityFormId'

function RecipeDetailContent({ recipeId }: { recipeId: Guid }) {
  const navigate = useNavigate()
  const { data: recipe } = useRecipe(recipeId)
  const { mutateAsync: deleteRecipe, isPending: isDeleting } = useDeleteRecipe()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const confirmDelete = async () => {
    await deleteRecipe(recipeId)
    setIsDeleteDialogOpen(false)
    navigate('/recipes')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{recipe.name ?? 'Unnamed recipe'}</CardTitle>
          <CardDescription>Recipe details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <DetailField label="Brewer">
            {recipe.brewerId ? (
              <Link
                to={`/equipment/brewers/${recipe.brewerId}`}
                className="hover:underline"
              >
                {recipe.brewerName ?? 'View brewer'}
              </Link>
            ) : (
              (recipe.brewerName ?? '—')
            )}
          </DetailField>
          <div className="space-y-1 pt-2">
            <p className="font-medium text-muted-foreground">Description</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {recipe.description || '—'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          <Button asChild>
            <Link to={`/recipes/${recipeId}/edit`}>Edit</Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link to="/recipes">Back</Link>
          </Button>
        </CardFooter>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        entityName="recipe"
      />
    </>
  )
}

export function RecipeDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/recipes" replace />
  }

  return <RecipeDetailContent recipeId={entityId.id} />
}
