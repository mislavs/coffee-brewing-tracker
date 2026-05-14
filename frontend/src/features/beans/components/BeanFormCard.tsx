import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type Path,
  type PathValue,
  useForm,
} from 'react-hook-form'
import { ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ImageUpload } from '@/components/ImageUpload'
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
import {
  beanFormSchema,
  type BeanFormInput,
  type BeanFormValues,
} from '@/features/beans/beanFormSchema'
import {
  toDateInputValue,
  toOriginTypeValue,
  toRoastProfileValue,
} from '@/features/beans/beanShared'
import {
  BeanClassificationSection,
  BeanFlavorAndOriginSection,
  BeanIdentitySection,
  BeanInventorySection,
  BeanProcessingSection,
} from '@/features/beans/components/BeanFormSections'
import { ImageExtractionDialog } from '@/features/beans/components/ImageExtractionDialog'
import { useCountries } from '@/features/beans/hooks/useCountries'
import { useFlavorNotes } from '@/features/beans/hooks/useFlavorNotes'
import { applyBeanFormServerErrors } from '@/features/beans/mapApiValidationErrors'
import { useRoasters } from '@/features/roasters/hooks/useRoasters'
import { useCreateRoaster } from '@/features/roasters/hooks/useCreateRoaster'
import { RoasterFormCard } from '@/features/roasters/components/RoasterFormCard'
import { useFeatures } from '@/hooks/useFeatures'
import {
  getFieldErrorMessage,
  normalizeOptional,
} from '@/lib/formUtils'
import { FieldErrorText } from '@/components/FieldErrorText'
import type { ParseBeanImageResponse } from '@/lib/api/schemas'
import {
  type RoasterFormValues,
} from '@/features/roasters/roasterFormSchema'

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

type BeanFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: BeanFormValues
  onSubmit: (values: BeanFormValues, image: BeanImageSubmission) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
  isEditMode?: boolean
  existingImageUrl?: string | null
}

type BeanImageSubmission = {
  file: File | null
  removeExistingImage: boolean
}

