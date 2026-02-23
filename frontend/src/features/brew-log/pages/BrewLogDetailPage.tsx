import { useMemo, useState } from 'react'
import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeleteBrewLogDialog } from '@/features/brew-log/components/DeleteBrewLogDialog'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useDeleteBrewLog } from '@/features/brew-log/hooks/useDeleteBrewLog'
import { formatDateTime } from '@/lib/date'
import { tryParseGuid } from '@/lib/guid'

function formatRatio(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return '—'
  }

  return `1:${value.toFixed(1)}`
}

function formatBrewTime(value: number | null | undefined) {
  if (value === null || value === undefined || value < 0) {
    return '—'
  }

  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getRatingDisplay(rating: number | null | undefined) {
  switch (rating) {
    case 1:
      return '😞'
    case 2:
      return '🙁'
    case 3:
      return '😐'
    case 4:
      return '🙂'
    case 5:
      return '🤩'
    default:
      return '—'
  }
}

function BrewLogDetailContent({ brewLogId }: { brewLogId: Guid }) {
  const navigate = useNavigate()
  const { data: brewLog } = useBrewLog(brewLogId)
  const { mutateAsync: deleteBrewLog, isPending: isDeleting } = useDeleteBrewLog()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const accessoriesText = useMemo(() => {
    const names =
      brewLog.accessories
        ?.map((accessory) => accessory.name?.trim() ?? '')
        .filter((name) => name.length > 0) ?? []

    return names.length > 0 ? names.join(', ') : '—'
  }, [brewLog.accessories])

  const confirmDelete = async () => {
    await deleteBrewLog(brewLogId)
    setIsDeleteDialogOpen(false)
    navigate('/brew-log')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{brewLog.beanName ?? 'Brew log entry'}</CardTitle>
          <CardDescription>Brew details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <DetailField label="Bean">
            {brewLog.beanId ? (
              <Link to={`/beans/${brewLog.beanId}`} className="hover:underline">
                {brewLog.beanName ?? 'View bean'}
              </Link>
            ) : (
              (brewLog.beanName ?? '—')
            )}
          </DetailField>
          <DetailField label="Brewer">
            {brewLog.brewerId ? (
              <Link
                to={`/equipment/brewers/${brewLog.brewerId}`}
                className="hover:underline"
              >
                {brewLog.brewerName ?? 'View brewer'}
              </Link>
            ) : (
              (brewLog.brewerName ?? '—')
            )}
          </DetailField>
          <DetailField label="Grinder">
            {brewLog.grinderId ? (
              <Link
                to={`/equipment/grinders/${brewLog.grinderId}`}
                className="hover:underline"
              >
                {brewLog.grinderName ?? 'View grinder'}
              </Link>
            ) : (
              (brewLog.grinderName ?? '—')
            )}
          </DetailField>
          <DetailField label="Recipe">
            {brewLog.recipeId ? (
              <Link to={`/recipes/${brewLog.recipeId}`} className="hover:underline">
                {brewLog.recipeName ?? 'View recipe'}
              </Link>
            ) : (
              (brewLog.recipeName ?? '—')
            )}
          </DetailField>
          <DetailField label="Accessories">{accessoriesText}</DetailField>
          <DetailField label="Dose">
            {brewLog.dose !== null && brewLog.dose !== undefined ? `${brewLog.dose} g` : '—'}
          </DetailField>
          <DetailField label="Water amount">
            {brewLog.waterAmount !== null && brewLog.waterAmount !== undefined
              ? `${brewLog.waterAmount} ml`
              : '—'}
          </DetailField>
          <DetailField label="Brew ratio">{formatRatio(brewLog.brewRatio)}</DetailField>
          <DetailField label="Water temperature">
            {brewLog.waterTemperature !== null && brewLog.waterTemperature !== undefined
              ? `${brewLog.waterTemperature} C`
              : '—'}
          </DetailField>
          <DetailField label="Grind size">{brewLog.grindSize || '—'}</DetailField>
          <DetailField label="Brew time">{formatBrewTime(brewLog.brewTimeSeconds)}</DetailField>
          <DetailField label="Rating">{getRatingDisplay(brewLog.rating)}</DetailField>
          <div className="space-y-1 pt-2">
            <p className="font-medium text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {brewLog.notes || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">Adjustment ideas</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {brewLog.adjustmentIdeas || '—'}
            </p>
          </div>
          <DetailField label="Brew date">{formatDateTime(brewLog.brewedAt)}</DetailField>
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          <Button asChild>
            <Link to={`/brew-log/${brewLogId}/edit`}>Edit</Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link to="/brew-log">Back</Link>
          </Button>
        </CardFooter>
      </Card>

      <DeleteBrewLogDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />
    </>
  )
}

export function BrewLogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const brewLogId = tryParseGuid(id)

  if (!brewLogId) {
    return <Navigate to="/brew-log" replace />
  }

  return <BrewLogDetailContent brewLogId={brewLogId} />
}
