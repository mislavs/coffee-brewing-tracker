import { cn } from '@/lib/utils'

type EmojiRatingPickerProps = {
  value: number | undefined
  onChange: (value: number | undefined) => void
  className?: string
}

const ratingOptions = [
  { value: 1, emoji: '😞' },
  { value: 2, emoji: '🙁' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '🤩' },
] as const

export function EmojiRatingPicker({
  value,
  onChange,
  className,
}: EmojiRatingPickerProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="radiogroup"
      aria-label="Brew rating"
    >
      {ratingOptions.map((option) => {
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(isSelected ? undefined : option.value)}
            className={cn(
              'border-input bg-background hover:bg-muted/60 focus-visible:ring-ring/50 rounded-md border px-3 py-2 transition-all focus-visible:ring-[3px] focus-visible:outline-none',
              'flex items-center justify-center',
              isSelected
                ? 'ring-primary scale-105 ring-2'
                : 'text-muted-foreground scale-100 opacity-80',
            )}
          >
            <span className={cn('text-2xl leading-none', isSelected && 'text-3xl')}>
              {option.emoji}
            </span>
          </button>
        )
      })}
    </div>
  )
}
