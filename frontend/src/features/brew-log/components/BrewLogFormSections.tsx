import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  BrewLogFormInput,
  BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { BrewLogAccessoryMultiSelect } from '@/features/brew-log/components/BrewLogAccessoryMultiSelect'
import {
  FieldErrorText,
  SectionHeader,
} from '@/features/brew-log/components/BrewLogFormUi'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import {
  getFieldErrorMessage,
  type IdNameOption,
} from '@/features/brew-log/components/brewLogFormShared'

type BrewLogForm = UseFormReturn<BrewLogFormInput, undefined, BrewLogFormValues>

type BeanAndEquipmentSectionProps = {
  form: BrewLogForm
  beanOptions: IdNameOption[]
  brewerOptions: IdNameOption[]
  grinderOptions: IdNameOption[]
  recipeOptions: IdNameOption[]
  hasSelectedBrewer: boolean
}

export function BeanAndEquipmentSection({
  form,
  beanOptions,
  brewerOptions,
  grinderOptions,
  recipeOptions,
  hasSelectedBrewer,
}: BeanAndEquipmentSectionProps) {
  const accessoryError = getFieldErrorMessage(form.formState.errors.accessoryIds)

  return (
    <section className="space-y-4">
      <SectionHeader title="Bean and Equipment" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="beanId" className="text-sm font-medium">
            Bean
          </label>
          <Controller
            control={form.control}
            name="beanId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="beanId" className="w-full">
                  <SelectValue placeholder="Select a bean" />
                </SelectTrigger>
                <SelectContent>
                  {beanOptions.map((bean) => (
                    <SelectItem key={bean.id} value={bean.id}>
                      {bean.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.beanId?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="brewerId" className="text-sm font-medium">
            Brewer
          </label>
          <Controller
            control={form.control}
            name="brewerId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="brewerId" className="w-full">
                  <SelectValue placeholder="Select a brewer" />
                </SelectTrigger>
                <SelectContent>
                  {brewerOptions.map((brewer) => (
                    <SelectItem key={brewer.id} value={brewer.id}>
                      {brewer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.brewerId?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="recipeId" className="text-sm font-medium">
            Recipe
          </label>
          <Controller
            control={form.control}
            name="recipeId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={!hasSelectedBrewer}
              >
                <SelectTrigger id="recipeId" className="w-full">
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipeOptions.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.recipeId?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="grinderId" className="text-sm font-medium">
            Grinder
          </label>
          <Controller
            control={form.control}
            name="grinderId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id="grinderId" className="w-full">
                  <SelectValue placeholder="Select a grinder" />
                </SelectTrigger>
                <SelectContent>
                  {grinderOptions.map((grinder) => (
                    <SelectItem key={grinder.id} value={grinder.id}>
                      {grinder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.grinderId?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Accessories</label>
        <Controller
          control={form.control}
          name="accessoryIds"
          render={({ field }) => (
            <BrewLogAccessoryMultiSelect
              selectedIds={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
        <FieldErrorText message={accessoryError} />
      </div>
    </section>
  )
}

type FormSectionProps = {
  form: BrewLogForm
}

export function BrewParametersSection({ form }: FormSectionProps) {
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
    <section className="space-y-4">
      <SectionHeader title="Brew Parameters" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-2">
          <label htmlFor="dose" className="text-sm font-medium">
            Dose (g)
          </label>
          <Input
            id="dose"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...form.register('dose')}
          />
          <FieldErrorText message={form.formState.errors.dose?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="waterAmount" className="text-sm font-medium">
            Water (ml)
          </label>
          <Input
            id="waterAmount"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...form.register('waterAmount')}
          />
          <FieldErrorText message={form.formState.errors.waterAmount?.message} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brew ratio</label>
          <div className="border-input bg-muted/30 flex h-9 items-center rounded-md border px-3 text-sm tabular-nums">
            {liveRatio}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="waterTemperature" className="text-sm font-medium">
            Temp (°C)
          </label>
          <Input
            id="waterTemperature"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...form.register('waterTemperature')}
          />
          <FieldErrorText message={form.formState.errors.waterTemperature?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="grindSize" className="text-sm font-medium">
            Grind size
          </label>
          <Input
            id="grindSize"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...form.register('grindSize')}
          />
          <FieldErrorText message={form.formState.errors.grindSize?.message} />
        </div>
      </div>
    </section>
  )
}

export function ResultsSection({ form }: FormSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Results" />

      <div className="space-y-2">
        <label className="text-sm font-medium">Brew time</label>
        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-2">
            <label
              htmlFor="brewTimeMinutes"
              className="text-muted-foreground block text-xs font-medium"
            >
              minutes
            </label>
            <Input
              id="brewTimeMinutes"
              type="number"
              className="w-24"
              {...form.register('brewTimeMinutes')}
            />
            <FieldErrorText message={form.formState.errors.brewTimeMinutes?.message} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="brewTimeSeconds"
              className="text-muted-foreground block text-xs font-medium"
            >
              seconds
            </label>
            <Input
              id="brewTimeSeconds"
              type="number"
              min={0}
              max={59}
              className="w-24"
              {...form.register('brewTimeSeconds')}
            />
            <FieldErrorText message={form.formState.errors.brewTimeSeconds?.message} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <Controller
          control={form.control}
          name="rating"
          render={({ field }) => (
            <EmojiRatingPicker
              value={typeof field.value === 'number' ? field.value : undefined}
              onChange={field.onChange}
            />
          )}
        />
        <FieldErrorText message={form.formState.errors.rating?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tastingNotes" className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            id="tastingNotes"
            rows={4}
            {...form.register('tastingNotes')}
          />
          <FieldErrorText message={form.formState.errors.tastingNotes?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="adjustmentIdeas" className="text-sm font-medium">
            Adjustment ideas
          </label>
          <Textarea
            id="adjustmentIdeas"
            rows={4}
            {...form.register('adjustmentIdeas')}
          />
          <FieldErrorText message={form.formState.errors.adjustmentIdeas?.message} />
        </div>
      </div>
    </section>
  )
}

export function BrewedAtSection({ form }: FormSectionProps) {
  const watchedBrewedAt = useWatch({ control: form.control, name: 'brewedAt' })

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="brewedAt" className="text-sm font-medium">
          Brewed at
        </label>
        <DateTimePicker
          id="brewedAt"
          value={typeof watchedBrewedAt === 'string' ? watchedBrewedAt : undefined}
          onChange={(nextValue) => {
            if (!nextValue) {
              form.setValue('brewedAt', '', {
                shouldDirty: true,
                shouldValidate: true,
              })
              form.setError('brewedAt', {
                type: 'manual',
                message: 'Brew date is required.',
              })
              return
            }

            form.clearErrors('brewedAt')
            form.setValue('brewedAt', nextValue, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
          onInvalidInput={() => {
            form.setError('brewedAt', {
              type: 'manual',
              message: 'Use format dd.mm.yyyy hh:mm.',
            })
          }}
        />
        <FieldErrorText message={form.formState.errors.brewedAt?.message} />
      </div>
    </section>
  )
}
