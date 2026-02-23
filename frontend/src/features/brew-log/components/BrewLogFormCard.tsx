import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  brewLogFormSchema,
  type BrewLogFormInput,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import { applyBrewLogFormServerErrors } from '@/features/brew-log/mapApiValidationErrors'
import { useBeans } from '@/features/beans/hooks/useBeans'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'

const noRecipeValue = '__no_recipe__'

function FieldErrorText({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const errorRecord = error as { message?: unknown }
  return typeof errorRecord.message === 'string' ? errorRecord.message : undefined
}

type AccessoryMultiSelectProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function includesIgnoreCase(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

function AccessoryMultiSelect({ selectedIds, onChange }: AccessoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { data: accessories = [] } = useAccessories()

  const accessoryOptions = useMemo(
    () =>
      accessories
        .map((accessory) =>
          accessory.id
            ? {
                id: accessory.id,
                name: accessory.name ?? 'Unnamed accessory',
              }
            : null,
        )
        .filter(
          (accessory): accessory is { id: string; name: string } => Boolean(accessory),
        ),
    [accessories],
  )

  const selectedAccessories = useMemo(
    () => accessoryOptions.filter((accessory) => selectedIds.includes(accessory.id)),
    [accessoryOptions, selectedIds],
  )

  const filteredOptions = useMemo(
    () =>
      accessoryOptions.filter((accessory) =>
        query.trim() ? includesIgnoreCase(accessory.name, query.trim()) : true,
      ),
    [accessoryOptions, query],
  )

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existingId) => existingId !== id))
      return
    }

    onChange([...selectedIds, id])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedAccessories.length > 0
              ? `${selectedAccessories.length} selected`
              : 'Select accessories'}
            <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search accessories..."
            />
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>No accessories found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((accessory) => {
                    const isSelected = selectedIds.includes(accessory.id)

                    return (
                      <CommandItem
                        key={accessory.id}
                        value={accessory.name}
                        onSelect={() => toggleSelection(accessory.id)}
                      >
                        <CheckIcon
                          className={`size-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {accessory.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAccessories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAccessories.map((accessory) => (
            <Badge key={accessory.id} variant="secondary">
              {accessory.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const previousBrewerIdRef = useRef(initialValues.brewerId)
  const { data: beans = [] } = useBeans()
  const { data: brewers = [] } = useBrewers()
  const { data: grinders = [] } = useGrinders()
  const watchedBrewerId = form.watch('brewerId')
  const watchedDose = form.watch('dose')
  const watchedWaterAmount = form.watch('waterAmount')
  const { data: recipes = [] } = useRecipes(watchedBrewerId)

  const beanOptions = useMemo(
    () =>
      beans
        .map((bean) =>
          bean.id
            ? {
                id: bean.id,
                name: bean.name ?? 'Unnamed bean',
              }
            : null,
        )
        .filter((bean): bean is { id: string; name: string } => Boolean(bean)),
    [beans],
  )

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

  const grinderOptions = useMemo(
    () =>
      grinders
        .map((grinder) =>
          grinder.id
            ? {
                id: grinder.id,
                name: grinder.name ?? 'Unnamed grinder',
              }
            : null,
        )
        .filter((grinder): grinder is { id: string; name: string } => Boolean(grinder)),
    [grinders],
  )

  const recipeOptions = useMemo(() => {
    if (!watchedBrewerId) {
      return []
    }

    return recipes
      .map((recipe) =>
        recipe.id
          ? {
              id: recipe.id,
              name: recipe.name ?? 'Unnamed recipe',
            }
          : null,
      )
      .filter((recipe): recipe is { id: string; name: string } => Boolean(recipe))
  }, [recipes, watchedBrewerId])

  useEffect(() => {
    if (previousBrewerIdRef.current !== watchedBrewerId) {
      form.setValue('recipeId', undefined, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    previousBrewerIdRef.current = watchedBrewerId
  }, [form, watchedBrewerId])

  const normalizedDose =
    typeof watchedDose === 'number' ? watchedDose : Number(watchedDose)
  const normalizedWaterAmount =
    typeof watchedWaterAmount === 'number'
      ? watchedWaterAmount
      : Number(watchedWaterAmount)
  const liveRatio =
    normalizedDose > 0 && normalizedWaterAmount > 0
      ? `1:${(normalizedWaterAmount / normalizedDose).toFixed(1)}`
      : '—'

  const accessoryError = getFieldErrorMessage(form.formState.errors.accessoryIds)

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
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Bean and Equipment</h3>
              <p className="text-muted-foreground text-sm">
                Choose the bean and equipment used for this brew.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="beanId" className="text-sm font-medium">
                  Bean
                </label>
                <Controller
                  control={form.control}
                  name="beanId"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger id="beanId" className="w-full">
                        <SelectValue placeholder="Select a bean" />
                      </SelectTrigger>
                      <SelectContent>
                        {beanOptions.map((bean) => (
                          <SelectItem key={bean.id} value={bean.id}>
                            {bean.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldErrorText message={form.formState.errors.beanId?.message} />
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
                <label htmlFor="recipeId" className="text-sm font-medium">
                  Recipe (optional)
                </label>
                <Controller
                  control={form.control}
                  name="recipeId"
                  render={({ field }) => (
                    <Select
                      value={
                        typeof field.value === 'string' && field.value
                          ? field.value
                          : noRecipeValue
                      }
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue === noRecipeValue ? undefined : nextValue)
                      }
                      disabled={!watchedBrewerId}
                    >
                      <SelectTrigger id="recipeId" className="w-full">
                        <SelectValue placeholder="No recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={noRecipeValue}>No recipe</SelectItem>
                        {recipeOptions.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldErrorText message={form.formState.errors.recipeId?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="grinderId" className="text-sm font-medium">
                  Grinder
                </label>
                <Controller
                  control={form.control}
                  name="grinderId"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger id="grinderId" className="w-full">
                        <SelectValue placeholder="Select a grinder" />
                      </SelectTrigger>
                      <SelectContent>
                        {grinderOptions.map((grinder) => (
                          <SelectItem key={grinder.id} value={grinder.id}>
                            {grinder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldErrorText message={form.formState.errors.grinderId?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Accessories</label>
              <Controller
                control={form.control}
                name="accessoryIds"
                render={({ field }) => (
                  <AccessoryMultiSelect
                    selectedIds={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldErrorText message={accessoryError} />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Brew Parameters</h3>
              <p className="text-muted-foreground text-sm">
                Capture your dose, water, and grind settings.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="dose" className="block text-sm font-medium">
                  Dose (g)
                </label>
                <Input
                  id="dose"
                  type="number"
                  step="0.1"
                  className="w-28"
                  {...form.register('dose')}
                />
                <FieldErrorText message={form.formState.errors.dose?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="waterAmount" className="block text-sm font-medium">
                  Water amount (ml)
                </label>
                <Input
                  id="waterAmount"
                  type="number"
                  step="0.1"
                  className="w-28"
                  {...form.register('waterAmount')}
                />
                <FieldErrorText message={form.formState.errors.waterAmount?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="brewRatio" className="block text-sm font-medium">
                  Brew ratio
                </label>
                <Input
                  id="brewRatio"
                  value={liveRatio}
                  readOnly
                  tabIndex={-1}
                  className="bg-muted/30 w-28 tabular-nums font-medium"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="waterTemperature" className="block text-sm font-medium">
                  Water temperature (C)
                </label>
                <Input
                  id="waterTemperature"
                  type="number"
                  step="0.1"
                  className="w-28"
                  {...form.register('waterTemperature')}
                />
                <FieldErrorText
                  message={form.formState.errors.waterTemperature?.message}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="grindSize" className="block text-sm font-medium">
                  Grind size
                </label>
                <Input
                  id="grindSize"
                  className="w-28 max-w-full"
                  {...form.register('grindSize')}
                />
                <FieldErrorText message={form.formState.errors.grindSize?.message} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Results</h3>
              <p className="text-muted-foreground text-sm">
                Record outcome details and notes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brew time</label>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="space-y-2">
                    <label htmlFor="brewTimeMinutes" className="text-muted-foreground block text-xs font-medium">
                      minutes
                    </label>
                    <Input
                      id="brewTimeMinutes"
                      type="number"
                      className="w-24"
                      {...form.register('brewTimeMinutes')}
                    />
                    <FieldErrorText
                      message={form.formState.errors.brewTimeMinutes?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brewTimeSeconds" className="text-muted-foreground block text-xs font-medium">
                      seconds
                    </label>
                    <Input
                      id="brewTimeSeconds"
                      type="number"
                      min={0}
                      max={59}
                      className="w-24"
                      {...form.register('brewTimeSeconds')}
                    />
                    <FieldErrorText
                      message={form.formState.errors.brewTimeSeconds?.message}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Controller
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <EmojiRatingPicker
                      value={typeof field.value === 'number' ? field.value : undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldErrorText message={form.formState.errors.rating?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tastingNotes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="tastingNotes"
                rows={4}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('tastingNotes')}
              />
              <FieldErrorText message={form.formState.errors.tastingNotes?.message} />
            </div>

            <div className="space-y-2">
              <label htmlFor="adjustmentIdeas" className="text-sm font-medium">
                Adjustment ideas
              </label>
              <textarea
                id="adjustmentIdeas"
                rows={4}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('adjustmentIdeas')}
              />
              <FieldErrorText message={form.formState.errors.adjustmentIdeas?.message} />
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="brewedAt" className="text-sm font-medium">
                Brewed at
              </label>
              <Input id="brewedAt" type="datetime-local" {...form.register('brewedAt')} />
              <FieldErrorText message={form.formState.errors.brewedAt?.message} />
            </div>
          </section>

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
