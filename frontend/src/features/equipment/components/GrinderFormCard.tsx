import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { applyGrinderFormServerErrors } from '@/features/equipment/mapApiValidationErrors'
import {
  grinderFormSchema,
  type GrinderFormValues,
} from '@/features/equipment/grinderFormSchema'
import { FieldErrorText } from '@/components/FieldErrorText'

type GrinderFormCardProps = {
  title: string
  description: string
  submitLabel: string
  initialValues: GrinderFormValues
  onSubmit: (values: GrinderFormValues) => Promise<void>
  isSubmitting: boolean
  cancelHref: string
}

export function GrinderFormCard({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
  cancelHref,
}: GrinderFormCardProps) {
  const form = useForm<GrinderFormValues>({
    resolver: zodResolver(grinderFormSchema),
    defaultValues: initialValues,
  })

  const submitForm = form.handleSubmit(async (values) => {
    form.clearErrors('root.serverError')

    try {
      await onSubmit(values)
    } catch (error) {
      applyGrinderFormServerErrors(error, form.setError)
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
