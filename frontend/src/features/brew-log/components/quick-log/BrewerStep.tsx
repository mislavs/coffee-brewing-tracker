import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  sortOptionsByUsage,
  toIdNameOptions,
} from '@/features/brew-log/components/brewLogFormShared'
import { EntitySingleSelectStep } from '@/features/brew-log/components/quick-log/EntitySingleSelectStep'
import type { QuickLogSingleSelectStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import type { QuickLogUsageCountDto } from '@/lib/api/schemas'

type BrewerStepProps = QuickLogSingleSelectStepProps & {
  preferredId?: string
  usageCounts?: QuickLogUsageCountDto[] | null
}

export function BrewerStep({
  form,
  onSelect,
  disabled = false,
  preferredId,
  usageCounts,
}: BrewerStepProps) {
  const selectedBrewerId = useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const { data: brewers = [] } = useBrewers()
  const options = useMemo(
    () =>
      sortOptionsByUsage(
        toIdNameOptions(brewers, 'Unnamed brewer'),
        usageCounts,
        preferredId,
      ),
    [brewers, preferredId, usageCounts],
  )

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
