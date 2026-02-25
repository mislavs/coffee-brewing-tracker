import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'

const allBrewersValue = '__all_brewers__'

function truncateDescription(value: string | null | undefined) {
  if (!value) {
    return '—'
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return '—'
  }

  if (trimmed.length <= 120) {
    return trimmed
  }

  return `${trimmed.slice(0, 117)}...`
}

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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brewer</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && recipes.length === 0 ? (
              <TableRowSkeleton
                columns={3}
                rowCount={5}
                columnWidthClasses={['w-2/3', 'w-1/2', 'w-5/6']}
              />
            ) : recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No recipes yet. Add your first recipe to get started.
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow
                  key={recipe.id ?? `${recipe.name ?? 'recipe'}-${recipe.brewerName ?? ''}`}
                >
                  <TableCell className="font-medium">
                    {recipe.id ? (
                      <Link to={`/recipes/${recipe.id}`} className="hover:underline">
                        {recipe.name ?? 'Unnamed recipe'}
                      </Link>
                    ) : (
                      (recipe.name ?? 'Unnamed recipe')
                    )}
                  </TableCell>
                  <TableCell>{recipe.brewerName || '—'}</TableCell>
                  <TableCell>{truncateDescription(recipe.description)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
