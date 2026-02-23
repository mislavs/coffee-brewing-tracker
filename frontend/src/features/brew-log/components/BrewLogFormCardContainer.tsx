import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  brewLogFormSchema,
  type BrewLogFormInput,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import {
  BeanAndEquipmentSection,
  BrewedAtSection,
  BrewParametersSection,
  ResultsSection,
} from '@/features/brew-log/components/BrewLogFormSections'
import {
  toIdNameOptions,
} from '@/features/brew-log/components/brewLogFormShared'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import { useResetRecipeOnBrewerChange } from '@/features/brew-log/components/useResetRecipeOnBrewerChange'
import { applyBrewLogFormServerErrors } from '@/features/brew-log/mapApiValidationErrors'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'

type BrewLogFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: BrewLogFormValues
  onSubmit: (values: BrewLogFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

export function BrewLogFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
}: BrewLogFormCardProps) {
  const form = useForm<BrewLogFormInput, undefined, BrewLogFormValues>({
    resolver: zodResolver(brewLogFormSchema),
    defaultValues: initialValues,
  })
  const watchedBrewerId =
    useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const { data: beans = [] } = useBeans()
  const { data: brewers = [] } = useBrewers()
  const { data: grinders = [] } = useGrinders()
  const { data: recipes = [] } = useRecipes(watchedBrewerId)

  const beanOptions = useMemo(
    () => toIdNameOptions(beans, 'Unnamed bean'),
    [beans],
  )
  const brewerOptions = useMemo(
    () => toIdNameOptions(brewers, 'Unnamed brewer'),
    [brewers],
  )
  const grinderOptions = useMemo(
    () => toIdNameOptions(grinders, 'Unnamed grinder'),
    [grinders],
  )
  const recipeOptions = useMemo(() => {
    if (!watchedBrewerId) {
      return []
    }

    return toIdNameOptions(recipes, 'Unnamed recipe')
  }, [recipes, watchedBrewerId])

  useResetRecipeOnBrewerChange(form, watchedBrewerId, initialValues.brewerId)

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values)
    } catch (error) {
      applyBrewLogFormServerErrors(error, form.setError)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={submitForm}>
          <BeanAndEquipmentSection
            form={form}
            beanOptions={beanOptions}
            brewerOptions={brewerOptions}
            grinderOptions={grinderOptions}
            recipeOptions={recipeOptions}
            hasSelectedBrewer={Boolean(watchedBrewerId)}
          />

          <BrewParametersSection form={form} />
          <ResultsSection form={form} />
          <BrewedAtSection form={form} />

          <FieldErrorText message={form.formState.errors.root?.serverError?.message} />

          <CardFooter className="px-0 pb-0">
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
