import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate } from 'react-router-dom'
import { AccessoryFormCard } from '@/features/equipment/components/AccessoryFormCard'
import type { AccessoryFormValues } from '@/features/equipment/accessoryFormSchema'
import { useAccessory } from '@/features/equipment/hooks/useAccessory'
import { useCreateAccessory } from '@/features/equipment/hooks/useCreateAccessory'
import { useUpdateAccessory } from '@/features/equipment/hooks/useUpdateAccessory'
import { useEntityFormId } from '@/lib/useEntityFormId'

function toAccessoryRequest(values: AccessoryFormValues) {
  const normalizedBrewerIds = Array.from(
    new Set((values.brewerIds ?? []).filter(Boolean)),
  )

  return {
    name: values.name.trim(),
    brewerIds: normalizedBrewerIds.length > 0 ? normalizedBrewerIds : undefined,
  }
}

function CreateAccessoryForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateAccessory()

  return (
    <AccessoryFormCard
      title="Create Accessory"
      description="Add a new accessory."
      submitLabel="Create"
      cancelHref="/equipment?tab=accessories"
      isSubmitting={isPending}
      initialValues={{
        name: '',
        brewerIds: [],
      }}
      onSubmit={async (values) => {
        await mutateAsync(toAccessoryRequest(values))
        navigate('/equipment?tab=accessories')
      }}
    />
  )
}

function EditAccessoryForm({ accessoryId }: { accessoryId: Guid }) {
  const navigate = useNavigate()
  const { data: accessory } = useAccessory(accessoryId)
  const { mutateAsync, isPending } = useUpdateAccessory()
  const compatibleBrewers =
    (
      accessory as {
        compatibleBrewers?: { id?: string | null }[] | null
      }
    ).compatibleBrewers ?? []

  return (
    <AccessoryFormCard
      title="Edit Accessory"
      description="Update accessory information."
      submitLabel="Save"
      cancelHref={`/equipment/accessories/${accessoryId}`}
      isSubmitting={isPending}
      initialValues={{
        name: accessory.name ?? '',
        brewerIds: compatibleBrewers
          .map((brewer) => brewer.id ?? '')
          .filter((brewerId) => brewerId.length > 0),
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: accessoryId,
          request: toAccessoryRequest(values),
        })

        navigate(`/equipment/accessories/${accessoryId}`)
      }}
    />
  )
}

export function AccessoryFormPage() {
  const formId = useEntityFormId()
  if (formId.mode === 'invalid') {
    return <Navigate to="/equipment?tab=accessories" replace />
  }
  if (formId.mode === 'create') {
    return <CreateAccessoryForm />
  }

  return <EditAccessoryForm accessoryId={formId.id} />
}
