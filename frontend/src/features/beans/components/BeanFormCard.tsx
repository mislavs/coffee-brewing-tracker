import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  beanFormSchema,
  type BeanFormInput,
  type BeanFormValues,
} from '@/features/beans/beanFormSchema'
import {
  originTypeLabels,
  roastProfileLabels,
} from '@/features/beans/beanShared'
import { useCountries } from '@/features/beans/hooks/useCountries'
import { useFlavorNotes } from '@/features/beans/hooks/useFlavorNotes'
import { applyBeanFormServerErrors } from '@/features/beans/mapApiValidationErrors'
import { TagCombobox } from '@/features/beans/components/TagCombobox'
import { useRoasters } from '@/features/roasters/hooks/useRoasters'
import { useCreateRoaster } from '@/features/roasters/hooks/useCreateRoaster'
import { RoasterFormCard } from '@/features/roasters/components/RoasterFormCard'
import {
  normalizeOptional,
  type RoasterFormValues,
} from '@/features/roasters/roasterFormSchema'

const createRoasterValue = '__create_roaster__'

function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const errorRecord = error as { message?: unknown }
  return typeof errorRecord.message === 'string' ? errorRecord.message : undefined
}

function toDistinctOptions(values: (string | null | undefined)[]) {
  const distinct: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const normalized = value?.trim()
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    distinct.push(normalized)
  }

  return distinct
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

type BeanFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: BeanFormValues
  onSubmit: (values: BeanFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

export function BeanFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
}: BeanFormCardProps) {
  const form = useForm<BeanFormInput, undefined, BeanFormValues>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: initialValues,
  })
  const { data: roasters = [] } = useRoasters()
  const { data: countries = [] } = useCountries()
  const { data: flavorNotes = [] } = useFlavorNotes()
  const { mutateAsync: createRoaster, isPending: isCreatingRoaster } =
    useCreateRoaster()

  const [isCreateRoasterOpen, setIsCreateRoasterOpen] = useState(false)
  const watchedRoastDate = useWatch({ control: form.control, name: 'roastDate' })

  const roasterOptions = useMemo(
    () =>
      roasters
        .map((roaster) =>
          roaster.id
            ? {
                id: roaster.id,
                name: roaster.name ?? 'Unnamed roaster',
              }
            : null,
        )
        .filter((roaster): roaster is { id: string; name: string } => Boolean(roaster)),
    [roasters],
  )

  const countryOptions = useMemo(
    () => toDistinctOptions(countries.map((country) => country.name)),
    [countries],
  )
  const flavorNoteOptions = useMemo(
    () => toDistinctOptions(flavorNotes.map((note) => note.name)),
    [flavorNotes],
  )
  const originCountriesError = getFieldErrorMessage(
    form.formState.errors.originCountries,
  )
  const flavorNotesError = getFieldErrorMessage(
    form.formState.errors.flavorNoteNames,
  )

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values)
    } catch (error) {
      applyBeanFormServerErrors(error, form.setError)
    }
  })

  const submitInlineRoaster = async (values: RoasterFormValues) => {
    const response = await createRoaster({
      name: values.name.trim(),
      city: normalizeOptional(values.city),
      countryId: normalizeOptional(values.countryId),
    })

    const createdId = response?.id
    if (!createdId) {
      return
    }

    form.setValue('roasterId', createdId, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setIsCreateRoasterOpen(false)
  }

  return (
    <>
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
              <label htmlFor="roasterId" className="text-sm font-medium">
                Roaster
              </label>
              <Controller
                control={form.control}
                name="roasterId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(nextValue) => {
                      if (nextValue === createRoasterValue) {
                        setIsCreateRoasterOpen(true)
                        return
                      }

                      field.onChange(nextValue)
                    }}
                  >
                    <SelectTrigger id="roasterId" className="w-full">
                      <SelectValue placeholder="Select a roaster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={createRoasterValue}>
                        + Create roaster
                      </SelectItem>
                      {roasterOptions.map((roaster) => (
                        <SelectItem key={roaster.id} value={roaster.id}>
                          {roaster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldErrorText message={form.formState.errors.roasterId?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="originType" className="text-sm font-medium">
                  Origin Type
                </label>
                <Controller
                  control={form.control}
                  name="originType"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(nextValue) => field.onChange(Number(nextValue))}
                    >
                      <SelectTrigger id="originType" className="w-full">
                        <SelectValue placeholder="Select origin type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(originTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldErrorText message={form.formState.errors.originType?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="roastProfile" className="text-sm font-medium">
                  Roast Profile
                </label>
                <Controller
                  control={form.control}
                  name="roastProfile"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(nextValue) => field.onChange(Number(nextValue))}
                    >
                      <SelectTrigger id="roastProfile" className="w-full">
                        <SelectValue placeholder="Select roast profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roastProfileLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldErrorText
                  message={form.formState.errors.roastProfile?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Origin Countries</label>
              <Controller
                control={form.control}
                name="originCountries"
                render={({ field }) => (
                  <TagCombobox
                    placeholder="Select or create countries"
                    searchPlaceholder="Search countries..."
                    emptyMessage="No countries found."
                    createLabel={(value) => `Create "${value}"`}
                    values={field.value ?? []}
                    options={countryOptions}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldErrorText message={originCountriesError} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Flavor Notes</label>
              <Controller
                control={form.control}
                name="flavorNoteNames"
                render={({ field }) => (
                  <TagCombobox
                    placeholder="Select or create flavor notes"
                    searchPlaceholder="Search flavor notes..."
                    emptyMessage="No flavor notes found."
                    createLabel={(value) => `Create "${value}"`}
                    values={field.value ?? []}
                    options={flavorNoteOptions}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldErrorText message={flavorNotesError} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="variety" className="text-sm font-medium">
                  Variety
                </label>
                <Input id="variety" {...form.register('variety')} />
                <FieldErrorText message={form.formState.errors.variety?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="processingMethod" className="text-sm font-medium">
                  Processing Method
                </label>
                <Input
                  id="processingMethod"
                  {...form.register('processingMethod')}
                />
                <FieldErrorText
                  message={form.formState.errors.processingMethod?.message}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="roastDate" className="text-sm font-medium">
                  Roast Date
                </label>
                <DatePicker
                  id="roastDate"
                  value={typeof watchedRoastDate === 'string' ? watchedRoastDate : undefined}
                  onChange={(nextValue) => {
                    form.clearErrors('roastDate')
                    form.setValue('roastDate', nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                  onInvalidInput={() => {
                    form.setError('roastDate', {
                      type: 'manual',
                      message: 'Use format dd.mm.yyyy.',
                    })
                  }}
                />
                <FieldErrorText message={form.formState.errors.roastDate?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="altitude" className="text-sm font-medium">
                  Altitude (m)
                </label>
                <Input
                  id="altitude"
                  type="number"
                  {...form.register('altitude', { valueAsNumber: true })}
                />
                <FieldErrorText message={form.formState.errors.altitude?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bagWeight" className="text-sm font-medium">
                  Bag Weight (g)
                </label>
                <Input
                  id="bagWeight"
                  type="number"
                  {...form.register('bagWeight', { valueAsNumber: true })}
                />
                <FieldErrorText message={form.formState.errors.bagWeight?.message} />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                />
                <FieldErrorText message={form.formState.errors.price?.message} />
              </div>
            </div>

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

      <Dialog open={isCreateRoasterOpen} onOpenChange={setIsCreateRoasterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Roaster</DialogTitle>
            <DialogDescription>
              Add a new roaster and continue creating this bean.
            </DialogDescription>
          </DialogHeader>
          <RoasterFormCard
            title="Create Roaster"
            description="Add a roaster without leaving this form."
            submitLabel="Create"
            initialValues={{
              name: '',
              city: '',
              countryId: undefined,
            }}
            onSubmit={submitInlineRoaster}
            isSubmitting={isCreatingRoaster}
            cancelHref={cancelHref}
            onCancel={() => setIsCreateRoasterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
