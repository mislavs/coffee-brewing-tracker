import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Guid } from '@/lib/api-types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import { useSetBrewLogRating } from '@/features/brew-log/hooks/useSetBrewLogRating'
import { useUpdateBrewLog } from '@/features/brew-log/hooks/useUpdateBrewLog'
import { brewLogQueryKeys } from '@/features/brew-log/queryKeys'
import { apiClient } from '@/lib/api-client'

type RateBrewDialogProps = {
  brewLogId: Guid
  beanDisplayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RateBrewDialog({
  brewLogId,
  beanDisplayName,
  open,
  onOpenChange,
}: RateBrewDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | undefined>()
  const [notesDraft, setNotesDraft] = useState<string | undefined>()
  const [adjustmentIdeasDraft, setAdjustmentIdeasDraft] = useState<string | undefined>()
  const { mutateAsync: setRating, isPending: isSettingRating } = useSetBrewLogRating()
  const { mutateAsync: updateBrewLog, isPending: isUpdatingBrewLog } = useUpdateBrewLog()
  const brewLogQuery = useQuery({
    queryKey: brewLogQueryKeys.detail(brewLogId),
    queryFn: async () => {
      const brewLog = await apiClient.api.brewLogs.byId(brewLogId).get()
      if (!brewLog) {
        throw new Error('Brew log not found.')
      }

      return brewLog
    },
    enabled: open && isExpanded,
  })
  const isFetchingBrewLog = isExpanded && brewLogQuery.isPending
  const isBusy = isSettingRating || isUpdatingBrewLog || isFetchingBrewLog
  const notes = notesDraft ?? brewLogQuery.data?.notes ?? ''
  const adjustmentIdeas =
    adjustmentIdeasDraft ?? brewLogQuery.data?.adjustmentIdeas ?? ''

  const resetDialogState = () => {
    setIsExpanded(false)
    setSelectedRating(undefined)
    setNotesDraft(undefined)
    setAdjustmentIdeasDraft(undefined)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState()
    }

    onOpenChange(nextOpen)
  }

  const handleRatingChange = (rating: number | undefined) => {
    if (isExpanded) {
      setSelectedRating(rating)
      return
    }

    if (rating === undefined || isSettingRating) {
      return
    }

    void (async () => {
      await setRating({ id: brewLogId, rating })
      handleOpenChange(false)
    })()
  }

  const handleSave = () => {
    const brewLog = brewLogQuery.data
    if (!brewLog || selectedRating === undefined || isBusy) {
      return
    }

    void (async () => {
      await updateBrewLog({
        id: brewLogId,
        request: {
          beanId: brewLog.beanId,
          brewerId: brewLog.brewerId,
          grinderId: brewLog.grinderId,
          recipeId: brewLog.recipeId,
          accessoryIds:
            brewLog.accessories
              ?.map((accessory) => accessory.id)
              .filter((id): id is Guid => Boolean(id)) ?? null,
          dose: brewLog.dose,
          waterAmount: brewLog.waterAmount,
          waterTemperature: brewLog.waterTemperature,
          grindSize: brewLog.grindSize,
          brewTimeSeconds: brewLog.brewTimeSeconds,
          rating: selectedRating,
          notes: normalizeOptionalText(notes),
          adjustmentIdeas: normalizeOptionalText(adjustmentIdeas),
          brewedAt: brewLog.brewedAt,
        },
      })
      handleOpenChange(false)
    })()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate brew</DialogTitle>
          <DialogDescription>Choose a rating for {beanDisplayName}.</DialogDescription>
        </DialogHeader>

        <div className={isBusy ? 'pointer-events-none opacity-60' : undefined}>
          <EmojiRatingPicker
            value={selectedRating}
            onChange={handleRatingChange}
            className="justify-center"
          />
        </div>

        {isExpanded ? (
          <div className="space-y-4">
            {brewLogQuery.isPending ? (
              <p className="text-sm text-muted-foreground">Loading brew notes...</p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="rate-brew-notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="rate-brew-notes"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="rate-brew-adjustment-ideas"
                  className="text-sm font-medium"
                >
                  Adjustment ideas
                </label>
                <Textarea
                  id="rate-brew-adjustment-ideas"
                  rows={4}
                  value={adjustmentIdeas}
                  onChange={(event) => setAdjustmentIdeasDraft(event.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={selectedRating === undefined || isBusy || !brewLogQuery.data}
              >
                {isUpdatingBrewLog ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              disabled={isSettingRating}
            >
              Add additional notes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
