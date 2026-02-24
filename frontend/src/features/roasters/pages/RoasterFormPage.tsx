import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate } from 'react-router-dom'
import { RoasterFormCard } from '@/features/roasters/components/RoasterFormCard'
import { useCreateRoaster } from '@/features/roasters/hooks/useCreateRoaster'
import { useDeleteRoasterLogo } from '@/features/roasters/hooks/useDeleteRoasterLogo'
import { useRoaster } from '@/features/roasters/hooks/useRoaster'
import { useUploadRoasterLogo } from '@/features/roasters/hooks/useUploadRoasterLogo'
import { useUpdateRoaster } from '@/features/roasters/hooks/useUpdateRoaster'
import { normalizeOptional } from '@/features/roasters/roasterFormSchema'
import { resolveRoasterLogoUrl } from '@/features/roasters/roasterPresentation'
import { useEntityFormId } from '@/lib/useEntityFormId'

function CreateRoasterForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateRoaster()
  const { mutateAsync: uploadLogo, isPending: isUploadingLogo } =
    useUploadRoasterLogo()

  return (
    <RoasterFormCard
      title="Create Roaster"
      description="Add a new coffee roaster."
      submitLabel="Create"
      cancelHref="/roasters"
      isSubmitting={isPending || isUploadingLogo}
      initialValues={{
        name: '',
        city: '',
        countryId: undefined,
      }}
      onSubmit={async (values, logo) => {
        const response = await mutateAsync({
          name: values.name.trim(),
          city: normalizeOptional(values.city),
          countryId: normalizeOptional(values.countryId),
        })

        if (logo.file && !response?.id) {
          throw new Error('Roaster created but logo upload could not be completed.')
        }

        if (logo.file && response?.id) {
          await uploadLogo({ id: response.id, file: logo.file })
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
  const { mutateAsync: uploadLogo, isPending: isUploadingLogo } =
    useUploadRoasterLogo()
  const { mutateAsync: deleteLogo, isPending: isDeletingLogo } =
    useDeleteRoasterLogo()

  return (
    <RoasterFormCard
      title="Edit Roaster"
      description="Update roaster information."
      submitLabel="Save"
      cancelHref={`/roasters/${roasterId}`}
      isSubmitting={isPending || isUploadingLogo || isDeletingLogo}
      existingLogoUrl={resolveRoasterLogoUrl(roaster.logoUrl)}
      initialValues={{
        name: roaster.name ?? '',
        city: roaster.city ?? '',
        countryId: roaster.countryId ?? undefined,
      }}
      onSubmit={async (values, logo) => {
        await mutateAsync({
          id: roasterId,
          request: {
            name: values.name.trim(),
            city: normalizeOptional(values.city),
            countryId: normalizeOptional(values.countryId),
          },
        })

        if (logo.file) {
          await uploadLogo({ id: roasterId, file: logo.file })
        } else if (logo.removeExistingLogo) {
          await deleteLogo({ id: roasterId })
        }

        navigate(`/roasters/${roasterId}`)
      }}
    />
  )
}

export function RoasterFormPage() {
  const formId = useEntityFormId()
  if (formId.mode === 'invalid') {
    return <Navigate to="/roasters" replace />
  }
  if (formId.mode === 'create') {
    return <CreateRoasterForm />
  }

  return <EditRoasterForm roasterId={formId.id} />
}
