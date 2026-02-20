import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { GrinderFormCard } from '@/features/equipment/components/GrinderFormCard'
import { useCreateGrinder } from '@/features/equipment/hooks/useCreateGrinder'
import { useGrinder } from '@/features/equipment/hooks/useGrinder'
import { useUpdateGrinder } from '@/features/equipment/hooks/useUpdateGrinder'
import { tryParseGuid } from '@/lib/guid'

function CreateGrinderForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateGrinder()

  return (
    <GrinderFormCard
      title="Create Grinder"
      description="Add a new grinder."
      submitLabel="Create"
      cancelHref="/equipment?tab=grinders"
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
          navigate(`/equipment/grinders/${createdId}`)
          return
        }

        navigate('/equipment?tab=grinders')
      }}
    />
  )
}

function EditGrinderForm({ grinderId }: { grinderId: Guid }) {
  const navigate = useNavigate()
  const { data: grinder } = useGrinder(grinderId)
  const { mutateAsync, isPending } = useUpdateGrinder()

  return (
    <GrinderFormCard
      title="Edit Grinder"
      description="Update grinder information."
      submitLabel="Save"
      cancelHref={`/equipment/grinders/${grinderId}`}
      isSubmitting={isPending}
      initialValues={{
        name: grinder.name ?? '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: grinderId,
          request: {
            name: values.name.trim(),
          },
        })

        navigate(`/equipment/grinders/${grinderId}`)
      }}
    />
  )
}

export function GrinderFormPage() {
  const { id } = useParams<{ id: string }>()
  const grinderId = tryParseGuid(id)

  if (!id || !grinderId) {
    if (id) {
      return <Navigate to="/equipment?tab=grinders" replace />
    }

    return <CreateGrinderForm />
  }

  return <EditGrinderForm grinderId={grinderId} />
}
