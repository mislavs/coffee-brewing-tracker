import { OptionGrid } from '@/features/brew-log/components/quick-log/OptionGrid'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import type { IdNameOption } from '@/features/brew-log/components/brewLogFormShared'

type EntitySingleSelectStepProps = {
  options: IdNameOption[]
  selectedId: string
  onSelect: (id: string) => void
  error?: string
  emptyMessage: string
  disabled?: boolean
}

export function EntitySingleSelectStep({
  options,
  selectedId,
  onSelect,
  error,
  emptyMessage,
  disabled = false,
}: EntitySingleSelectStepProps) {
  return (
    <div className="space-y-3">
      <OptionGrid
        options={options}
        selectedIds={selectedId ? [selectedId] : []}
        onSelect={onSelect}
        mode="single"
        emptyMessage={emptyMessage}
        disabled={disabled}
      />
      <FieldErrorText message={error} />
    </div>
  )
}
