import { useState } from 'react'
import { BookOpen, Filter } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { getSkeletonVisibilityClassName } from '@/components/skeletons/utils'
import {
  Card,
  CardContent,
  CardHeader,
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(Boolean(brewerId))
  const { data: brewers = [] } = useBrewers()
  const { data: recipes = [], isPending } = useRecipes(brewerId)

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isFiltersOpen ? 'secondary' : 'ghost'}
            size="icon"
            aria-expanded={isFiltersOpen}
            aria-controls="recipe-filters"
            aria-label={isFiltersOpen ? 'Hide filters' : 'Show filters'}
            title={isFiltersOpen ? 'Hide filters' : 'Show filters'}
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            <Filter className="size-4" />
          </Button>
          <Button asChild>
            <Link to="/recipes/new">Add Recipe</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFiltersOpen ? (
          <div id="recipe-filters" className="max-w-md space-y-2">
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
        ) : null}

        {isPending && recipes.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton
                key={`recipe-skeleton-${index}`}
                className={getSkeletonVisibilityClassName(index)}
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
