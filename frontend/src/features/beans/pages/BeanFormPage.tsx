import type { Guid } from '@microsoft/kiota-abstractions'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BeanFormCard } from '@/features/beans/components/BeanFormCard'
import {
  normalizeDistinctNameList,
  toOptionalDateOnly,
  type BeanFormValues,
} from '@/features/beans/beanFormSchema'
import { toDateInputValue } from '@/features/beans/beanShared'
import { useBean } from '@/features/beans/hooks/useBean'
import { useCreateBean } from '@/features/beans/hooks/useCreateBean'
import { useUpdateBean } from '@/features/beans/hooks/useUpdateBean'
import { tryParseGuid } from '@/lib/guid'

function toBeanRequest(values: BeanFormValues) {
  const normalizedOriginCountries = normalizeDistinctNameList(values.originCountries)
  const normalizedFlavorNotes = normalizeDistinctNameList(values.flavorNoteNames)

  return {
    name: values.name.trim(),
    roasterId: values.roasterId as Guid,
    originType: values.originType,
    originCountries:
      normalizedOriginCountries.length > 0 ? normalizedOriginCountries : undefined,
    variety: values.variety,
    processingMethod: values.processingMethod,
    roastProfile: values.roastProfile,
    roastDate: toOptionalDateOnly(values.roastDate),
    altitude: values.altitude,
    bagWeight: values.bagWeight,
    price: values.price,
    flavorNoteNames:
      normalizedFlavorNotes.length > 0 ? normalizedFlavorNotes : undefined,
  }
}

function CreateBeanForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateBean()

  return (
    <BeanFormCard
      title="Create Bean"
      description="Add a new coffee bean to your library."
      submitLabel="Create"
      cancelHref="/beans"
      isSubmitting={isPending}
      initialValues={{
        name: '',
        roasterId: '',
        originType: 0,
        originCountries: [],
        variety: '',
        processingMethod: '',
        roastProfile: 0,
        roastDate: '',
        altitude: undefined,
        bagWeight: 250,
        price: undefined,
        flavorNoteNames: [],
      }}
      onSubmit={async (values) => {
        const response = await mutateAsync(toBeanRequest(values))

        const createdId = response?.id
        if (createdId) {
          navigate(`/beans/${createdId}`)
          return
        }

        navigate('/beans')
      }}
    />
  )
}

function EditBeanForm({ beanId }: { beanId: Guid }) {
  const navigate = useNavigate()
  const { data: bean } = useBean(beanId)
  const { mutateAsync, isPending } = useUpdateBean()

  return (
    <BeanFormCard
      title="Edit Bean"
      description="Update bean details."
      submitLabel="Save"
      cancelHref={`/beans/${beanId}`}
      isSubmitting={isPending}
      initialValues={{
        name: bean.name ?? '',
        roasterId: bean.roasterId ?? '',
        originType: bean.originType === 1 ? 1 : 0,
        originCountries: bean.originCountries ?? [],
        variety: bean.variety ?? '',
        processingMethod: bean.processingMethod ?? '',
        roastProfile: bean.roastProfile ?? 0,
        roastDate: toDateInputValue(bean.roastDate) ?? '',
        altitude: bean.altitude ?? undefined,
        bagWeight: bean.bagWeight ?? 0,
        price: bean.price ?? undefined,
        flavorNoteNames:
          bean.flavorNotes
            ?.map((flavorNote) => flavorNote.name?.trim() ?? '')
            .filter((name) => name.length > 0) ?? [],
      }}
      onSubmit={async (values) => {
        await mutateAsync({
          id: beanId,
          request: toBeanRequest(values),
        })

        navigate(`/beans/${beanId}`)
      }}
    />
  )
}

export function BeanFormPage() {
  const { id } = useParams<{ id: string }>()
  const beanId = tryParseGuid(id)

  if (!id || !beanId) {
    if (id) {
      return <Navigate to="/beans" replace />
    }

    return <CreateBeanForm />
  }

  return <EditBeanForm beanId={beanId} />
}
