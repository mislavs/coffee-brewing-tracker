import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { RoasterFormCard } from '@/features/roasters/components/RoasterFormCard'
import { tryParseGuid } from '@/features/roasters/guid'
import { useCreateRoaster } from '@/features/roasters/hooks/useCreateRoaster'
import { useRoaster } from '@/features/roasters/hooks/useRoaster'
import { useUpdateRoaster } from '@/features/roasters/hooks/useUpdateRoaster'
import { normalizeOptional } from '@/features/roasters/roasterFormSchema'

function CreateRoasterForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateRoaster()

  return (
    <RoasterFormCard
      title="Create Roaster"
      description="Add a new coffee roaster."
      submitLabel="Create"
      cancelHref="/roasters"
      isSubmitting={isPending}
      initialValues={{
        name: '',
        city: '',
        country: '',
      }}
      onSubmit={async (values) => {
        const response = await mutateAsync({
          name: values.name.trim(),
          city: normalizeOptional(values.city),
          country: normalizeOptional(values.country),
        })

        const createdId = response?.id
        if (createdId) {
          navigate(`/roasters/${createdId}`)
          return
        }

        navigate('/roasters')
      }}
    />
  )
}

function EditRoasterForm({ roasterId }: { roasterId: Guid }) {
  const navigate = useNavigate()
  const { data: roaster } = useRoaster(roasterId)
  const { mutateAsync, isPending } = useUpdateRoaster()

  return (
    <RoasterFormCard
      title="Edit Roaster"
      description="Update roaster information."
      submitLabel="Save"
      cancelHref={`/roasters/${roasterId}`}
      isSubmitting={isPending}
      initialValues={{
        name: roaster.name ?? '',
        city: roaster.city ?? '',
        country: roaster.country ?? '',
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: roasterId,
          request: {
            name: values.name.trim(),
            city: normalizeOptional(values.city),
            country: normalizeOptional(values.country),
          },
        })

        navigate(`/roasters/${roasterId}`)
      }}
    />
  )
}

export function RoasterFormPage() {
  const { id } = useParams<{ id: string }>()
  const roasterId = tryParseGuid(id)

  if (!id || !roasterId) {
    if (id) {
      return <Navigate to="/roasters" replace />
    }

    return <CreateRoasterForm />
  }

  return <EditRoasterForm roasterId={roasterId} />
}
