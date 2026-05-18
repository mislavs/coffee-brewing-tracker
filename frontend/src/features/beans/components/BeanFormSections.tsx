import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  type BeanFormInput,
  type BeanFormValues,
} from '@/features/beans/beanFormSchema'
import {
  originTypeLabels,
  roastProfileLabels,
} from '@/features/beans/beanShared'
import { TagCombobox } from '@/features/beans/components/TagCombobox'
import { FieldErrorText } from '@/components/FieldErrorText'

const createRoasterValue = '__create_roaster__'
const noRoasterValue = '__no_roaster__'

type BeanForm = UseFormReturn<BeanFormInput, undefined, BeanFormValues>

type IdNameOption = {
  id: string
  name: string
}

type BeanIdentitySectionProps = {
  form: BeanForm
  roasterOptions: IdNameOption[]
  onCreateRoaster: () => void
}

export function BeanIdentitySection({
  form,
  roasterOptions,
  onCreateRoaster,
}: BeanIdentitySectionProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" enterKeyHint="next" {...form.register('name')} />
        <FieldErrorText message={form.formState.errors.name?.message} />
      </div>

      <div className="space-y-2">
        <label htmlFor="roasterId" className="text-sm font-medium">
          Roaster
        </label>
        <Controller
          control={form.control}
          name="roasterId"
          render={({ field }) => (
            <Select
              value={field.value || noRoasterValue}
              onValueChange={(nextValue) => {
                if (nextValue === noRoasterValue) {
                  field.onChange('')
                  return
                }

                if (nextValue === createRoasterValue) {
                  onCreateRoaster()
                  return
                }

                field.onChange(nextValue)
              }}
            >
              <SelectTrigger id="roasterId" className="w-full">
                <SelectValue placeholder="Select a roaster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={noRoasterValue}>Select a roaster</SelectItem>
                <SelectItem value={createRoasterValue}>+ Create roaster</SelectItem>
                {roasterOptions.map((roaster) => (
                  <SelectItem key={roaster.id} value={roaster.id}>
                    {roaster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldErrorText message={form.formState.errors.roasterId?.message} />
      </div>
    </>
  )
}

type BeanClassificationSectionProps = {
  form: BeanForm
  countryOptions: IdNameOption[]
  originCountryIdsError: string | undefined
  toCountryNames: (countryIds: string[]) => string[]
  toCountryIds: (countryNames: string[]) => string[]
}

export function BeanClassificationSection({
  form,
  countryOptions,
  originCountryIdsError,
  toCountryNames,
  toCountryIds,
}: BeanClassificationSectionProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="originType" className="text-sm font-medium">
            Origin Type
          </label>
          <Controller
            control={form.control}
            name="originType"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(nextValue) => field.onChange(Number(nextValue))}
              >
                <SelectTrigger id="originType" className="w-full">
                  <SelectValue placeholder="Select origin type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(originTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.originType?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="roastProfile" className="text-sm font-medium">
            Roast Profile
          </label>
          <Controller
            control={form.control}
            name="roastProfile"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(nextValue) => field.onChange(Number(nextValue))}
              >
                <SelectTrigger id="roastProfile" className="w-full">
                  <SelectValue placeholder="Select roast profile" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roastProfileLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldErrorText message={form.formState.errors.roastProfile?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="originCountryIds" className="text-sm font-medium">
          Origin Countries
        </label>
        <Controller
          control={form.control}
          name="originCountryIds"
          render={({ field }) => (
            <TagCombobox
              triggerId="originCountryIds"
              placeholder="Select countries"
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found."
              createLabel={(value) => `Create "${value}"`}
              allowCreate={false}
              values={toCountryNames(field.value ?? [])}
              options={countryOptions.map((country) => country.name)}
              onChange={(values) => field.onChange(toCountryIds(values))}
            />
          )}
        />
        <FieldErrorText message={originCountryIdsError} />
      </div>
    </>
  )
}

type BeanFlavorAndOriginSectionProps = {
  form: BeanForm
  flavorNoteOptions: string[]
  flavorNotesError: string | undefined
}

export function BeanFlavorAndOriginSection({
  form,
  flavorNoteOptions,
  flavorNotesError,
}: BeanFlavorAndOriginSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="region" className="text-sm font-medium">
          Region
        </label>
        <Input id="region" enterKeyHint="next" {...form.register('region')} />
        <FieldErrorText message={form.formState.errors.region?.message} />
      </div>

      <div className="space-y-2">
        <label htmlFor="flavorNoteNames" className="text-sm font-medium">
          Flavor Notes
        </label>
        <Controller
          control={form.control}
          name="flavorNoteNames"
          render={({ field }) => (
            <TagCombobox
              triggerId="flavorNoteNames"
              placeholder="Select or create flavor notes"
              searchPlaceholder="Search flavor notes..."
              emptyMessage="No flavor notes found."
              createLabel={(value) => `Create "${value}"`}
              values={field.value ?? []}
              options={flavorNoteOptions}
              onChange={field.onChange}
            />
          )}
        />
        <FieldErrorText message={flavorNotesError} />
      </div>
    </>
  )
}

type BeanProcessingSectionProps = {
  form: BeanForm
}

export function BeanProcessingSection({ form }: BeanProcessingSectionProps) {
  const watchedRoastDate = useWatch({ control: form.control, name: 'roastDate' })

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="variety" className="text-sm font-medium">
            Variety
          </label>
          <Input id="variety" enterKeyHint="next" {...form.register('variety')} />
          <FieldErrorText message={form.formState.errors.variety?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="processingMethod" className="text-sm font-medium">
            Processing Method
          </label>
          <Input
            id="processingMethod"
            enterKeyHint="next"
            {...form.register('processingMethod')}
          />
          <FieldErrorText
            message={form.formState.errors.processingMethod?.message}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="roastDate" className="text-sm font-medium">
            Roast Date
          </label>
          <DatePicker
            id="roastDate"
            value={typeof watchedRoastDate === 'string' ? watchedRoastDate : undefined}
            onChange={(nextValue) => {
              form.clearErrors('roastDate')
              form.setValue('roastDate', nextValue, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
            onInvalidInput={() => {
              form.setError('roastDate', {
                type: 'manual',
                message: 'Use format dd.mm.yyyy.',
              })
            }}
          />
          <FieldErrorText message={form.formState.errors.roastDate?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="altitude" className="text-sm font-medium">
            Altitude (m)
          </label>
          <Input
            id="altitude"
            type="number"
            enterKeyHint="next"
            {...form.register('altitude', { valueAsNumber: true })}
          />
          <FieldErrorText message={form.formState.errors.altitude?.message} />
        </div>
      </div>
    </>
  )
}

type BeanInventorySectionProps = {
  form: BeanForm
  isEditMode: boolean
}

export function BeanInventorySection({
  form,
  isEditMode,
}: BeanInventorySectionProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="bagWeight" className="text-sm font-medium">
            Bag Weight (g)
          </label>
          <Input
            id="bagWeight"
            type="number"
            enterKeyHint="next"
            {...form.register('bagWeight', { valueAsNumber: true })}
          />
          <FieldErrorText message={form.formState.errors.bagWeight?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price
          </label>
          <Input
            id="price"
            type="number"
            enterKeyHint="done"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
          />
          <FieldErrorText message={form.formState.errors.price?.message} />
        </div>
      </div>

      {isEditMode ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Available
            </label>
            <p className="text-sm text-muted-foreground">
              Unavailable beans are hidden from lists by default.
            </p>
          </div>
          <Controller
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <Switch
                id="isAvailable"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      ) : null}
    </>
  )
}
