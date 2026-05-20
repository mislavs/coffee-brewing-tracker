import { useMemo } from 'react'
import { EntityMultiSelect } from '@/components/EntityMultiSelect'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import {
  filterAccessoriesByBrewer,
  toIdNameOptions,
} from '@/features/brew-log/components/brewLogFormShared'

type BrewLogAccessoryMultiSelectProps = {
  triggerId?: string
  brewerId?: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function BrewLogAccessoryMultiSelect({
  triggerId,
  brewerId,
  selectedIds,
  onChange,
}: BrewLogAccessoryMultiSelectProps) {
  const { data: accessories = [] } = useAccessories()

  const accessoryOptions = useMemo(
    () =>
      toIdNameOptions(
        filterAccessoriesByBrewer(accessories, brewerId),
        'Unnamed accessory',
      ),
    [accessories, brewerId],
  )

  return (
    <EntityMultiSelect
      triggerId={triggerId}
      options={accessoryOptions}
      selectedIds={selectedIds}
      onChange={onChange}
      placeholder="Select accessories"
      searchPlaceholder="Search accessories..."
      emptyMessage="No accessories compatible with this brewer."
    />
  )
}
