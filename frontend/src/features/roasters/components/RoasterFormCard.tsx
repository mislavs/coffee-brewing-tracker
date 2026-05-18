import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCountries } from '@/features/beans/hooks/useCountries'
import { applyRoasterFormServerErrors } from '@/features/roasters/mapApiValidationErrors'
import {
  roasterFormSchema,
  type RoasterFormValues,
} from '@/features/roasters/roasterFormSchema'
import { FieldErrorText } from '@/components/FieldErrorText'

type RoasterFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: RoasterFormValues
  onSubmit: (values: RoasterFormValues, logo: RoasterLogoSubmission) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
  existingLogoUrl?: string | null
  onCancel?: () => void
}

type RoasterLogoSubmission = {
  file: File | null
  removeExistingLogo: boolean
}

const noCountryValue = '__no_country__'

export function RoasterFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
  existingLogoUrl,
  onCancel,
}: RoasterFormCardProps) {
  const form = useForm<RoasterFormValues>({
    resolver: zodResolver(roasterFormSchema),
    defaultValues: initialValues,
  })
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const { data: countries = [] } = useCountries()
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false)
  const countryOptions = useMemo(
    () =>
      countries
        .map((country) =>
          country.id
            ? {
                id: country.id,
                name: country.name ?? 'Unnamed country',
              }
            : null,
        )
        .filter((country): country is { id: string; name: string } => Boolean(country))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [countries],
  )

  const selectedLogoPreviewUrl = useMemo(
    () => (selectedLogoFile ? URL.createObjectURL(selectedLogoFile) : null),
    [selectedLogoFile],
  )

  useEffect(() => {
    return () => {
      if (selectedLogoPreviewUrl) {
        URL.revokeObjectURL(selectedLogoPreviewUrl)
      }
    }
  }, [selectedLogoPreviewUrl])

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values, {
        file: selectedLogoFile,
        removeExistingLogo: removeExistingLogo && !selectedLogoFile,
      })
    } catch (error) {
      applyRoasterFormServerErrors(error, form.setError)
    }
  })

  const effectiveLogoPreviewUrl =
    selectedLogoPreviewUrl ?? (removeExistingLogo ? null : existingLogoUrl ?? null)

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
            <Input id="name" enterKeyHint="next" {...form.register('name')} />
            <FieldErrorText message={form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <Input id="city" enterKeyHint="next" {...form.register('city')} />
            <FieldErrorText message={form.formState.errors.city?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="countryId" className="text-sm font-medium">
              Country
            </label>
            <Controller
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <Select
                  value={field.value || noCountryValue}
                  onValueChange={(nextValue) =>
                    field.onChange(nextValue === noCountryValue ? undefined : nextValue)
                  }
                >
                  <SelectTrigger id="countryId" className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={noCountryValue}>No country</SelectItem>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldErrorText message={form.formState.errors.countryId?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="websiteUrl" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="websiteUrl"
              type="url"
              enterKeyHint="done"
              {...form.register('websiteUrl')}
            />
            <FieldErrorText message={form.formState.errors.websiteUrl?.message} />
          </div>

          <ImageUpload
            id="logo"
            label="Logo"
            previewUrl={effectiveLogoPreviewUrl}
            onFileSelected={(file) => {
              setSelectedLogoFile(file)
              if (file) {
                setRemoveExistingLogo(false)
              }
            }}
            onRemove={() => {
              if (selectedLogoFile) {
                setSelectedLogoFile(null)
                return
              }

              if (existingLogoUrl) {
                setRemoveExistingLogo(true)
              }
            }}
            disabled={isSubmitting}
          />

          <FieldErrorText message={form.formState.errors.root?.serverError?.message} />

          <CardFooter className="px-0 pb-0 sm:px-0">
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : submitLabel}
              </Button>
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" asChild>
                  <Link to={cancelHref}>Cancel</Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
