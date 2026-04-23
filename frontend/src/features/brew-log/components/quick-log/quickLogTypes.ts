import type { UseFormReturn } from 'react-hook-form'
import type {
  BrewLogFormInput,
  BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'

export type QuickLogForm = UseFormReturn<
  BrewLogFormInput,
  undefined,
  BrewLogFormValues
>

export type QuickLogStepProps = {
  form: QuickLogForm
  disabled?: boolean
}

export type QuickLogSingleSelectStepProps = QuickLogStepProps & {
  onSelect: (id: string) => void
}

export type QuickLogRatingStepProps = QuickLogStepProps & {
  onSelect: (rating: number | undefined) => void
}
