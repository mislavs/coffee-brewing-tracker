import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  normalizeBrewLogFormValues,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { BrewLogFormCard } from '@/features/brew-log/components/BrewLogFormCardContainer'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useUpdateBrewLog } from '@/features/brew-log/hooks/useUpdateBrewLog'
import { tryParseGuid } from '@/lib/guid'

function toDateTimeLocalValue(value: Date | null | undefined) {
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
    recipeId: undefined,
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

function CreateBrewLogForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateBrewLog()

  return (
    <BrewLogFormCard
      title="Log Brew"
      description="Record a new brew entry."
      submitLabel="Create"
      cancelHref="/brew-log"
      isSubmitting={isPending}
      initialValues={createInitialValues()}
      onSubmit={async (values) => {
        const response = await mutateAsync(normalizeBrewLogFormValues(values))

        const createdId = response?.id
        if (createdId) {
          navigate(`/brew-log/${createdId}`)
          return
        }

        navigate('/brew-log')
      }}
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
      isSubmitting={isPending}
      initialValues={{
        ...toBrewTimeParts(brewLog.brewTimeSeconds),
        beanId: brewLog.beanId ?? '',
        brewerId: brewLog.brewerId ?? '',
        grinderId: brewLog.grinderId ?? '',
        recipeId: brewLog.recipeId ?? undefined,
        dose: brewLog.dose ?? 0,
        waterAmount: brewLog.waterAmount ?? 0,
        waterTemperature: brewLog.waterTemperature ?? undefined,
        grindSize: brewLog.grindSize ?? undefined,
        rating: brewLog.rating ?? undefined,
        tastingNotes: brewLog.notes ?? undefined,
        adjustmentIdeas: brewLog.adjustmentIdeas ?? undefined,
        accessoryIds:
          brewLog.accessories
            ?.map((accessory) => accessory.id ?? '')
            .filter((id) => id.length > 0) ?? [],
        brewedAt: toDateTimeLocalValue(brewLog.brewedAt),
      }}
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
  const { id } = useParams<{ id: string }>()
  const brewLogId = tryParseGuid(id)

  if (!id || !brewLogId) {
    if (id) {
      return <Navigate to="/brew-log" replace />
    }

    return <CreateBrewLogForm />
  }

  return <EditBrewLogForm brewLogId={brewLogId} />
}
