import { useMemo, useState } from 'react'
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
import { VoiceInputButton } from '@/features/brew-log/components/VoiceInputButton'
import { VoiceInputDialog } from '@/features/brew-log/components/VoiceInputDialog'
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
import type { ParseVoiceBrewLogResponse } from '@/lib/api/schemas'

type BrewLogFormCardProps = {
  title: string
  description?: string
  submitLabel: string
  initialValues: BrewLogFormValues
  onSubmit: (values: BrewLogFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
  showVoiceInput?: boolean
  initialVoiceDialogOpen?: boolean
}

export function BrewLogFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
  showVoiceInput = false,
  initialVoiceDialogOpen = false,
}: BrewLogFormCardProps) {
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(initialVoiceDialogOpen)
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

  const handleVoiceFill = (result: ParseVoiceBrewLogResponse) => {
    const validated = { shouldValidate: true } as const
    const setValidatedValue = (
      field: keyof BrewLogFormValues,
      value: string | number | string[] | undefined,
    ) => {
      form.setValue(field as never, value as never, validated)
    }

    if (result.beanId) setValidatedValue('beanId', result.beanId)
    if (result.brewerId) setValidatedValue('brewerId', result.brewerId)
    if (result.grinderId) setValidatedValue('grinderId', result.grinderId)
    if (result.recipeId) setValidatedValue('recipeId', result.recipeId)
    if (result.accessoryIds) setValidatedValue('accessoryIds', result.accessoryIds)
    if (result.dose != null) setValidatedValue('dose', result.dose)
    if (result.waterAmount != null) setValidatedValue('waterAmount', result.waterAmount)
    if (result.waterTemperature != null) {
      setValidatedValue('waterTemperature', result.waterTemperature)
    }
    if (result.grindSize != null) setValidatedValue('grindSize', result.grindSize)
    if (result.brewTimeSeconds != null) {
      setValidatedValue('brewTimeMinutes', Math.floor(result.brewTimeSeconds / 60))
      setValidatedValue('brewTimeSeconds', result.brewTimeSeconds % 60)
    }
    if (result.rating != null) setValidatedValue('rating', result.rating)
    if (result.notes) setValidatedValue('tastingNotes', result.notes)
    if (result.adjustmentIdeas) {
      setValidatedValue('adjustmentIdeas', result.adjustmentIdeas)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {showVoiceInput ? (
          <VoiceInputButton
            onClick={() => setVoiceDialogOpen(true)}
            disabled={isSubmitting}
          />
        ) : null}
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

          <CardFooter className="px-0 pb-0 sm:px-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
      {showVoiceInput ? (
        <VoiceInputDialog
          open={voiceDialogOpen}
          onOpenChange={setVoiceDialogOpen}
          onFillForm={handleVoiceFill}
        />
      ) : null}
    </Card>
  )
}
