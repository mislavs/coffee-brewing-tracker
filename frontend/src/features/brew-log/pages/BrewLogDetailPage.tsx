import { useMemo, useState } from 'react'
import type { Guid } from '@/lib/api-types'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { DetailField } from '@/components/DetailField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatBrewTime,
  formatRatio,
  getRatingDisplay,
} from '@/features/brew-log/formatters'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useDeleteBrewLog } from '@/features/brew-log/hooks/useDeleteBrewLog'
import { formatDateTime } from '@/lib/date'
import { useEntityFormId } from '@/lib/useEntityFormId'

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
          <CardAction className="flex items-center gap-2">
            <Button asChild>
              <Link to={`/brew-log/${brewLogId}/edit`}>Edit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/brew-log/new?repeatFrom=${brewLogId}`}>Repeat</Link>
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
          </CardAction>
          <CardTitle>{brewLog.beanName ?? 'Brew log entry'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <section className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Equipment
                </p>
                <div className="grid gap-3">
                  <DetailField label="Bean" stacked>
                    {brewLog.beanId ? (
                      <Link to={`/beans/${brewLog.beanId}`} className="hover:underline">
                        {brewLog.beanName ?? 'View bean'}
                      </Link>
                    ) : (
                      (brewLog.beanName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Brewer" stacked>
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
                  <DetailField label="Grinder" stacked>
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
                  <DetailField label="Recipe" stacked>
                    {brewLog.recipeId ? (
                      <Link to={`/recipes/${brewLog.recipeId}`} className="hover:underline">
                        {brewLog.recipeName ?? 'View recipe'}
                      </Link>
                    ) : (
                      (brewLog.recipeName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Accessories" stacked>
                    {accessoriesText}
                  </DetailField>
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-muted-foreground">{brewLog.notes || '—'}</p>
              </section>

              <section className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Adjustments
                </p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {brewLog.adjustmentIdeas || '—'}
                </p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Brew Parameters
                </p>
                <div className="grid gap-3">
                  <DetailField label="Dose" stacked>
                    {brewLog.dose !== null && brewLog.dose !== undefined
                      ? `${brewLog.dose} g`
                      : '—'}
                  </DetailField>
                  <DetailField label="Water amount" stacked>
                    {brewLog.waterAmount !== null && brewLog.waterAmount !== undefined
                      ? `${brewLog.waterAmount} ml`
                      : '—'}
                  </DetailField>
                  <DetailField label="Brew ratio" stacked>
                    {formatRatio(brewLog.brewRatio)}
                  </DetailField>
                  <DetailField label="Water temperature" stacked>
                    {brewLog.waterTemperature !== null && brewLog.waterTemperature !== undefined
                      ? `${brewLog.waterTemperature}°C`
                      : '—'}
                  </DetailField>
                  <DetailField label="Grind size" stacked>
                    {brewLog.grindSize !== null && brewLog.grindSize !== undefined
                      ? brewLog.grindSize
                      : '—'}
                  </DetailField>
                  <DetailField label="Brew time" stacked>
                    {formatBrewTime(brewLog.brewTimeSeconds)}
                  </DetailField>
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Result
                </p>
                <div className="grid gap-3">
                  <DetailField label="Rating" stacked>
                    {getRatingDisplay(brewLog.rating)}
                  </DetailField>
                  <DetailField label="Brew date" stacked>
                    {formatDateTime(brewLog.brewedAt)}
                  </DetailField>
                </div>
              </section>

            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        entityName="brew log"
      />
    </>
  )
}

export function BrewLogDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/brew-log" replace />
  }

  return <BrewLogDetailContent brewLogId={entityId.id} />
}
