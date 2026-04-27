import type { Guid } from '@/lib/api-types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmojiRatingPicker } from '@/features/brew-log/components/EmojiRatingPicker'
import { useSetBrewLogRating } from '@/features/brew-log/hooks/useSetBrewLogRating'

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
  const { mutateAsync, isPending } = useSetBrewLogRating()

  const handleRatingChange = (rating: number | undefined) => {
    if (rating === undefined || isPending) {
      return
    }

    void (async () => {
      await mutateAsync({ id: brewLogId, rating })
      onOpenChange(false)
    })()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate brew</DialogTitle>
          <DialogDescription>Choose a rating for {beanDisplayName}.</DialogDescription>
        </DialogHeader>

        <div className={isPending ? 'pointer-events-none opacity-60' : undefined}>
          <EmojiRatingPicker
            value={undefined}
            onChange={handleRatingChange}
            className="justify-center"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
