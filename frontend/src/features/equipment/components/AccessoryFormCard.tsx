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
  accessoryFormSchema,
  type AccessoryFormValues,
} from '@/features/equipment/accessoryFormSchema'
import { BrewerMultiSelect } from '@/features/equipment/components/BrewerMultiSelect'
import { applyAccessoryFormServerErrors } from '@/features/equipment/mapApiValidationErrors'

type AccessoryFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: AccessoryFormValues
  onSubmit: (values: AccessoryFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

function getFieldErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const errorRecord = error as { message?: unknown }
  return typeof errorRecord.message === 'string' ? errorRecord.message : undefined
}

export function AccessoryFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
}: AccessoryFormCardProps) {
  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(accessoryFormSchema),
    defaultValues: initialValues,
  })

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values)
    } catch (error) {
      applyAccessoryFormServerErrors(error, form.setError)
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
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compatible Brewers</label>
            <Controller
              control={form.control}
              name="brewerIds"
              render={({ field }) => (
                <BrewerMultiSelect
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
            {getFieldErrorMessage(form.formState.errors.brewerIds) && (
              <p className="text-sm text-destructive">
                {getFieldErrorMessage(form.formState.errors.brewerIds)}
              </p>
            )}
          </div>

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
