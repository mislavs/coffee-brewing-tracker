import { useMemo } from 'react'
import { EntityMultiSelect } from '@/components/EntityMultiSelect'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'

type BrewerMultiSelectProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function BrewerMultiSelect({
  selectedIds,
  onChange,
}: BrewerMultiSelectProps) {
  const { data: brewers = [] } = useBrewers()

  const brewerOptions = useMemo(
    () =>
      brewers
        .map((brewer) =>
          brewer.id
            ? {
                id: brewer.id,
                name: brewer.name ?? 'Unnamed brewer',
              }
            : null,
        )
        .filter((brewer): brewer is { id: string; name: string } => Boolean(brewer)),
    [brewers],
  )

  return (
    <EntityMultiSelect
      options={brewerOptions}
      selectedIds={selectedIds}
      onChange={onChange}
      placeholder="Select compatible brewers"
      searchPlaceholder="Search brewers..."
      emptyMessage="No brewers found."
    />
  )
}
