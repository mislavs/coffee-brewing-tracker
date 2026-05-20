import { useEffect, useRef } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type {
  BrewLogFormInput,
  BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { isAccessoryCompatibleWithBrewer } from '@/features/brew-log/components/brewLogFormShared'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'

type BrewLogForm = UseFormReturn<BrewLogFormInput, undefined, BrewLogFormValues>

export function useFilterAccessoryIdsOnBrewerChange(
  form: BrewLogForm,
  brewerId: string,
  initialBrewerId: string,
) {
  const previousBrewerIdRef = useRef(initialBrewerId)
  const selectedAccessoryIds = useWatch({ control: form.control, name: 'accessoryIds' })
  const { data: accessories = [], isPending } = useAccessories()

  useEffect(() => {
    if (previousBrewerIdRef.current === brewerId) {
      return
    }

    if (isPending) {
      return
    }

    const accessoryById = new Map(
      accessories.flatMap((accessory) =>
        accessory.id ? [[accessory.id, accessory] as const] : [],
      ),
    )
    const selectedIds = selectedAccessoryIds ?? []
    const compatibleAccessoryIds = selectedIds.filter((accessoryId) => {
      const accessory = accessoryById.get(accessoryId)

      return accessory
        ? isAccessoryCompatibleWithBrewer(accessory, brewerId)
        : true
    })

    if (compatibleAccessoryIds.length !== selectedIds.length) {
      form.setValue('accessoryIds', compatibleAccessoryIds, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.clearErrors('accessoryIds')
    }

    previousBrewerIdRef.current = brewerId
  }, [accessories, brewerId, form, isPending, selectedAccessoryIds])
}
