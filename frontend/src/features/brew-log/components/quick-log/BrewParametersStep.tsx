import { useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  QuickLogDisplayField,
  QuickLogField,
} from '@/features/brew-log/components/quick-log/QuickLogFormLayout'
import type { QuickLogStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'

export function BrewParametersStep({ form, disabled = false }: QuickLogStepProps) {
  const watchedDose = useWatch({ control: form.control, name: 'dose' })
  const watchedWaterAmount = useWatch({ control: form.control, name: 'waterAmount' })
  const normalizedDose =
    typeof watchedDose === 'number' ? watchedDose : Number(watchedDose)
  const normalizedWaterAmount =
    typeof watchedWaterAmount === 'number'
      ? watchedWaterAmount
      : Number(watchedWaterAmount)
  const liveRatio =
    normalizedDose > 0 && normalizedWaterAmount > 0
      ? `1:${(normalizedWaterAmount / normalizedDose).toFixed(1)}`
      : '—'

  return (
    <div className="grid grid-cols-2 items-start gap-x-4 gap-y-3 sm:grid-cols-5">
      <QuickLogField
        label="Dose (g)"
        htmlFor="quick-log-dose"
        error={form.formState.errors.dose?.message}
      >
        <Input
          id="quick-log-dose"
          type="number"
          inputMode="decimal"
          step="0.1"
          disabled={disabled}
          {...form.register('dose')}
        />
      </QuickLogField>

      <QuickLogField
        label="Water (ml)"
        htmlFor="quick-log-water-amount"
        error={form.formState.errors.waterAmount?.message}
      >
        <Input
          id="quick-log-water-amount"
          type="number"
          inputMode="decimal"
          step="0.1"
          disabled={disabled}
          {...form.register('waterAmount')}
        />
      </QuickLogField>

      <QuickLogDisplayField label="Brew ratio">
        <div className="border-input bg-muted/30 flex h-9 items-center justify-center rounded-md border px-3 text-sm tabular-nums">
          {liveRatio}
        </div>
      </QuickLogDisplayField>

      <QuickLogField
        label="Temp (°C)"
        htmlFor="quick-log-water-temperature"
        error={form.formState.errors.waterTemperature?.message}
      >
        <Input
          id="quick-log-water-temperature"
          type="number"
          inputMode="decimal"
          step="0.1"
          disabled={disabled}
          {...form.register('waterTemperature')}
        />
      </QuickLogField>

      <QuickLogField
        label="Grind size"
        htmlFor="quick-log-grind-size"
        error={form.formState.errors.grindSize?.message}
      >
        <Input
          id="quick-log-grind-size"
          type="number"
          inputMode="decimal"
          step="0.1"
          disabled={disabled}
          {...form.register('grindSize')}
        />
      </QuickLogField>
    </div>
  )
}
