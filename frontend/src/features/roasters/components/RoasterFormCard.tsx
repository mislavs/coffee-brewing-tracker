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

export type RoasterLogoSubmission = {
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
  const [selectedLogoPreviewUrl, setSelectedLogoPreviewUrl] = useState<string | null>(
    null,
  )
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

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile)
    setSelectedLogoPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedLogoFile])

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
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <Input id="city" {...form.register('city')} />
            {form.formState.errors.city && (
              <p className="text-sm text-destructive">
                {form.formState.errors.city.message}
              </p>
            )}
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
            {form.formState.errors.countryId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.countryId.message}
              </p>
            )}
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

          {form.formState.errors.root?.serverError && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.serverError.message}
            </p>
          )}

          <CardFooter className="px-0 pb-0">
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
