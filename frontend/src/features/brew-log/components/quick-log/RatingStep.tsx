import { useWatch } from 'react-hook-form'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import type { QuickLogRatingStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'

export function RatingStep({ form, onSelect, disabled = false }: QuickLogRatingStepProps) {
  const rating = useWatch({ control: form.control, name: 'rating' })

  return (
    <div className="space-y-3">
      <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
        <EmojiRatingPicker
          value={typeof rating === 'number' ? rating : undefined}
          onChange={onSelect}
        />
      </div>
      <FieldErrorText message={form.formState.errors.rating?.message} />
    </div>
  )
}
