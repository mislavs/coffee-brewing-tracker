import type { Guid } from '@/lib/api-types'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  normalizeBrewLogFormValues,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import { BrewLogLowStockPromptDialog } from '@/features/brew-log/brewLogLowStock'
import { getBrewLogLowStockPrompt } from '@/features/brew-log/brewLogLowStockUtils'
import {
  createInitialBrewLogValues,
  createInitialBrewLogValuesFromBrewLog,
} from '@/features/brew-log/brewLogFormDefaults'
import { BrewLogFormCard } from '@/features/brew-log/components/BrewLogFormCardContainer'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { useUpdateBrewLog } from '@/features/brew-log/hooks/useUpdateBrewLog'
import { tryParseGuid } from '@/lib/guid'
import { useEntityFormId } from '@/lib/useEntityFormId'

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
          const lowStockPrompt = getBrewLogLowStockPrompt(request, response)

          if (lowStockPrompt) {
            setLowStockPrompt(lowStockPrompt)
            return
          }

          navigate('/brew-log')
        }}
      />

      <BrewLogLowStockPromptDialog
        prompt={lowStockPrompt}
        onOpenChange={(open) => {
          if (!open) {
            closeLowStockPrompt()
          }
        }}
        onCompleted={closeLowStockPrompt}
      />
    </>
  )
}

function CreateBrewLogForm() {
  const [searchParams] = useSearchParams()
  const shouldOpenVoiceInput = searchParams.get('dictate') === 'true'

  return (
    <CreateLikeBrewLogForm
      title="Log Brew"
      initialValues={createInitialBrewLogValues()}
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
      initialValues={createInitialBrewLogValuesFromBrewLog(brewLog, {
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
      initialValues={createInitialBrewLogValuesFromBrewLog(brewLog)}
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
