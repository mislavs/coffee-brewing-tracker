import type { Guid } from '@/lib/api-types'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'
import {
  normalizeBrewLogFormValues,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { BrewLogFormCard } from '@/features/brew-log/components/BrewLogFormCardContainer'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useUpdateBrewLog } from '@/features/brew-log/hooks/useUpdateBrewLog'
import type { BrewLogDto } from '@/lib/api/schemas'
import { tryParseGuid } from '@/lib/guid'
import { useEntityFormId } from '@/lib/useEntityFormId'

function toDateTimeLocalValue(value: Date | string | null | undefined) {
  const parsed = value instanceof Date ? value : value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return ''
  }

  const offsetMs = parsed.getTimezoneOffset() * 60_000
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16)
}

function toBrewTimeParts(totalSeconds: number | null | undefined) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
    return {
      brewTimeMinutes: undefined,
      brewTimeSeconds: undefined,
    }
  }

  return {
    brewTimeMinutes: Math.floor(totalSeconds / 60),
    brewTimeSeconds: totalSeconds % 60,
  }
}

function createInitialValues(): BrewLogFormValues {
  return {
    beanId: '',
    brewerId: '',
    grinderId: '',
    recipeId: '',
    dose: 0,
    waterAmount: 0,
    waterTemperature: undefined,
    grindSize: undefined,
    brewTimeMinutes: undefined,
    brewTimeSeconds: undefined,
    rating: undefined,
    tastingNotes: undefined,
    adjustmentIdeas: undefined,
    accessoryIds: [],
    brewedAt: toDateTimeLocalValue(new Date()),
  }
}

function createInitialValuesFromBrewLog(
  brewLog: BrewLogDto,
  options?: {
    clearResults?: boolean
    brewedAt?: Date | string | null | undefined
  },
): BrewLogFormValues {
  const clearResults = options?.clearResults ?? false

  return {
    ...toBrewTimeParts(clearResults ? undefined : brewLog.brewTimeSeconds),
    beanId: brewLog.beanId ?? '',
    brewerId: brewLog.brewerId ?? '',
    grinderId: brewLog.grinderId ?? '',
    recipeId: brewLog.recipeId ?? '',
    dose: brewLog.dose ?? 0,
    waterAmount: brewLog.waterAmount ?? 0,
    waterTemperature: brewLog.waterTemperature ?? undefined,
    grindSize: brewLog.grindSize ?? undefined,
    rating: clearResults ? undefined : (brewLog.rating ?? undefined),
    tastingNotes: clearResults ? undefined : (brewLog.notes ?? undefined),
    adjustmentIdeas: clearResults ? undefined : (brewLog.adjustmentIdeas ?? undefined),
    accessoryIds:
      brewLog.accessories
        ?.map((accessory) => accessory.id ?? '')
        .filter((id) => id.length > 0) ?? [],
    brewedAt: toDateTimeLocalValue(options?.brewedAt ?? brewLog.brewedAt),
  }
}

type CreateLikeBrewLogFormProps = {
  title: string
  description?: string
  initialValues: BrewLogFormValues
  showVoiceInput?: boolean
  initialVoiceDialogOpen?: boolean
}

