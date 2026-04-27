import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import {
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
  const { data: accessories = [] } = useAccessories()
  const options = useMemo(
    () =>
      sortOptionsByPreferredIds(
        toIdNameOptions(accessories, 'Unnamed accessory'),
        preferredIds,
      ),
    [accessories, preferredIds],
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
        emptyMessage="No accessories yet. Add one in the Equipment section."
        disabled={disabled}
      />
      <FieldErrorText message={getFieldErrorMessage(form.formState.errors.accessoryIds)} />
    </div>
  )
}
