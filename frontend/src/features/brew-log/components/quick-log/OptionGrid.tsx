import { Button } from '@/components/ui/button'
import type { IdNameOption } from '@/features/brew-log/components/brewLogFormShared'
import { cn } from '@/lib/utils'

type OptionGridProps = {
  options: IdNameOption[]
  selectedIds: string[]
  onSelect: (id: string) => void
  mode: 'single' | 'multi'
  emptyMessage: string
  disabled?: boolean
}

export function OptionGrid({
  options,
  selectedIds,
  onSelect,
  mode,
  emptyMessage,
  disabled = false,
}: OptionGridProps) {
  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role={mode === 'single' ? 'radiogroup' : undefined}
    >
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id)

        return (
          <Button
            key={option.id}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            disabled={disabled}
            role={mode === 'single' ? 'radio' : undefined}
            aria-checked={mode === 'single' ? isSelected : undefined}
            aria-pressed={mode === 'multi' ? isSelected : undefined}
            className={cn(
              'h-auto min-h-20 justify-start px-4 py-4 text-left whitespace-normal',
              !isSelected && 'hover:bg-muted/50',
            )}
            onClick={() => onSelect(option.id)}
          >
            <span className="block text-sm font-medium">{option.name}</span>
          </Button>
        )
      })}
    </div>
  )
}