export function BeanFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
  isEditMode = false,
  existingImageUrl,
}: BeanFormCardProps) {
  const form = useForm<BeanFormInput, undefined, BeanFormValues>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: initialValues,
  })
  const { data: features } = useFeatures()
  const { data: roasters = [] } = useRoasters()
  const { data: countries = [] } = useCountries()
  const { data: flavorNotes = [] } = useFlavorNotes()
  const { mutateAsync: createRoaster, isPending: isCreatingRoaster } =
    useCreateRoaster()

  const [isCreateRoasterOpen, setIsCreateRoasterOpen] = useState(false)
  const [isImageExtractionOpen, setIsImageExtractionOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const selectedImagePreviewUrl = useMemo(
    () => (selectedImageFile ? URL.createObjectURL(selectedImageFile) : null),
    [selectedImageFile],
  )

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
    () =>
      countries
        .map((country) => {
          const id = country.id?.trim()
          const name = country.name?.trim()

          return id && name ? { id, name } : null
        })
        .filter((country): country is { id: string; name: string } => Boolean(country)),
    [countries],
  )
  const countryIdToName = useMemo(
    () => new Map(countryOptions.map((country) => [country.id, country.name])),
    [countryOptions],
  )
  const countryNameToId = useMemo(
    () =>
      new Map(countryOptions.map((country) => [country.name.toLowerCase(), country.id])),
    [countryOptions],
  )
  const flavorNoteOptions = useMemo(
    () => toDistinctOptions(flavorNotes.map((note) => note.name)),
    [flavorNotes],
  )
  const originCountryIdsError = getFieldErrorMessage(
    form.formState.errors.originCountryIds,
  )
  const flavorNotesError = getFieldErrorMessage(
    form.formState.errors.flavorNoteNames,
  )
  const effectiveImagePreviewUrl =
    selectedImagePreviewUrl ?? (removeExistingImage ? null : existingImageUrl ?? null)

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
    }
  }, [selectedImagePreviewUrl])

  const toCountryNames = (countryIds: string[]) =>
    countryIds.flatMap((countryId) => {
      const name = countryIdToName.get(countryId)
      return name ? [name] : []
    })

  const toCountryIds = (countryNames: string[]) =>
    countryNames.flatMap((countryName) => {
      const countryId = countryNameToId.get(countryName.trim().toLowerCase())
      return countryId ? [countryId] : []
    })

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values, {
        file: selectedImageFile,
        removeExistingImage: removeExistingImage && !selectedImageFile,
      })
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

  const handleFillFromImage = (result: ParseBeanImageResponse) => {
    const setValueOptions = { shouldDirty: true, shouldValidate: true } as const
    const setIfPresent = <K extends keyof BeanFormValues>(
      field: K,
      value: PathValue<BeanFormValues, Path<BeanFormValues>> | null | undefined,
    ) => {
      if (value != null) {
        form.setValue(
          field as Path<BeanFormValues>,
          value as PathValue<BeanFormValues, Path<BeanFormValues>>,
          setValueOptions,
        )
      }
    }

    setIfPresent('name', result.beanName)
    setIfPresent('roasterId', result.roasterId)

    const originType = toOriginTypeValue(result.originType)
    setIfPresent('originType', originType)
    if (result.originCountries != null) {
      setIfPresent('originCountryIds', toCountryIds(result.originCountries))
    }
    setIfPresent('variety', result.variety)
    setIfPresent('processingMethod', result.processingMethod)
    setIfPresent('region', result.region)

    const roastProfile = toRoastProfileValue(result.roastProfile)
    setIfPresent('roastProfile', roastProfile)

    if (result.roastDate != null) {
      const roastDate = toDateInputValue(result.roastDate)
      setIfPresent('roastDate', roastDate)
    }

    setIfPresent('flavorNoteNames', result.flavorNotes)
    setIfPresent('altitude', result.altitude)
    setIfPresent('bagWeight', result.bagWeight)
    setIfPresent('price', result.price)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {features?.imageBeanParsing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImageExtractionOpen(true)}
            >
              <ImagePlus className="size-4" />
              Extract from image
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitForm}>
            <ImageUpload
              id="bean-image"
              label="Bean Image"
              previewUrl={effectiveImagePreviewUrl}
              previewAlt="Bean image preview"
              onFileSelected={(file) => {
                setSelectedImageFile(file)
                if (file) {
                  setRemoveExistingImage(false)
                }
              }}
              onRemove={() => {
                if (selectedImageFile) {
                  setSelectedImageFile(null)
                  return
                }

                if (existingImageUrl) {
                  setRemoveExistingImage(true)
                }
              }}
              accept="image/png,image/jpeg,image/webp"
              helperText="PNG, JPEG, or WebP. Max 5 MB."
              disabled={isSubmitting}
            />

            <BeanIdentitySection
              form={form}
              roasterOptions={roasterOptions}
              onCreateRoaster={() => setIsCreateRoasterOpen(true)}
            />

            <BeanClassificationSection
              form={form}
              countryOptions={countryOptions}
              originCountryIdsError={originCountryIdsError}
              toCountryNames={toCountryNames}
              toCountryIds={toCountryIds}
            />

            <BeanFlavorAndOriginSection
              form={form}
              flavorNoteOptions={flavorNoteOptions}
              flavorNotesError={flavorNotesError}
            />

            <BeanProcessingSection form={form} />

            <BeanInventorySection form={form} isEditMode={isEditMode} />

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

      {isImageExtractionOpen ? (
        <ImageExtractionDialog
          open={isImageExtractionOpen}
          onOpenChange={setIsImageExtractionOpen}
          onFillForm={handleFillFromImage}
        />
      ) : null}
    </>
  )
}
