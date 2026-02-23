import { useMemo, useState } from 'react'
import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
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
import { tryParseGuid } from '@/lib/guid'

function formatBrewDate(value: Date | null | undefined) {
  if (!value) {
    return '—'
  }

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }

  return parsed.toLocaleString()
}

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
          <div>
            <span className="font-medium">Bean:</span>{' '}
            {brewLog.beanId ? (
              <Link to={`/beans/${brewLog.beanId}`} className="hover:underline">
                {brewLog.beanName ?? 'View bean'}
              </Link>
            ) : (
              (brewLog.beanName ?? '—')
            )}
          </div>
          <div>
            <span className="font-medium">Brewer:</span>{' '}
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
          </div>
          <div>
            <span className="font-medium">Grinder:</span>{' '}
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
          </div>
          <div>
            <span className="font-medium">Recipe:</span>{' '}
            {brewLog.recipeId ? (
              <Link to={`/recipes/${brewLog.recipeId}`} className="hover:underline">
                {brewLog.recipeName ?? 'View recipe'}
              </Link>
            ) : (
              (brewLog.recipeName ?? '—')
            )}
          </div>
          <div>
            <span className="font-medium">Accessories:</span> {accessoriesText}
          </div>
          <div>
            <span className="font-medium">Dose:</span>{' '}
            {brewLog.dose !== null && brewLog.dose !== undefined ? `${brewLog.dose} g` : '—'}
          </div>
          <div>
            <span className="font-medium">Water amount:</span>{' '}
            {brewLog.waterAmount !== null && brewLog.waterAmount !== undefined
              ? `${brewLog.waterAmount} ml`
              : '—'}
          </div>
          <div>
            <span className="font-medium">Brew ratio:</span>{' '}
            {formatRatio(brewLog.brewRatio)}
          </div>
          <div>
            <span className="font-medium">Water temperature:</span>{' '}
            {brewLog.waterTemperature !== null && brewLog.waterTemperature !== undefined
              ? `${brewLog.waterTemperature} C`
              : '—'}
          </div>
          <div>
            <span className="font-medium">Grind size:</span> {brewLog.grindSize || '—'}
          </div>
          <div>
            <span className="font-medium">Brew time:</span>{' '}
            {formatBrewTime(brewLog.brewTimeSeconds)}
          </div>
          <div>
            <span className="font-medium">Rating:</span> {getRatingDisplay(brewLog.rating)}
          </div>
          <div className="space-y-1 pt-2">
            <p className="font-medium">Notes</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {brewLog.notes || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Adjustment ideas</p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {brewLog.adjustmentIdeas || '—'}
            </p>
          </div>
          <div>
            <span className="font-medium">Brew date:</span>{' '}
            {formatBrewDate(brewLog.brewedAt)}
          </div>
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