function CreateLikeBrewLogForm({
  title,
  description,
  initialValues,
  showVoiceInput = false,
  initialVoiceDialogOpen = false,
}: CreateLikeBrewLogFormProps) {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateBrewLog()
  const { mutateAsync: setBeanAvailability, isPending: isSettingAvailability } =
    useSetBeanAvailability()
  const [lowStockPrompt, setLowStockPrompt] = useState<{
    beanId: Guid
    remainingQuantity: number
  } | null>(null)
  const closeLowStockPrompt = () => {
    setLowStockPrompt(null)
    navigate('/brew-log')
  }

  return (
    <>
      <BrewLogFormCard
        title={title}
        description={description}
        submitLabel="Create"
        cancelHref="/brew-log"
        showVoiceInput={showVoiceInput}
        initialVoiceDialogOpen={initialVoiceDialogOpen}
        isSubmitting={isPending}
        initialValues={initialValues}
        onSubmit={async (values) => {
          const request = normalizeBrewLogFormValues(values)
          const response = await mutateAsync(request)
          const remainingQuantity = response?.remainingBeanQuantity

          if (
            typeof remainingQuantity === 'number' &&
            remainingQuantity < 15 &&
            request.beanId
          ) {
            setLowStockPrompt({
              beanId: request.beanId as Guid,
              remainingQuantity,
            })
            return
          }

          navigate('/brew-log')
        }}
      />

      <AlertDialog
        open={Boolean(lowStockPrompt)}
        onOpenChange={(open) => {
          if (!open && !isSettingAvailability) {
            closeLowStockPrompt()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark bean as unavailable?</AlertDialogTitle>
            <AlertDialogDescription>
              {`Only ${
                lowStockPrompt?.remainingQuantity.toFixed(1) ?? '0.0'
              }g remains for this bean. Do you want to mark it unavailable?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingAvailability}>
              Keep available
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSettingAvailability}
              onClick={(event) => {
                event.preventDefault()
                if (!lowStockPrompt || isSettingAvailability) {
                  return
                }

                void (async () => {
                  await setBeanAvailability({
                    id: lowStockPrompt.beanId,
                    isAvailable: false,
                  })
                  closeLowStockPrompt()
                })()
              }}
            >
              {isSettingAvailability ? 'Saving...' : 'Mark unavailable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function CreateBrewLogForm() {
  const [searchParams] = useSearchParams()
  const shouldOpenVoiceInput = searchParams.get('dictate') === 'true'

  return (
    <CreateLikeBrewLogForm
      title="Log Brew"
      initialValues={createInitialValues()}
      showVoiceInput={shouldOpenVoiceInput}
      initialVoiceDialogOpen={shouldOpenVoiceInput}
    />
  )
}

function RepeatBrewLogForm({ sourceBrewLogId }: { sourceBrewLogId: Guid }) {
  const { data: brewLog } = useBrewLog(sourceBrewLogId)

  return (
    <CreateLikeBrewLogForm
      title="Log Brew (Repeat)"
      description="Start a new brew using a previous brew as a template."
      initialValues={createInitialValuesFromBrewLog(brewLog, {
        clearResults: true,
        brewedAt: new Date(),
      })}
    />
  )
}

function EditBrewLogForm({ brewLogId }: { brewLogId: Guid }) {
  const navigate = useNavigate()
  const { data: brewLog } = useBrewLog(brewLogId)
  const { mutateAsync, isPending } = useUpdateBrewLog()

  return (
    <BrewLogFormCard
      title="Edit Brew Log"
      description="Update brew log details."
      submitLabel="Save"
      cancelHref={`/brew-log/${brewLogId}`}
      showVoiceInput
      isSubmitting={isPending}
      initialValues={createInitialValuesFromBrewLog(brewLog)}
      onSubmit={async (values) => {
        await mutateAsync({
          id: brewLogId,
          request: normalizeBrewLogFormValues(values),
        })

        navigate(`/brew-log/${brewLogId}`)
      }}
    />
  )
}

export function BrewLogFormPage() {
  const formId = useEntityFormId()
  const [searchParams] = useSearchParams()
  const repeatFrom = tryParseGuid(searchParams.get('repeatFrom') ?? undefined)

  if (formId.mode === 'invalid') {
    return <Navigate to="/brew-log" replace />
  }
  if (formId.mode === 'create') {
    if (repeatFrom) {
      return <RepeatBrewLogForm sourceBrewLogId={repeatFrom} />
    }

    return <CreateBrewLogForm />
  }

  return <EditBrewLogForm brewLogId={formId.id} />
}
