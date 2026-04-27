import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  sortOptionsByPreferredId,
  toIdNameOptions,
} from '@/features/brew-log/components/brewLogFormShared'
import { EntitySingleSelectStep } from '@/features/brew-log/components/quick-log/EntitySingleSelectStep'
import type { QuickLogSingleSelectStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'

type GrinderStepProps = QuickLogSingleSelectStepProps & {
  preferredId?: string
}

export function GrinderStep({
  form,
  onSelect,
  disabled = false,
  preferredId,
}: GrinderStepProps) {
  const selectedGrinderId = useWatch({ control: form.control, name: 'grinderId' }) ?? ''
  const { data: grinders = [] } = useGrinders()
  const options = useMemo(
    () =>
      sortOptionsByPreferredId(
        toIdNameOptions(grinders, 'Unnamed grinder'),
        preferredId,
      ),
    [grinders, preferredId],
  )

  return (
    <EntitySingleSelectStep
      options={options}
      selectedId={selectedGrinderId}
      onSelect={onSelect}
      error={form.formState.errors.grinderId?.message}
      emptyMessage="No grinders yet. Add one in the Equipment section."
      disabled={disabled}
    />
  )
}
