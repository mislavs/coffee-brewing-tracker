import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FieldErrorText } from '@/components/FieldErrorText'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { applyRecipeFormServerErrors } from '@/features/recipes/mapApiValidationErrors'
import {
  recipeFormSchema,
  type RecipeFormValues,
} from '@/features/recipes/recipeFormSchema'

type RecipeFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: RecipeFormValues
  onSubmit: (values: RecipeFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

export function RecipeFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
}: RecipeFormCardProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: initialValues,
  })
  const { data: brewers = [] } = useBrewers()

  const brewerOptions = useMemo(
    () =>
      brewers
        .map((brewer) =>
          brewer.id
            ? {
                id: brewer.id,
                name: brewer.name ?? 'Unnamed brewer',
              }
            : null,
        )
        .filter((brewer): brewer is { id: string; name: string } => Boolean(brewer)),
    [brewers],
  )

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values)
    } catch (error) {
      applyRecipeFormServerErrors(error, form.setError)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submitForm}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input id="name" {...form.register('name')} />
            <FieldErrorText message={form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="brewerId" className="text-sm font-medium">
              Brewer
            </label>
            <Controller
              control={form.control}
              name="brewerId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="brewerId" className="w-full">
                    <SelectValue placeholder="Select a brewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {brewerOptions.map((brewer) => (
                      <SelectItem key={brewer.id} value={brewer.id}>
                        {brewer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldErrorText message={form.formState.errors.brewerId?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              rows={5}
              {...form.register('description')}
            />
            <FieldErrorText message={form.formState.errors.description?.message} />
          </div>

          <FieldErrorText message={form.formState.errors.root?.serverError?.message} />

          <CardFooter className="px-0 pb-0 sm:px-0">
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : submitLabel}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={cancelHref}>Cancel</Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
