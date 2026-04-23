import { Textarea } from '@/components/ui/textarea'
import {
  QuickLogField,
  QuickLogFieldGrid,
} from '@/features/brew-log/components/quick-log/QuickLogFormLayout'
import type { QuickLogStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'

export function NotesStep({ form, disabled = false }: QuickLogStepProps) {
  return (
    <QuickLogFieldGrid>
      <QuickLogField
        label="Notes"
        htmlFor="quick-log-tasting-notes"
        error={form.formState.errors.tastingNotes?.message}
      >
        <Textarea
          id="quick-log-tasting-notes"
          rows={5}
          disabled={disabled}
          {...form.register('tastingNotes')}
        />
      </QuickLogField>

      <QuickLogField
        label="Adjustment ideas"
        htmlFor="quick-log-adjustment-ideas"
        error={form.formState.errors.adjustmentIdeas?.message}
      >
        <Textarea
          id="quick-log-adjustment-ideas"
          rows={5}
          disabled={disabled}
          {...form.register('adjustmentIdeas')}
        />
      </QuickLogField>
    </QuickLogFieldGrid>
  )
}
