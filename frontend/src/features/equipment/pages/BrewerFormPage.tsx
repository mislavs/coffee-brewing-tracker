import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BrewerFormCard } from '@/features/equipment/components/BrewerFormCard'
import { useBrewer } from '@/features/equipment/hooks/useBrewer'
import { useCreateBrewer } from '@/features/equipment/hooks/useCreateBrewer'
import { useUpdateBrewer } from '@/features/equipment/hooks/useUpdateBrewer'
import { tryParseGuid } from '@/lib/guid'

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
        const response = await mutateAsync({
          name: values.name.trim(),
        })

        const createdId = response?.id
        if (createdId) {
          navigate(`/equipment/brewers/${createdId}`)
          return
        }

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
  const { id } = useParams<{ id: string }>()
  const brewerId = tryParseGuid(id)

  if (!id || !brewerId) {
    if (id) {
      return <Navigate to="/equipment?tab=brewers" replace />
    }

    return <CreateBrewerForm />
  }

  return <EditBrewerForm brewerId={brewerId} />
}
