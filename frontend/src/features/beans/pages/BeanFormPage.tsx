import type { Guid } from '@/lib/api-types'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import type { BeanDto, CreateBeanRequest, UpdateBeanRequest } from '@/lib/api/schemas'
import { BeanFormCard } from '@/features/beans/components/BeanFormCard'
import {
  normalizeDistinctIdList,
  normalizeDistinctNameList,
  toOptionalDateOnly,
  type BeanFormValues,
} from '@/features/beans/beanFormSchema'
import { toDateInputValue } from '@/features/beans/beanShared'
import { useBean } from '@/features/beans/hooks/useBean'
import { useCreateBean } from '@/features/beans/hooks/useCreateBean'
import { useUpdateBean } from '@/features/beans/hooks/useUpdateBean'
import { tryParseGuid } from '@/lib/guid'
import { useEntityFormId } from '@/lib/useEntityFormId'

function toBeanRequestBase(values: BeanFormValues): CreateBeanRequest {
  const normalizedOriginCountryIds = normalizeDistinctIdList(values.originCountryIds)
  const normalizedFlavorNotes = normalizeDistinctNameList(values.flavorNoteNames)

  return {
    name: values.name.trim(),
    roasterId: values.roasterId as Guid,
    originType: values.originType as CreateBeanRequest['originType'],
    originCountryIds:
      normalizedOriginCountryIds.length > 0 ? normalizedOriginCountryIds : undefined,
    variety: values.variety,
    processingMethod: values.processingMethod,
    roastProfile: values.roastProfile as CreateBeanRequest['roastProfile'],
    roastDate: toOptionalDateOnly(values.roastDate),
    altitude: values.altitude,
    bagWeight: values.bagWeight,
    price: values.price,
    flavorNoteNames:
      normalizedFlavorNotes.length > 0 ? normalizedFlavorNotes : undefined,
  }
}

function toCreateBeanRequest(values: BeanFormValues): CreateBeanRequest {
  return toBeanRequestBase(values)
}

function toUpdateBeanRequest(values: BeanFormValues): UpdateBeanRequest {
  return {
    ...toBeanRequestBase(values),
    isAvailable: values.isAvailable,
  }
}

function createInitialValues(): BeanFormValues {
  return {
    name: '',
    roasterId: '',
    originType: 0,
    originCountryIds: [],
    variety: '',
    processingMethod: '',
    roastProfile: 0,
    roastDate: '',
    altitude: undefined,
    bagWeight: 250,
    price: undefined,
    isAvailable: true,
    flavorNoteNames: [],
  }
}

function createInitialValuesFromBean(
  bean: BeanDto,
  options?: {
    clearRoastDate?: boolean
    isAvailable?: boolean
  },
): BeanFormValues {
  return {
    name: bean.name ?? '',
    roasterId: bean.roasterId ?? '',
    originType: bean.originType === 1 ? 1 : 0,
    originCountryIds:
      bean.originCountries
        ?.map((country) => country.id?.trim() ?? '')
        .filter((countryId) => countryId.length > 0) ?? [],
    variety: bean.variety ?? '',
    processingMethod: bean.processingMethod ?? '',
    roastProfile: bean.roastProfile ?? 0,
    roastDate: options?.clearRoastDate ? '' : (toDateInputValue(bean.roastDate) ?? ''),
    altitude: bean.altitude ?? undefined,
    bagWeight: bean.bagWeight ?? 0,
    price: bean.price ?? undefined,
    isAvailable: options?.isAvailable ?? (bean.isAvailable ?? true),
    flavorNoteNames:
      bean.flavorNotes
        ?.map((flavorNote) => flavorNote.name?.trim() ?? '')
        .filter((name) => name.length > 0) ?? [],
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
      initialValues={createInitialValues()}
      onSubmit={async (values) => {
        await mutateAsync(toCreateBeanRequest(values))
        navigate('/beans')
      }}
    />
  )
}

function RepeatBeanForm({ sourceBeanId }: { sourceBeanId: Guid }) {
  const navigate = useNavigate()
  const { data: bean } = useBean(sourceBeanId)
  const { mutateAsync, isPending } = useCreateBean()

  return (
    <BeanFormCard
      title="Create Bean (Repeat)"
      description="Add a new bean based on a previous purchase."
      submitLabel="Create"
      cancelHref="/beans"
      isSubmitting={isPending}
      initialValues={createInitialValuesFromBean(bean, {
        clearRoastDate: true,
        isAvailable: true,
      })}
      onSubmit={async (values) => {
        await mutateAsync(toCreateBeanRequest(values))
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
      initialValues={createInitialValuesFromBean(bean)}
      isEditMode
      onSubmit={async (values) => {
        await mutateAsync({
          id: beanId,
          request: toUpdateBeanRequest(values),
        })

        navigate(`/beans/${beanId}`)
      }}
    />
  )
}

export function BeanFormPage() {
  const formId = useEntityFormId()
  const [searchParams] = useSearchParams()
  const repeatFrom = tryParseGuid(searchParams.get('repeatFrom') ?? undefined)

  if (formId.mode === 'invalid') {
    return <Navigate to="/beans" replace />
  }
  if (formId.mode === 'create') {
    if (repeatFrom) {
      return <RepeatBeanForm sourceBeanId={repeatFrom} />
    }

    return <CreateBeanForm />
  }

  return <EditBeanForm beanId={formId.id} />
}
