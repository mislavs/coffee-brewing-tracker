import { BookOpen } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'

const allBrewersValue = '__all_brewers__'

export function RecipeListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brewerId = searchParams.get('brewerId') ?? ''
  const { data: brewers = [] } = useBrewers()
  const { data: recipes = [], isPending } = useRecipes(brewerId)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recipes</CardTitle>
          <CardDescription>Browse and manage your coffee recipes.</CardDescription>
        </div>
        <Button asChild>
          <Link to="/recipes/new">Add Recipe</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-md space-y-2">
          <label htmlFor="recipe-brewer-filter" className="text-sm font-medium">
            Filter by brewer
          </label>
          <Select
            value={brewerId || allBrewersValue}
            onValueChange={(nextValue) => {
              setSearchParams(
                (previous) => {
                  const next = new URLSearchParams(previous)
                  if (nextValue === allBrewersValue) {
                    next.delete('brewerId')
                  } else {
                    next.set('brewerId', nextValue)
                  }

                  return next
                },
                { replace: true },
              )
            }}
          >
            <SelectTrigger id="recipe-brewer-filter" className="w-full">
              <SelectValue placeholder="All brewers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allBrewersValue}>All brewers</SelectItem>
              {brewers.map((brewer) =>
                brewer.id ? (
                  <SelectItem key={brewer.id} value={brewer.id}>
                    {brewer.name ?? 'Unnamed brewer'}
                  </SelectItem>
                ) : null,
              )}
            </SelectContent>
          </Select>
        </div>

        {isPending && recipes.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton
                key={`recipe-skeleton-${index}`}
                className={
                  index === 3
                    ? 'hidden sm:block'
                    : index >= 4
                      ? 'hidden xl:block'
                      : undefined
                }
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-6" />}
            title="No recipes yet"
            description="Create your first recipe to save your favorite brew methods."
            actionLabel="Add Recipe"
            actionHref="/recipes/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id ?? `${recipe.name ?? 'recipe'}-${recipe.brewerName ?? ''}-${index}`}
                recipe={recipe}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
