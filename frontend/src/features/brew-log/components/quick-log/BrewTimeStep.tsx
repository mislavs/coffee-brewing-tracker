import { Input } from '@/components/ui/input'
import { QuickLogField } from '@/features/brew-log/components/quick-log/QuickLogFormLayout'
import type { QuickLogStepProps } from '@/features/brew-log/components/quick-log/quickLogTypes'

export function BrewTimeStep({ form, disabled = false }: QuickLogStepProps) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-3">
      <QuickLogField
        label="Minutes"
        htmlFor="quick-log-brew-time-minutes"
        error={form.formState.errors.brewTimeMinutes?.message}
        className="w-24"
      >
        <Input
          id="quick-log-brew-time-minutes"
          type="number"
          min={0}
          inputMode="numeric"
          disabled={disabled}
          {...form.register('brewTimeMinutes')}
        />
      </QuickLogField>

      <QuickLogField
        label="Seconds"
        htmlFor="quick-log-brew-time-seconds"
        error={form.formState.errors.brewTimeSeconds?.message}
        className="w-24"
      >
        <Input
          id="quick-log-brew-time-seconds"
          type="number"
          min={0}
          max={59}
          inputMode="numeric"
          disabled={disabled}
          {...form.register('brewTimeSeconds')}
        />
      </QuickLogField>
    </div>
  )
}
