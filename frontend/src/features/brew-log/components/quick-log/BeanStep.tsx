import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { toIdNameOptions } from '@/features/brew-log/components/brewLogFormShared'
import { EntitySingleSelectStep } from '@/features/brew-log/components/quick-log/EntitySingleSelectStep'
import type { QuickLogSingleSelectStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'
import { useBeans } from '@/features/beans/hooks/useBeans'

export function BeanStep({ form, onSelect, disabled = false }: QuickLogSingleSelectStepProps) {
  const selectedBeanId = useWatch({ control: form.control, name: 'beanId' }) ?? ''
  const { data: beans = [] } = useBeans()
  const options = useMemo(() => toIdNameOptions(beans, 'Unnamed bean'), [beans])

  return (
    <EntitySingleSelectStep
      options={options}
      selectedId={selectedBeanId}
      onSelect={onSelect}
      error={form.formState.errors.beanId?.message}
      emptyMessage="No beans yet. Add one in the Beans section."
      disabled={disabled}
    />
  )
}
