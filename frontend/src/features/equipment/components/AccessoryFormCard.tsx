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
import { FieldErrorText } from '@/components/FieldErrorText'
import { BrewerMultiSelect } from '@/features/equipment/components/BrewerMultiSelect'
import { applyAccessoryFormServerErrors } from '@/features/equipment/mapApiValidationErrors'
import { getFieldErrorMessage } from '@/lib/formUtils'

type AccessoryFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: AccessoryFormValues
  onSubmit: (values: AccessoryFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
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
            <Input id="name" enterKeyHint="done" {...form.register('name')} />
            <FieldErrorText message={form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="brewerIds" className="text-sm font-medium">
              Compatible Brewers
            </label>
            <Controller
              control={form.control}
              name="brewerIds"
              render={({ field }) => (
                <BrewerMultiSelect
                  triggerId="brewerIds"
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldErrorText
              message={getFieldErrorMessage(form.formState.errors.brewerIds)}
            />
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
