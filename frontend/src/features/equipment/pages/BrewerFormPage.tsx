import type { Guid } from '@/lib/api-types'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrewerFormCard } from '@/features/equipment/components/BrewerFormCard'
import { useBrewer } from '@/features/equipment/hooks/useBrewer'
import { useCreateBrewer } from '@/features/equipment/hooks/useCreateBrewer'
import { useUpdateBrewer } from '@/features/equipment/hooks/useUpdateBrewer'
import { useEntityFormId } from '@/lib/useEntityFormId'

function CreateBrewerForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateBrewer()

  return (
    <BrewerFormCard
      title="Create Brewer"
      description="Add a new brewer."
      submitLabel="Create"
      cancelHref="/equipment?tab=brewers"
      isSubmitting={isPending}
      initialValues={{
        name: '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          name: values.name.trim(),
        })
        navigate('/equipment?tab=brewers')
      }}
    />
  )
}

function EditBrewerForm({ brewerId }: { brewerId: Guid }) {
  const navigate = useNavigate()
  const { data: brewer } = useBrewer(brewerId)
  const { mutateAsync, isPending } = useUpdateBrewer()

  return (
    <BrewerFormCard
      title="Edit Brewer"
      description="Update brewer information."
      submitLabel="Save"
      cancelHref={`/equipment/brewers/${brewerId}`}
      isSubmitting={isPending}
      initialValues={{
        name: brewer.name ?? '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: brewerId,
          request: {
            name: values.name.trim(),
          },
        })

        navigate(`/equipment/brewers/${brewerId}`)
      }}
    />
  )
}

export function BrewerFormPage() {
  const formId = useEntityFormId()
  if (formId.mode === 'invalid') {
    return <Navigate to="/equipment?tab=brewers" replace />
  }
  if (formId.mode === 'create') {
    return <CreateBrewerForm />
  }

  return <EditBrewerForm brewerId={formId.id} />
}
