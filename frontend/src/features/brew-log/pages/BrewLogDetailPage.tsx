import { useMemo, useState, type ReactNode } from 'react'
import type { Guid } from '@/lib/api-types'
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog'
import { DetailField } from '@/components/DetailField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  formatBrewTime,
  formatRatio,
  getRatingDisplay,
} from '@/features/brew-log/formatters'
import { formatPrice } from '@/features/beans/formatters'
import { useBrewLog } from '@/features/brew-log/hooks/useBrewLog'
import { useDeleteBrewLog } from '@/features/brew-log/hooks/useDeleteBrewLog'
import { formatDateTime } from '@/lib/date'
import { useEntityFormId } from '@/lib/useEntityFormId'

type DetailSectionProps = {
  children: ReactNode
  id: string
  title: string
}

type SummaryMetricProps = {
  detail?: ReactNode
  label: string
  value: ReactNode
}

function DetailSection({ children, id, title }: DetailSectionProps) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  )
}

function DetailLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  )
}

function SummaryMetric({ detail, label, value }: SummaryMetricProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-base font-semibold text-foreground">
        {value}
        {detail ? (
          <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function NotesBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

function compactRatio(value: number | null | undefined) {
  return formatRatio(value).replace(/\.0$/, '')
}

function formatDose(value: number | null | undefined) {
  return value !== null && value !== undefined ? `${value} g` : '—'
}

function formatWaterAmount(value: number | null | undefined) {
  return value !== null && value !== undefined ? `${value} ml` : '—'
}

function getRatingLabel(rating: number | null | undefined) {
  switch (rating) {
    case 1:
      return 'Poor'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Great'
    case 5:
      return 'Excellent'
    default:
      return 'Not rated'
  }
}

function RatingValue({ rating }: { rating: number | null | undefined }) {
  const ratingDisplay = getRatingDisplay(rating)
  const ratingLabel = getRatingLabel(rating)

  if (ratingDisplay === '—') {
    return '—'
  }

  return (
    <span aria-label={ratingLabel} role="img">
      {ratingDisplay}
    </span>
  )
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

  const brewTitle = brewLog.beanName ?? 'Brew log entry'
  const brewDate = formatDateTime(brewLog.brewedAt)
  const brewRatio = compactRatio(brewLog.brewRatio)
  const dose = formatDose(brewLog.dose)
  const waterAmount = formatWaterAmount(brewLog.waterAmount)
  const ratingLabel = getRatingLabel(brewLog.rating)
  const notes = brewLog.notes?.trim()
  const adjustmentIdeas = brewLog.adjustmentIdeas?.trim()

  const confirmDelete = async () => {
    await deleteBrewLog(brewLogId)
    setIsDeleteDialogOpen(false)
    navigate('/brew-log')
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="gap-5 border-b pb-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit text-muted-foreground"
              >
                <Link to="/brew-log">
                  <ArrowLeft className="size-4" />
                  Brew log
                </Link>
              </Button>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  {brewTitle}
                </h1>
                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div>
                    <dt className="sr-only">Brew date</dt>
                    <dd>{brewDate}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Brewer</dt>
                    <dd>{brewLog.brewerName ?? 'No brewer recorded'}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Rating</dt>
                    <dd>{ratingLabel}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto lg:justify-end">
              <Button asChild className="flex-1 sm:flex-none">
                <Link to={`/brew-log/new?repeatFrom=${brewLogId}`}>
                  <RotateCcw className="size-4" />
                  Repeat
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link to={`/brew-log/${brewLogId}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6 text-sm">
          <section aria-labelledby="brew-summary-heading" className="space-y-3">
            <h2 id="brew-summary-heading" className="text-sm font-semibold">
              Brew summary
            </h2>
            <dl className="grid gap-4 border-y py-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryMetric
                label="Method"
                value={brewLog.brewerName ?? '—'}
                detail={brewLog.recipeName ?? 'No recipe'}
              />
              <SummaryMetric label="Dose / water" value={`${dose} / ${waterAmount}`} />
              <SummaryMetric label="Ratio" value={brewRatio} />
              <SummaryMetric
                label="Rating"
                value={<RatingValue rating={brewLog.rating} />}
                detail={ratingLabel}
              />
            </dl>
          </section>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="space-y-8">
              <DetailSection id="brew-equipment-heading" title="Equipment">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Bean" stacked>
                    {brewLog.beanId ? (
                      <DetailLink to={`/beans/${brewLog.beanId}`}>{brewTitle}</DetailLink>
                    ) : (
                      brewTitle
                    )}
                  </DetailField>
                  <DetailField label="Brewer" stacked>
                    {brewLog.brewerId ? (
                      <DetailLink to={`/equipment/brewers/${brewLog.brewerId}`}>
                        {brewLog.brewerName ?? 'View brewer'}
                      </DetailLink>
                    ) : (
                      (brewLog.brewerName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Grinder" stacked>
                    {brewLog.grinderId ? (
                      <DetailLink to={`/equipment/grinders/${brewLog.grinderId}`}>
                        {brewLog.grinderName ?? 'View grinder'}
                      </DetailLink>
                    ) : (
                      (brewLog.grinderName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Recipe" stacked>
                    {brewLog.recipeId ? (
                      <DetailLink to={`/recipes/${brewLog.recipeId}`}>
                        {brewLog.recipeName ?? 'View recipe'}
                      </DetailLink>
                    ) : (
                      (brewLog.recipeName ?? '—')
                    )}
                  </DetailField>
                  <DetailField label="Accessories" stacked>
                    {accessoriesText}
                  </DetailField>
                </div>
              </DetailSection>

              <DetailSection id="brew-notes-heading" title="Notes and adjustments">
                {notes || adjustmentIdeas ? (
                  <div className="grid gap-5">
                    {notes ? <NotesBlock title="Notes">{notes}</NotesBlock> : null}
                    {adjustmentIdeas ? (
                      <NotesBlock title="Adjustments">{adjustmentIdeas}</NotesBlock>
                    ) : null}
                  </div>
                ) : (
                  <p className="leading-relaxed text-muted-foreground">
                    No notes or adjustment ideas were recorded for this brew.
                  </p>
                )}
              </DetailSection>
            </div>

            <div className="space-y-8">
              <DetailSection id="brew-parameters-heading" title="Brew parameters">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Dose" stacked>
                    {dose}
                  </DetailField>
                  <DetailField label="Water" stacked>
                    {waterAmount}
                  </DetailField>
                  <DetailField label="Brew ratio" stacked>
                    {brewRatio}
                  </DetailField>
                  <DetailField label="Water temperature" stacked>
                    {brewLog.waterTemperature !== null &&
                    brewLog.waterTemperature !== undefined
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
              </DetailSection>

              <DetailSection id="brew-result-heading" title="Result">
                <div className="grid gap-4 sm:grid-cols-3">
                  <DetailField label="Rating" stacked>
                    <RatingValue rating={brewLog.rating} />
                  </DetailField>
                  <DetailField label="Bean cost" stacked>
                    {formatPrice(brewLog.beanCostPerCup)}
                  </DetailField>
                  <DetailField label="Brew date" stacked>
                    {brewDate}
                  </DetailField>
                </div>
              </DetailSection>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        entityName={`brew log for ${brewTitle}`}
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
