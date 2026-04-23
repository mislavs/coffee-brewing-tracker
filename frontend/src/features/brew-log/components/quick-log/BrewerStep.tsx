import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { toIdNameOptions } from '@/features/brew-log/components/brewLogFormShared'
import { EntitySingleSelectStep } from '@/features/brew-log/components/quick-log/EntitySingleSelectStep'
import type { QuickLogSingleSelectStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'

export function BrewerStep({
  form,
  onSelect,
  disabled = false,
}: QuickLogSingleSelectStepProps) {
  const selectedBrewerId = useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const { data: brewers = [] } = useBrewers()
  const options = useMemo(() => toIdNameOptions(brewers, 'Unnamed brewer'), [brewers])

  return (
    <EntitySingleSelectStep
      options={options}
      selectedId={selectedBrewerId}
      onSelect={onSelect}
      error={form.formState.errors.brewerId?.message}
      emptyMessage="No brewers yet. Add one in the Equipment section."
      disabled={disabled}
    />
  )
}
