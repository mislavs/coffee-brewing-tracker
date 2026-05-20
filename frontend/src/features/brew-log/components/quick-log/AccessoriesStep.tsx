import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import {
  filterAccessoriesByBrewer,
  getFieldErrorMessage,
  sortOptionsByPreferredIds,
  toIdNameOptions,
} from '@/features/brew-log/components/brewLogFormShared'
import { OptionGrid } from '@/features/brew-log/components/quick-log/OptionGrid'
import type { QuickLogStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'

type AccessoriesStepProps = QuickLogStepProps & {
  preferredIds?: string[]
}

export function AccessoriesStep({
  form,
  disabled = false,
  preferredIds,
}: AccessoriesStepProps) {
  const selectedAccessoryIds =
    useWatch({ control: form.control, name: 'accessoryIds' }) ?? []
  const selectedBrewerId = useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const { data: accessories = [] } = useAccessories()
  const options = useMemo(
    () =>
      sortOptionsByPreferredIds(
        toIdNameOptions(
          filterAccessoriesByBrewer(accessories, selectedBrewerId),
          'Unnamed accessory',
        ),
        preferredIds,
      ),
    [accessories, preferredIds, selectedBrewerId],
  )

  return (
    <div className="space-y-3">
      <OptionGrid
        options={options}
        selectedIds={selectedAccessoryIds}
        onSelect={(id) => {
          const nextIds = selectedAccessoryIds.includes(id)
            ? selectedAccessoryIds.filter((selectedId) => selectedId !== id)
            : [...selectedAccessoryIds, id]

          form.setValue('accessoryIds', nextIds, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
        mode="multi"
        emptyMessage="No accessories compatible with this brewer. Add or update one in the Equipment section."
        disabled={disabled}
      />
      <FieldErrorText message={getFieldErrorMessage(form.formState.errors.accessoryIds)} />
    </div>
  )
}
