import { useState, type FormEvent } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import type { BrewLogLowStockPrompt } from '@/features/brew-log/brewLogLowStockUtils'
import { useBeanReview } from '@/features/beans/hooks/useBeanReview'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'

type BrewLogLowStockPromptDialogProps = {
  prompt: BrewLogLowStockPrompt | null
  onOpenChange: (open: boolean) => void
  onCompleted: () => void
}

type DialogStage = 'confirm' | 'review'

function getOptionalRating(value: number | null | undefined) {
  return typeof value === 'number' && value >= 1 && value <= 5
    ? value
    : undefined
}

export function BrewLogLowStockPromptDialog({
  prompt,
  onOpenChange,
  onCompleted,
}: BrewLogLowStockPromptDialogProps) {
  const [stage, setStage] = useState<DialogStage>('confirm')
  const [rating, setRating] = useState<number | undefined>()
  const [notes, setNotes] = useState('')
  const [draftBeanId, setDraftBeanId] = useState<string | null>(null)
  const beanQuery = useBeanReview(prompt?.beanId ?? null)
  const availabilityMutation = useSetBeanAvailability()

  const isSaving = availabilityMutation.isPending

  const resetDialog = () => {
    setStage('confirm')
    setRating(undefined)
    setNotes('')
    setDraftBeanId(null)
    availabilityMutation.reset()
  }

  const closeDialog = () => {
    if (isSaving) {
      return
    }

    resetDialog()
    onOpenChange(false)
  }

  const beginReview = () => {
    if (!prompt || !beanQuery.data) {
      return
    }

    if (draftBeanId !== prompt.beanId) {
      setRating(
        getOptionalRating(beanQuery.data.suggestedRating) ??
          getOptionalRating(beanQuery.data.rating),
      )
      setNotes(beanQuery.data.notes ?? '')
      setDraftBeanId(prompt.beanId)
    }

    availabilityMutation.reset()
    setStage('review')
  }

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!prompt || isSaving) {
      return
    }

    try {
      await availabilityMutation.mutateAsync({
        id: prompt.beanId,
        isAvailable: false,
        review: {
          rating: rating ?? null,
          notes: notes.trim() || null,
        },
      })
      resetDialog()
      onCompleted()
    } catch {
      // The mutation retains the error and the draft remains editable for retry.
    }
  }

  return (
    <AlertDialog
      open={Boolean(prompt)}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        }
      }}
    >
      <AlertDialogContent>
        {stage === 'confirm' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark bean as unavailable?</AlertDialogTitle>
              <AlertDialogDescription>
                {`Only ${prompt?.remainingQuantity.toFixed(1) ?? '0.0'}g remains for this bean. Do you want to mark it unavailable?`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {beanQuery.isPending ? (
              <div
                className="space-y-2"
                role="status"
                aria-live="polite"
                aria-label="Loading bean review"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : null}

            {beanQuery.isError ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive" role="alert">
                  We couldn&apos;t load the bean&apos;s current review. Try
                  again before continuing so existing notes aren&apos;t lost.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={beanQuery.isFetching}
                  onClick={() => void beanQuery.refetch()}
                >
                  {beanQuery.isFetching ? 'Retrying...' : 'Retry'}
                </Button>
              </div>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isSaving}
                onClick={(event) => {
                  event.preventDefault()
                  closeDialog()
                }}
              >
                Keep available
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!beanQuery.data || beanQuery.isError}
                onClick={(event) => {
                  event.preventDefault()
                  beginReview()
                }}
              >
                Review &amp; mark unavailable
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <form className="space-y-5" onSubmit={saveReview}>
            <AlertDialogHeader>
              <AlertDialogTitle>Finish this bean</AlertDialogTitle>
              <AlertDialogDescription>
                Review your overall rating and notes before making the bean
                unavailable.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <fieldset className="space-y-3" disabled={isSaving}>
              <legend className="text-sm font-medium">Bean rating</legend>
              <EmojiRatingPicker
                value={rating}
                onChange={(nextRating) => {
                  availabilityMutation.reset()
                  setRating(nextRating)
                }}
                ariaLabel="Bean rating"
              />
              {getOptionalRating(beanQuery.data?.suggestedRating) ? (
                <p className="text-sm text-muted-foreground">
                  Suggested {beanQuery.data?.suggestedRating}/5 from your
                  highest-rated brew. You can change or clear it.
                </p>
              ) : getOptionalRating(beanQuery.data?.rating) ? (
                <p className="text-sm text-muted-foreground">
                  No rated brews yet. Your existing bean rating is selected,
                  and you can change or clear it.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No rated brews yet. Choose an overall rating or leave it
                  blank.
                </p>
              )}
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="bean-final-notes" className="text-sm font-medium">
                Bean notes
              </label>
              <Textarea
                id="bean-final-notes"
                rows={5}
                maxLength={2000}
                value={notes}
                disabled={isSaving}
                onChange={(event) => {
                  availabilityMutation.reset()
                  setNotes(event.target.value)
                }}
                placeholder="What stood out, and would you buy these beans again?"
              />
              <p className="text-xs text-muted-foreground">
                Updates the notes already stored for this bean.
              </p>
            </div>

            {availabilityMutation.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {availabilityMutation.error instanceof Error
                  ? availabilityMutation.error.message
                  : 'Could not save the bean review. Check your connection and try again.'}
              </p>
            ) : null}

            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  availabilityMutation.reset()
                  setStage('confirm')
                }}
              >
                Back
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save & mark unavailable'}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
