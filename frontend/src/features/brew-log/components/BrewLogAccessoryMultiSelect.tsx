import { useMemo } from 'react'
import { EntityMultiSelect } from '@/components/EntityMultiSelect'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { toIdNameOptions } from '@/features/brew-log/components/brewLogFormShared'

type BrewLogAccessoryMultiSelectProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function BrewLogAccessoryMultiSelect({
  selectedIds,
  onChange,
}: BrewLogAccessoryMultiSelectProps) {
  const { data: accessories = [] } = useAccessories()

  const accessoryOptions = useMemo(
    () => toIdNameOptions(accessories, 'Unnamed accessory'),
    [accessories],
  )

  return (
    <EntityMultiSelect
      options={accessoryOptions}
      selectedIds={selectedIds}
      onChange={onChange}
      placeholder="Select accessories"
      searchPlaceholder="Search accessories..."
      emptyMessage="No accessories found."
    />
  )
}
